import React, { useState, useEffect, useRef } from 'react'
import { connect, useDispatch, useLocation } from '@umijs/max';
import { history, RuntimeAntdConfig } from "umi";
import { LeftOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import GraphDrawer from '@/pages/KG/components/GraphDrawer';
import { Layout, Dropdown, Button, message, Tooltip, Modal } from 'antd';
import { ZYIcon } from "@/components";

import "./index.less"


const { Header } = Layout;
const App = (props: any) => {

  const { updataSubject } = props
  const { curSubject } = props?.kgDescModel
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const dispatch = useDispatch();
  const formRef = useRef(); // 表单
  const [modal, contextHolder] = Modal.useModal();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}"); // 用户信息
  // 给 coursetype 定义为数字类型，以便在模板中使用
  const coursetype = searchParams.get("coursetype"); // 全部==2 或者是 我的==3
  // useEffect(() => {
  //     updataSubject?.()
  // }, [subjectData])
  const [coursetypeId, setCoursetype] = useState<number>(Number(coursetype)); // 课程类型

  // 搜索

  const onClickBack = () => {
    history.back();
  }

  const onClickRename = (event: any) => {
    event.stopPropagation(); // 阻止事件冒泡
    formRef?.current?.showModal?.("edit", curSubject)
  }

  const dropdownItems = [
    {
      key: 'rename',
      label: <span>修改简介</span>,
    },
    // {
    //   key: 'edit',
    //   label: <span>编辑</span>,
    // },
    {
      key: '3',
      label: '发布状态',
      children: [
        {
          key: 'pub',
          label: <div className="pub-pri">
            <p className="pub"><span className="pub-text">公开</span>  {curSubject?.is_public == 1 && <span className="pub-icon"><CheckOutlined /></span>}  </p>
            <p className="pri">发布到学科知识图谱</p>
          </div>,
        },
        {
          key: 'pri',
          label: <div className="pub-pri">
            <p className="pub"><span className="pub-text">私密</span>  {curSubject?.is_public == 0 && <span className="pub-icon"><CheckOutlined /></span>}  </p>
            <p className="pri">仅自己可见</p>
          </div>,
        },
      ],
    },
    {
      key: 'delete',
      label: <span className='text-red-500' >删除</span>,
    },
  ];

  const onClickPub = async (event: any) => {
    event.stopPropagation(); // 阻止事件冒泡
    const { code, data = [] }: any = await dispatch({
      type: "k12Model/postData",
      apiUrl: "pubGrapUrl",
      payload: { graph_id: curSubject["id"], is_public: 1 }
    });
    if (code == 200) {
      message.success("发布成功")
      props?.onReload?.()
      updataSubject?.()
    }
  }
  const onClickPri = async (event: any) => {
    event.stopPropagation(); // 阻止事件冒泡
    const { code, data = [] }: any = await dispatch({
      type: "k12Model/postData",
      apiUrl: "pubGrapUrl",
      payload: { graph_id: curSubject["id"], is_public: 0 }
    });
    if (code == 200) {
      message.success("发布成功")
      props?.onReload?.()
      updataSubject?.()
    }
  }


  const onSelect = (param: any) => {

    const { key, domEvent } = param
    if (key == "rename") onClickRename(domEvent)
    // if (key == "edit") onClickEdit()
    if (key == "pub") onClickPub(domEvent)
    if (key == "pri") onClickPri(domEvent)
    if (key == "delete") onClickDel(domEvent)
  }

  const onClickDel = (event: any) => {
    event.stopPropagation(); // 阻止事件冒泡
    modal.confirm({
      title: <div>
        <span>你确定删除<span style={{ marginLeft: '4px' }}>{curSubject?.graph_name || ""}</span></span>
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
        delFn(curSubject)
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  const delFn = async (param: any) => {
    const { code, data = [] }: any = await dispatch({
      type: "k12Model/postData",
      apiUrl: "delGrapUrl",
      payload: { id: param["id"] }
    });
    if (code == 200) {
      message.success("成功")
      props?.onReload?.()
      // 跳转到我的知识图谱后退一步
      history.back()
    }
  }


  return (
    <>
      <Header className='kg_desc_header'>
        <div>
          <LeftOutlined onClick={onClickBack} />
          <span className='kg_title'>{curSubject?.graph_name || "知识图谱名称"}</span>
        </div>

        {
          userInfo?.name == curSubject?.created_name && coursetypeId == 3 && (
            <div className='kg_desc_header_right'>
              <Dropdown
                placement="bottom"
                overlayClassName="menu-icon"
                menu={{ items: dropdownItems, onClick: onSelect }}
                className="menu-icon-btn"
              >
                <Button className='kg_desc_header_btn' size='small'>
                  <ZYIcon type="shezhi" />
                  <span>设置</span>
                </Button>
              </Dropdown>
            </div>
          )

        }

      </Header>
      {contextHolder}
      <GraphDrawer {...props} onRef={formRef} onSuccess={props?.onReload} />
    </>
  )
}
export default connect((state: any) => ({
  commonModel: state.commonModel,
  kgDescModel: state.kgDescModel,
}))(App);
