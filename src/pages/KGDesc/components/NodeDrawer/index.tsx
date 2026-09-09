import React, { useState, useEffect, useImperativeHandle, useRef } from 'react'
import { Button, Form, Input, Drawer, Cascader, Select } from 'antd';
import { connect, useDispatch, useLocation } from '@umijs/max';
import {handleName } from "@/utils";
import "./index.less"
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import CustomSelect from '../CustomSelect';
import ZYIcon from "@/components/ZYIcon"

const typeObj = {
  "add": "创建节点",
  "edit": "编辑节点",
}


// node_type:
// RootPoint  #根节点
// DocPoint  #一级节点
// LearningPoint #知识节点
// PowerPoint #能力节点


let levelObj = {}

const App = (props: any) => {
  const { onRef,doc_ids} = props;  
  const Custom = useRef(null); // 自定义标签
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const space_id = searchParams.get("courseId"); // 课程id

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({}); // 缓存编辑带过来的数据
  const [actType, setActType] = useState('add');
  const [laoding, setLoading] = useState(false); // 水平数据
  const [levelList, setLevelList] = useState([]); // 水平数据

  const { TextArea } = Input;
  const [relevantdata, setRelevantdata] = useState([]); // 相关数据


  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    showModal: (category = "add", param?: any) => {
      setOpen(true);
      setLoading(false);
      setActType(category);
      setCurRow(param || {})
      setRelevantdata(param?.source || [])
      if (category == "add") clearForm() // 添加初始化，清空之前表单信息
      if (category == "edit") initForm(param) // 修改初始化，

    },
  }));


  const onClose = () => {
    setOpen(false);
  };


  // 构建 level map
  const getLevelMap = (dataList: any, pIdArr: any) => {
    for (const param of dataList) {
      const { id, children } = param;
      const newArr = [...pIdArr, id]
      if (children?.length == 0) {
        const id_str = newArr.join("_")
        levelObj[id_str] = newArr
      }
      if (children?.length > 0) {
        getLevelMap(children, newArr)
      }
    }

  }



  // 初始化表单
  const initForm = async (param: any) => {
    const res = await getLevel()
    getLevelMap(res, [])
    const { applicableLevel, ...rest } = param;
    const firstKey = Object.keys(levelObj)[0];
    let curLevel = levelObj[applicableLevel.join("_")] // 当前视频
    if (!curLevel) {
      curLevel = levelObj[firstKey]  // 默认取第一个
    }

    form.setFieldsValue({ ...rest, applicableLevel: curLevel });
    setCurRow(param)

  }

  // 清空表单
  const clearForm = () => {
    form.resetFields();
    getLevel()
    setRelevantdata([]); // 清空相关数据

  }

  //  表单提交
  const handleOk = () => {
    form.submit()
  };

  // 取消弹框
  const handleCancel = () => {
    setOpen(false);
    setLoading(false);
    props?.onLoadData?.() // 加载表格
  };



  const onFinish = async (param: any) => {
    setLoading(true)
    const payload = {
      ...param,
      space_id,
      doc_id: doc_ids[0],
      source: source()
    }
    if (actType == "add") {
      await addData(payload)
    }
    if (actType == "edit") {
      await updData(payload)
    }
    setLoading(false)
  };




  // 添加数据
  const addData = async (values?: any) => {
    // todo 
    values["node_type"] = "LearningPoint"
    let { code, data, msg } = await dispatch({
      type: 'kgDescModel/postData',
      apiUrl: "addNodeUrl",
      isInfo: true, // api 请求成功提示
      payload: {
        source: source(),
        ...values
      }
    });
    if (code == 200 && msg !== "节点已存在") {
      props?.onAddSuccess?.({ ...data, ...values })
      handleCancel()
    }
  }
  const source = () => {    
    const sou = relevantdata?.map((item: any) => {
      return {
        doc_id: item?.id || item?.doc_id,
        page_idx: item?.page_idx,
        doc_name: item?.doc_name,
        doc_ext: item?.file_type || item?.doc_ext,
      }
    })
    return sou
  }
  const getLevel = async (payload = {}) => {
    const { code, data = [] }: any = await dispatch({
      type: "k12Model/getData",
      apiUrl: "levelGraphUrl",
      payload
    });
    setLevelList(data)
    return data

  }


  // 修改数据
  const updData = async (values?: any) => {

    let { code, data, msg } = await dispatch({
      type: 'kgDescModel/postData',
      apiUrl: "updNodeUrl",
      isInfo: true, // api 请求成功提示
      payload: {
        source: source(),
        ...values,
        node_id: curRow["id"],
        doc_id: curRow?.["doc_id"] || ""
      }
    });
    if (code == 200 && msg !== "节点已存在") {
      props?.onEditSuccess?.({ ...values })
      handleCancel()
    }
  }


  const onFinishFailed = () => {
    // setIsModalOpen(false);
  };

  const addShowModal = () => {
    console.log("addShowModal");
    Custom.current?.showFication()

  }
  // const closeShowModal = () => {
  //   setCustomopen(false);
  // }
  const materials = (
    <div className='items-materials'><span className='items-materials-title' >材料关联</span><span className='items-materials-add' onClick={addShowModal} ><ZYIcon type="jia" /> 添加</span> </div>
  )
  const onClosedata = (relevant: any) => {
    // 把 relevant这个对象 添加到relevantdata数组中，并更新状态
    setRelevantdata([relevant,...relevantdata]);
  }
  // 删除 材料关联的元素
  const trashdel = (item: any, index: number) => {
    console.log("trashdel", item, index);
    // 通过index删除relevantdata数组中的元素
    relevantdata.splice(index, 1);
    setRelevantdata([...relevantdata]);
  }
  
  return (

    <div >
      <Drawer
        title={`${typeObj[actType]}`}
        closable={{ 'aria-label': 'Close Button' }}
        onClose={onClose}
        open={open}
        width={480}
        footer={
          <div className='text-right'>
            <Button onClick={onClose} className='mr-8'>取消</Button>
            <Button onClick={handleOk} loading={laoding} type="primary">确定</Button>
          </div>
        }
      >
        <Form
          name="userForm"
          labelCol={{ span: 20 }}
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          className='select-drawer'

        >
          <Form.Item
            label="节点名称"
            name="title"
            rules={[{ required: true, message: '请输入节点名称', max: 20 }]}
          >
            <Input disabled={actType == "edit" ? true : false} placeholder="请输入节点名称" showCount maxLength={20} />
          </Form.Item>
          <Form.Item
            label="能力要求"
            name="competency"
            rules={[{ required: true, message: '请选择能力要求' }]}
          >
            <Select
              showSearch
              placeholder="请选择能力要求"
              options={[
                { "value": "记忆", "label": "记忆" },
                { "value": "理解", "label": "理解" },
                { "value": "应用", "label": "应用" },
                { "value": "分析", "label": "分析" },
                { "value": "评价", "label": "评价" },
                { "value": "创造", "label": "创造" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="扩展属性"
            name="knowledgeType"
            rules={[{ required: true, message: '请选择扩展属性' }]}
          >
            <Select
              showSearch
              placeholder="请选择扩展属性"
              options={[
                { "value": "概念", "label": "概念" },
                { "value": "定义", "label": "定义" },
                { "value": "公式", "label": "公式" },
                { "value": "规则", "label": "规则" },
                { "value": "原理", "label": "原理" },
                { "value": "其他", "label": "其他" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="适用水平"
            name="applicableLevel"
            rules={[{ required: true, message: '请选择适用水平' }]}
          >
            <Cascader
              fieldNames={{ label: "name", value: "id", children: "children" }}
              options={levelList}
              placeholder="请选择适用水平" />
          </Form.Item>

          <Form.Item
            label="节点描述"
            name="description"

            rules={[{ required: true, message: '请输入节点描述', max: 30 }]}
          >
            <TextArea showCount rows={4} placeholder="请输入节点描述" maxLength={30} />
          </Form.Item>
          <Form.Item
            label={materials}
            name="请输入关联知识点"
            rules={[{ message: '请输入关联知识点', max: 20 }]}
            className='guanlian-materials'
          >

            <CustomSelect onRef={Custom} onClosedata={onClosedata}></CustomSelect>

            {
              relevantdata && (
                <div>
                  {
                    source()?.map((item: any, index: number) => {
                      return <div key={index} className='items-materials-list'>
                        <div className='items-materials-list-item'>
                          <div className='items-materials-list-item-img'>
                              <ZYIcon type={handleName(item.doc_name, item.doc_ext).icon} /> 
                          </div>
                          <div className='items-materials-list-item-content'>
                            <span className='items-materials-list-item-content-name'>{handleName(item.doc_name).name}</span>
                            <span className='items-materials-list-item-content-page'>已选第{item.page_idx}页</span>
                          </div>
                        </div>
                        <div className='trash-icon' onClick={() => trashdel(item, index)}>
                          <DeleteOutlined />
                        </div>
                      </div>
                    })
                  }
                </div>
              )
            }
          </Form.Item>
        </Form>

      </Drawer>

    </div>

  )
}



export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
  k12Model: state.k12Model,
}))(App);
