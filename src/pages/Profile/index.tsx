import { connect, useDispatch, history } from "umi";
import {
  Button,
  Form,
  Input,
  message,
  Card,
  Avatar,
  Modal,
  Select,
  Segmented
} from "antd";
import { getCurOrgValue, getUserInfo, uuid } from "@/utils";
import { SwapOutlined } from "@ant-design/icons";
import "./index.less";
import { useEffect, useState } from "react";
import ZYIcon from "@/components/ZYIcon";
import EditPassword from "@/components/EditPassword";
import { getOrgId } from "@/utils";

const App = (props: any) => {
  const { profileModel } = props;
  const { loading } = profileModel;
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [userInfo, setUserInfo] = useState<any>(null);
  const [modal, contextHolder] = Modal.useModal();
  const [editPasswordModal, setEditPasswordModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState(1);
  const [open, setOpen] = useState(false);
  const [segmentedValue, setSegmentedValue] = useState<string>("关联教学班");
  const [classData, setClassData] = useState<any>([]);
  const [deptData, setDeptData] = useState<any>([]);
  const [postorgclassUrl, setPostorgClassUrl] = useState<any>();

  useEffect(() => {
    getProfile();
  }, []);
  useEffect(() => {
    postorgClassUrl();
  },[])

  const getProfile = async () => {
    let { code, data = {}, message: msg }: any = await dispatch({
      type: "loginModel/getData",
      apiUrl: "getUserInfoUrl",
      payload: {},
    });

    if (code !== 200) return message.error(msg || "获取失败");
    if (code === 200) {
      setUserInfo(data);
      setClassData(data?.group_list?.filter((item: any) => item.classType === 'class'));
      setDeptData(data?.group_list?.filter((item: any) => item.classType === 'dept'));
      form.setFieldsValue({ ...data });
    }
  };

  const onFinish = async (values: any) => {
    let {
      code,
      data,
      message: msg,
    } = await dispatch({
      type: "profileModel/postData",
      apiUrl: "updUrl",
      payload: {
        id: getUserInfo("id"),
        ...userInfo,
        ...values,
      },
    });

    if (code !== 200) return message.error(msg || "修改失败");
    if (code === 200) {
      // localStorage.setItem("accessToken", data.__token)
      // localStorage.setItem("userInfo", JSON.stringify(data))
      message.success("修改成功");

      // 更新localStorage
      let userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...userInfo, ...values }),
      );

      dispatch({
        type: "commonModel/updateState",
        res: {
          avatarChange: true,
          userInfo: { ...userInfo, ...values },
        },
      });
      setIsModalOpen(false);
      getProfile();
    }
  };

  // list渲染tag
  // const getList = (list: [], color: string) => {
  //   return list?.map((item: any) => {
  //     return item?.title ? <Tag color={color}>{item?.title}</Tag> : "";
  //   });
  // };

  const onFinishFailed = () => {
    // setIsModalOpen(false);
  };

  const handleSuffixClick = (e: any) => {
    e.stopPropagation(); // 防止触发其他事件
    setOpen((prev) => !prev);
  };
  const changeSchool = async(value: any, option: any) => {

    const { code, data }: any = await dispatch({
      type: "homePageModel/postData",
      apiUrl: "postSaveDefaultOrgUrl",
      payload: {
        org_id: option?.id,
      }
    })
    if (code == 200) {
      localStorage.setItem("curOrg", JSON.stringify(option)); // 设置当前组织
      window.location.reload();
    }
  }
  //展示组织
  const getSchoolFn = () => {
    return (
      <div className="logout_btn select_box">
        <span className="select_title">
          <Select
            style={{ width: "100%" }}
            open={open}
            onDropdownVisibleChange={setOpen}
            placeholder="请选择"
            size={"small"}
            popupMatchSelectWidth={false}
            suffixIcon={
              <SwapOutlined
                onClick={handleSuffixClick}
                style={{ cursor: "pointer", color: "#fff" }}
              />
            }
            value={getCurOrgValue()}
            onChange={(value, option) => changeSchool(value, option)}
            options={
              getUserInfo("org_list")?.map?.((item: any) => ({
                ...item,
                label: item?.title,
                value: item?.id,
              })) || []
            }
          />
        </span>
      </div>
    );
    // return userInfo?.org_list?.[0]?.title || "";
  };

  const queryDeptList = async (title = "") => {
    console.log("获取列表");
    let payload: any = { org_id: getOrgId() };
    if (title) {
      payload = { ...payload, title };
    }
    const { code, data }: any = await dispatch({
      type: "teamModel/postData",
      apiUrl: "groupListUrl",
      mTitle: "groupListObj",
      mLoading: "GroupLoading",
      payload: payload,
    });
  };

  const chatEmptyComponent = () => {
    return (
      <div className="profile_box_center_bottom_content_empty">
        <div>
          <ZYIcon type="kongbanji" style={{ fontSize: "80px" }} />
        </div>
        <div className="profile_box_center_bottom_content_empty_title">
          还没有关联班级
        </div>
      </div>
    );
  };

  const onLogout = () => {
    modal.confirm({
      title: (
        <div>
          <span>你确定退出登录吗？</span>
        </div>
      ),
      // icon: <ExclamationCircleOutlined />,
      content: "",
      onOk: async () => {
        // let { code, data, message: msg }: any = await dispatch({
        //   type: "profileModel/getData",
        //   apiUrl: "logoutUrl",
        //   payload: {}
        // });

        // if (code !== 200) return message.error(msg || "请求失败");
        // if (code === 200) {
          localStorage.clear();
          history.push("/login");
        // }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };
  // 获取班级列表
  const postorgClassUrl = async ()=>{
    const { code, data }: any = await dispatch({
      type: "profileModel/postData",
      apiUrl: "postorgClassUrl",
      payload: {}
    })
    if(code == 200) {
      setPostorgClassUrl(data)
    }
  }

  const goToLookTeamMember = (item: any) => {
    console.log("点击班级card", item);
    // history.push("/team/member?auth=0");
    history.push(`/team/linkClass?auth=0&class_id=${item.id}&classname=${item?.name}`);
  };

  const gradeListRender = (list:any)=>{
    let text = ''
    list?.map((val:any,k:any)=>{
      if(list?.length- 1 == k) {
        text += `${val?.stageName}/${val?.gradeName}`
      }else {
        text += `${val?.stageName}/${val?.gradeName}、`
      }
    })
    return text
  }

  const cardComponent = (item: any, index: any) => {
    return (
      <div className="group_page_card_box" key={index}>
        <Card
          className="group_page_card"
          key={index}
          onClick={() => goToLookTeamMember(item)}
        >
          <div className="team_page_cardTitle">
            <div className="team_page_cardTitle_box">{item.name}</div>
            <div className="team_page_card_icon_box">
              <span className="team_page_card_edit" onClick={() => { }}></span>
              <span className="team_page_card_del" onClick={() => { }}></span>
            </div>
          </div>
          <div className="team_page_cardInfo">{item.info}</div>
          <div className="team_page_cardFoot_css">
            {/* {item?.stageName && item?.gradeName ? <span>{item?.stageName + '/' + item?.gradeName}</span> : <span></span>} */}
            <span className="team_page_class_css">{gradeListRender(item?.gradeList)}</span>
            {/* <span>{item?.userCount}名成员</span> */}
            {/* <GroupUserAdd currDept={item} onload={queryDeptList} /> */}
          </div>
        </Card>
      </div>
      // <div className="profile_box_center_bottom_content_card" key={index}>
      //   <div className="profile_box_center_bottom_content_class">
      //     {item?.title}
      //   </div>
      //   <div className="profile_box_center_bottom_content_member">
      //     <span>{item?.user_list?.length}名成员</span>
      //     <span className="profile_box_center_bottom_content_member_btn">
      //       <GroupUserAdd currDept={item} onload={queryDeptList} />
      //     </span>
      //   </div>
      // </div>
    );
  };

  return (
    <div className="profile_box">
      <div className="profile_box_center">
        <div className="profile_box_center_title">个人中心</div>
        <div className="profile_box_center_content">
          <div className="profile_box_center_content_left">
            <div className="profile_box_center_content_left_left">
              <div className="profile_box_center_content_left_left_avatar">
                <Avatar size={100} src={require(`@/assets/menu/avatar.svg`).default} />
              </div>
              <div className="profile_box_center_content_left_left_info">
                {userInfo && (
                  <>
                    <div className="profile_box_center_content_left_left_info_name">
                      {userInfo?.name || "用户"}
                      {/* <ZYIcon
                        type="edit1"
                        className="profile_icon_css"
                        style={{
                          marginLeft: "8px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                        onClick={() => {
                          setType(1);
                          setIsModalOpen(true);
                        }}
                      /> */}
                    </div>

                    <div className="profile_box_center_content_left_left_info_school">
                      {/* {getSchoolFn() || "学校"} */}
                    </div>
                    {/* <div className="profile_box_center_content_left_left_info_way">
                      <ZYIcon
                        type="phone"
                        style={{
                          marginRight: "8px",
                          transform: "translateY(1px)",
                        }}
                      />
                      {userInfo?.phone} <span className="line">|</span>
                      <ZYIcon
                        type="email"
                        style={{
                          marginRight: "8px",
                          transform: "translateY(1px)",
                        }}
                      />
                      {userInfo?.email || "未填写"}
                      <ZYIcon
                        type="edit1"
                        className="profile_icon_css"
                        style={{
                          marginLeft: "8px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                        onClick={() => {
                          setType(2);
                          setIsModalOpen(true);
                        }}
                      />
                    </div> */}
                  </>
                )}
              </div>
            </div>
          </div>
          {userInfo && (
            <div className="profile_box_center_content_right">
              <div className="profile_box_center_content_right_content">
                {/* <Button
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    setEditPasswordModal(true);
                  }}
                >
                  <ZYIcon type="safety" />
                  修改密码
                </Button> */}
                <Button
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    onLogout();
                  }}
                >
                  <ZYIcon type="tuichu" /> 退出登录
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="profile_box_center_bottom">
          {/* <div className="profile_box_center_bottom_title">关联班级</div> */}
          {/* <Segmented<string>
            className="segmented"
            value={segmentedValue}
            options={['关联教学班', '关联行政班']}
            onChange={(value) => setSegmentedValue(value)}
          /> */}
          <div className="profile_box_center_bottom_content">
            {postorgclassUrl?.records?.length > 0 &&
              postorgclassUrl?.records?.map((item: any, index: any) => {
                return cardComponent(item, index);
              })}
          </div>
          {/* {(!userInfo || userInfo?.group_list?.length === 0) && chatEmptyComponent()} */}

          {/* <div className="profile_box_center_bottom_content">
            {segmentedValue === '关联教学班'
              ? <>{classData?.length > 0 && classData?.map((item: any, index: any) => cardComponent(item, index))}</>
              : <>{deptData?.length > 0 && deptData?.map((item: any, index: any) => cardComponent(item, index))}</>
            }
          </div> */}
          {(!userInfo || (classData?.length === 0 && deptData?.length === 0)) && chatEmptyComponent()}
        </div>
      </div>
      {contextHolder}
      {/* {editPasswordModal && (
        <EditPassword
          editPasswordModal={editPasswordModal}
          handleCancel={() => {
            setEditPasswordModal(false);
          }}
        />
      )} */}
{/* 
      <Modal
        forceRender={true} // 强制渲染 Modal
        destroyOnHidden={true} // 关闭时销毁 Modal 里的子元素
        width={500}
        title={type === 1 ? "修改用户名" : "修改邮箱"}
        open={isModalOpen}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        confirmLoading={loading}
        maskClosable={false}
      >
        <Form
          name="userForm"
          // labelCol={{ span: 4 }}
          // wrapperCol={{ span: 20 }}
          initialValues={{ remember: true }}
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          style={{ marginTop: "24px" }}
        >
          {type === 1 && (
            <Form.Item
              label=""
              name="name"
              rules={[
                {
                  required: true,
                  message: `请输入用户名`,
                },
              ]}
            >
              <Input style={{ width: "100%" }} placeholder="请输入用户名" />
            </Form.Item>
          )}
          {type == 2 && (
            <Form.Item
              label=""
              name="email"
              rules={[
                {
                  type: "email",
                  message: `请输入邮箱`,
                },
              ]}
            >
              <Input style={{ width: "100%" }} placeholder="请输入邮箱" />
            </Form.Item>
          )}
        </Form>
      </Modal> */}
    </div>
  );
};

export default connect((state: any) => ({
  loginModel: state.loginModel,
  profileModel: state.profileModel,
  homePageModel: state.homePageModel,
}))(App);
