
import { history, connect, Outlet, useDispatch, useLocation } from "@umijs/max";
import { Avatar, Button, Divider, Form, Input, message, Modal, Select, Space } from 'antd';
import { useEffect, useState } from "react";
import { formatStaticUrl, getSpaceInfo, setLocalSpaceInfo } from "@/utils";
import { EditOutlined, PlusOutlined,DeleteOutlined } from "@ant-design/icons";
import AvatarUpload from "@/components/AvatarUpload"
import defaultAvatar from '@/assets/avatar.png';

import { ZYIcon } from "@/components";
import "./index.less";


const menuList = [
  { id: "41", title: "智能体配置", icon: "flag", router: "/square/space/appcenter_v3/application" },
];


const typeObj = {
  "add": "创建新工作空间",
  "edit": "编辑新工作空间",
}



const SquareLayout = (props: any) => {

  const [modal, contextHolder] = Modal.useModal();
  const { onRef, commonModel } = props;
  const { spaceLoading, spaceListObj } = commonModel

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [actSpace, setActSpace] = useState({id:getSpaceInfo("id")});
  const [actType, setActType] = useState('add');


  const { pathname } = useLocation();

  // 判断当前应该显示哪个微前端容器
  const isAppCenterRoute = pathname.includes('/square/space/appcenter_v2');
  // const isKnowledgeRoute = pathname.includes('/square/space/appcenter_v4');
  const isKnowledgeRoute = false;


  useEffect(() => {
    getSpaceList() // 获取工具
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);



  const handleCancel = () => {
    setIsModalOpen(false);
  };


  const formatSpace = () => {

    return spaceListObj?.list?.map((item: any) => {
      return {
        ...item, value: item.id, label: <>

          <Avatar style={{ marginTop: '-2px' }} size={20} src={formatStaticUrl(item?.icon) || defaultAvatar} />
          <span style={{ marginLeft: '4px' }}>{item.title}</span>
          <span style={{ float: "right" }}>
            {/* <EditOutlined /> */}
          </span>
        </>
      }
    }) || []
  }



  // 获取列表
  const getSpaceList = async (params?: any) => {
    const { current, ...rest } = params || {}
    let payload: any = {
      pageIndex: current - 1 || 0,
      ...rest
    };
    let { code, data } = await dispatch({
      type: "commonModel/postData",
      apiUrl: "spaceListUrl",
      mTitle: 'spaceListObj',
      payload,
    });


    if(data?.list.length>0){
      const curSpaceId=getSpaceInfo("id")
      const tempSpace=data?.list.filter((item:any)=>item["id"]==curSpaceId)?.[0] || {"id":curSpaceId}
      setActSpace(tempSpace)
      setLocalSpaceInfo(tempSpace)
    }

  };




  const onSelectSpace = (value: any) => {
    const row = spaceListObj.list.filter((item: any) => item.id == value)?.[0]
    setLocalSpaceInfo(row)
    window.location.reload()

  }



  const onClickAddSpace = () => {
    setIsModalOpen(true);
    setActType("add")
    form.setFieldsValue({"title":"","icon":""}); // 重置表单

  }


  const addSpace = async (payload: any) => {
    return await dispatch({
      type: "commonModel/postData",
      apiUrl: "addSpaceUrl",
      mLoading: "spaceLoading",
      isInfo: true,
      payload,
    });
  }

  const editSpace = async (payload: any) => {
    return await dispatch({
      type: "commonModel/postData",
      apiUrl: "updSpaceUrl",
      mLoading: "spaceLoading",
      isInfo: true,
      payload: { ...payload, id: actSpace["id"] },
    });
  }


  const onFinish = async (values: any) => {
     const {title}=values
     if(title=="个人空间"){
      message.error('工作空间名称不能为"个人空间"')
      return
     }

    let res = null
    if (actType == "add") {
      res = await addSpace(values)
    }
    if (actType == "edit") {
      res = await editSpace(values)
    }
    if (res?.code == 200) {
      await getSpaceList()
      setIsModalOpen(false);
    }
  }


  const onClickEdit = (event: any, param: any) => {
    event.stopPropagation();
    setIsModalOpen(true);
    form.setFieldsValue(param); // 重置表单
    setActSpace(param)
    setActType("edit")
  }

  const onClickDel = (event: any, param: any) => {
    event.stopPropagation();
    console.log('param', param)
    modal.confirm({
      title: <div>
        <span>你确定删除<span style={{ marginLeft: '4px' }}>{ param?.title}?</span></span>
      </div>,
      icon: <DeleteOutlined style={{ color: 'red' }} />,
      content: '',
      okButtonProps: {
        style: {
          backgroundColor: 'red',
          color: 'white',
        },
      },
      onOk() {
        delFn(param)
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

    // 删除调接口
    const delFn = async (item:any) => {
      let payload: any = { id: item?.id }
      let { code } =  await dispatch({
        type: "commonModel/postData",
        apiUrl: "delSpaceUrl",
        mTitle: "spaceListObj",
        mLoading: "spaceLoading",
        payload
      });
      if (code == 200) {
        getSpaceList()
        message.success('操作成功')
      }
    }




  const getMenu = () => {

    // console.log("+++",actSpace["auth"])

    let temp = [...menuList]
    if(actSpace["auth"]!=="查看"){
      temp.push(...[
        { id: "42", title: "知识库", icon: "flow2", router: "/square/space/appcenter_v4/knowledge" },
        // { id: "43", title: "工作流", icon: "talk4", router: "/square/space/flow" },
        { id: "44", title: "工具集", icon: "video", router: "/square/space/appcenter_v5/plugin" },
      ])
    }

    if (actSpace["title"]!=="个人空间" && actSpace["auth"]!=="查看" ) {
      temp.push({ id: "45", title: "权限管理", icon: "tool4", router: "/square/space/auth" })
    }
    // temp.push({ id: "45", title: "权限管理", icon: "tool4", router: "/square/space/auth" })
    return temp
  }

  const flowExcludeRoute = ["/square/space/appcenter_v2/flow"].includes(
    history.location.pathname
  ); // 排除流程


  return (
    <>

      <div className="square_layout">
        <div className="side_sub"  style={{
            display: flowExcludeRoute ? "none" : "block",
          }}>

          <div className="side_sub_header">

            <Select
              popupMatchSelectWidth={false}
              value={getSpaceInfo("id")}
              onSelect={onSelectSpace}
              style={{ maxWidth: 140, width: '100%' }}
              options={formatSpace()}
              optionRender={(option) => {
                return <div className="space_item_container">
                  <div>
                    <Avatar style={{ marginTop: '-18px' }} size={24} src={formatStaticUrl(option?.data?.icon) || defaultAvatar} />
                    <span className="space_item_container_title"  style={{ marginLeft: '4px' }}>{option?.data?.title}</span>
                    </div>
                  <div>
                    {option?.data?.auth === "编辑" || option?.data?.auth == "所有者" &&
                      <span className="edit_icon" onClick={(event) => onClickEdit(event, option?.data)}>
                        <Button type="text" icon={<EditOutlined style={{ fontSize: '12px' }} />}></Button>
                      </span>
                    }
                    {option?.data?.auth === "所有者" && option?.data?.title !== '个人空间' &&
                      <span className="del_icon" onClick={(event) => onClickDel(event, option?.data)}>
                        <Button type="text" icon={<DeleteOutlined style={{ fontSize: '12px' }} />}></Button>
                      </span>
                    }
                  </div>
                </div>
              }}

              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ padding: '0 8px 4px', width: '100%' }}>
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusOutlined size={10} />}
                      onClick={onClickAddSpace}>创建新空间</Button>
                  </Space>
                </>
              )}
            />
          </div>


          {getMenu()?.map((item: any) => {
            return (
              <div
                className={`side_sub_item ${item.router == pathname ? "side_sub_item_active" : ""}`}
                key={item.id}
                onClick={() => history.push(item.router)}
              >
                <div className="side_sub_item_icon">
                  <ZYIcon type={item.icon} style={{ fontSize: 16 }} />
                </div>
                <div className="side_sub_item_title">{item.title}</div>
              </div>
            );
          })}
        </div>
        <div className="square_content">
          {/* 微前端容器 - 根据路由显示对应容器 */}
          {isAppCenterRoute && (
            <div id="appcenter-container" style={{ height: '100%', width: '100%' }}></div>
          )}
          {isKnowledgeRoute && (
            <div id="knowledge-container" style={{ height: '100%', width: '100%' }}></div>
          )}
          {/* 普通路由使用 Outlet */}
          {!isAppCenterRoute && !isKnowledgeRoute && <Outlet />}
        </div>
      </div>



      <Modal
        maskClosable={false}
        title={typeObj[actType]}
        width={460}
        open={isModalOpen}
        confirmLoading={spaceLoading}
        onOk={() => form.submit()}
        // okText="创建"
        onCancel={handleCancel}
      >

        <div className="space_body">
          <div className="space_body_title">请输入工作空间的名称，创建后您可以邀请成员并管理权限。</div>
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="form space_body_form"
            initialValues={{}}
          >

            {(actSpace?.["title"]!=="个人空间" || actType=="add" ) &&
            <Form.Item
              name="title"
              label="名称"
              rules={[
                { required: true, message: "请输入工作空间名称" },
              ]}
            >
              <Input
                showCount
                placeholder="请输入工作空间名称"
                maxLength={20}
              />
            </Form.Item>
            }


            <div style={{ marginBottom: "16px" }}>
              <Form.Item
                label=""
                name="icon"
              >
                <AvatarUpload title={"上传图片"} listType={"picture-card"}/>
              </Form.Item>
            </div>
          </Form>

        </div>
      </Modal>
      {contextHolder}

    </>
  );
};



export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(SquareLayout);
