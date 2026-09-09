import { useState, useEffect, useRef } from "react";
import { useDispatch, useLocation } from "umi";
import { Button, Dropdown, Empty, Skeleton, } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import CreateCard from "../CreateCard";
import { ZYIcon } from "@/components";
import { getUserInfo } from "@/utils";
import dayjs from "dayjs";
import { useTeacherContext } from '@/components/LayoutSider';

import "./index.less"


// 定义icon菜单选项
const menuItems = [
  {
    key: "edit",
    label: "编辑",
  },
  {
    key: "delete",
    label: "删除",
  },
];

const data = [
  // {
  //   id: 1,
  //   name: "一年级 1班—小猴子下山",
  //   created_name: getUserInfo("name"),
  //   updated_time: "2025-06-22 11:26:32",
  //   course_id:
  //     "0e411f9f48504bd995a85f181be0f7a2&tk=6ol5BCj/hEymLnBaC3rco2iFYAXXPIbmE0e+offuiQ5XwkfVMjOrWkBITRbe6fMAvWpgrAh6Iohyb56aqlcIW7+ZGi0dOM98baHrI29wbJw=",
  // },
  // {
  //   id: 2,
  //   name: "四年级 1班—四则运算",
  //   created_name: getUserInfo("name"),
  //   updated_time: "2025-06-17 11:26:32",
  //   course_id:
  //     "c50eb8f949fc4bbfbbc0d9a990badf4e&tk=USfadipIKbS/C/JZ33gNHGKneEyU4pKhr8oPZaEbU0xFSNcG7a630pSEPRoLkxNwATDeDpv8/91bn66ziobTclVGqgwqL7JbUdXl7zr2aj4=",
  // },
  // {
  //   id: 3,
  //   name: "四年级 1班—小数的意义",
  //   created_name: getUserInfo("name"),
  //   updated_time: "2025-06-22 11:26:32",
  //   course_id:
  //     "adae7b6e1de545fdbe9ce9580e590e54&tk=ahbBigYaZzuSdBO7JowVG83Q1vv8j9nbi2l9vTzZgIUwXekLxifZIqrtPcpDyqg8DRtv/ttfRgn8O8gdPz141L9SOIA95R/NNWtwuRRhTbo=",
  // },
  // {
  //   id: 4,
  //   name: "五年级 1班—刷子李",
  //   created_name: getUserInfo("name"),
  //   updated_time: "2025-06-21 11:26:32",
  //   course_id:
  //     "e0bdfabfc426486290300fa93d75345f&tk=UVS/ln3VJ+YmYvJUqzUttImBJpRHjZMtu6TKpnLJ2OaU29ObWLGjzzFNScu720bXUlrgAMX9U7QTqcf0LDMVM+C4mWk7WHdoY12aN0Rkaz4=",
  // },
  // {
  //   id: 5,
  //   name: "五年级 1班—红楼春趣",
  //   created_name: getUserInfo("name"),
  //   updated_time: "2025-06-15 11:26:32",
  //   course_id:
  //     "2ce0917afb084112bca4b9dd42a87747&tk=BJG1GVOScLcrMVsBvFLMq/Lk7hBN4r6+lj54MrALn9NnD8H5X+K0DXk1W7TTIn/wM/dlUWyNUE88fk2e6BoXoYi0SGP+5SkkO8OzmgmXaFc=",
  // },
  // {
  //   id: 6,
  //   name: "五年级 1班—探索图形",
  //   created_name: getUserInfo("name"),
  //   updated_time: "2025-06-22 11:26:32",
  //   course_id:
  //     "ec3a00b0200d4308bdb5347fd6e08c39&tk=VqbU0R2orsgH7GIktGnAh9nqi+bqf2OOPFDoAePO83w4U5RSYNc8Ih1cN7IBNx65cNMskDCrXZ82cRcQUY6KDr2sfl2gbhBWXnhjqyHgrPw=",
  // },
  // {
  //   id: 7,
  //   name: "初一 1班—法律伴成长",
  //   created_name: getUserInfo("name"),
  //   updated_time: "2025-06-18 11:26:32",
  //   course_id:
  //     "9d1ccb58858f49dc851a697512996615&tk=qOntw87B79bfKY1k0aEviuxkWQeTKNIimfmAq87TqhxKw8Wxp04sF+//28gnRJ5VF7FV6/zaO02PaD7/i8BvLUIPspuGJwmTb8eSMz8UFZY=",
  // },

  {
    id: 9,
    name: "初中一年级 平面直角坐标系中三角形面积问题",
    created_name: getUserInfo("name"),
    updated_time: "2025-09-08 11:26:32",
    img_url:
      "https://ai.aipingke.cn/images/bb5b28bb695d98655e47078b69ab5487_cover.jpg",
    space_id: "013d9429-1dc0-4bff-84fc-b3dbc86bc9ca",
    space_id_test: "fdaf6b38-4413-4e74-9ff9-43be5719d81c",
    course_id:
      "91d36d80dde64018a78f8a209874db7e&tk=I2MJ2FE9e3w/D1nUe3IhMeDFXaiGjHmbrgWj01+/3wx3TwqfXJFZyJTzGKFSJa2VNJzLt1+KHiWwvM3orCYTX0LOgyPOrR3f9E4evbHrfXQ=",
  },
  {
    id: 8,
    name: "初中一年级 方程的应用-配套问题",
    created_name: getUserInfo("name"),
    updated_time: "2025-09-05 11:26:32",
    img_url:
      "https://ai.aipingke.cn/images/df1ff3227975f8ee01f23a97aa22e051_cover.jpg",
    space_id: "3f4ffab2-e2e2-4523-89cf-767d7b27ac9c",
    space_id_test: "e142945b-5ff9-4306-90ec-00a93973a9d0",
    course_id:
      "83c66fa34ebb463997635bda1af430bb&tk=kM1dVZxewWghVsfqFrj98tlc6Aav/sGRblxjr3CkXDFgCZIC0IFMqUN7b8NGyG8x4bCNmXx8KDWDGHTyH94onaJyDLamuHjgEIEGtaAGId8=",
  },
  // {
  //   id: 12,
  //   name: "高中一年级 牛顿第一定律",
  //   created_name: getUserInfo("name"),
  //   updated_time: "2025-06-22 11:26:32",
  //   course_id:
  //     "f807c18c91bd414fb66d7f0e58d89fcd&tk=B1UYHI0bGjDeHWuOupn0yc4QqqDWHNcbaKOIrzXPHg9lJin/3geHqddNW7dz714xvUWgvNLpSvTxcLo8MMDK+/0jF4WQpzsiIvghc+Ac9n4=",
  // },
  {
    id: 13,
    name: "高中一年级 正弦函数的性质与图像",
    created_name: getUserInfo("name"),
    updated_time: "2025-09-04 11:26:32",
    img_url:
      "https://ai.aipingke.cn/images/5acf397e9774b74651389bd936e63918_cover.jpg",
    space_id: "7f049ba0-8165-4dc7-a97b-dd38b12ab3d8",
    space_id_test: "529f9482-d8ee-4d18-9ef4-940728f74f85",
    course_id:
      "d6693254416a4ddd973387a507521824&tk=L6kVwoChcI+rSUpToHuEfR29Mb3ahygPkojNws8BHk0DZm2D1IlVmXZtI9MigJcxVfLmZI3zDsHz7yvDgH+nTcH6OxXJ5wHxcDUERd5+Vuo=",
  },
  {
    id: 10,
    name: "初中二年级 正切",
    created_name: getUserInfo("name"),
    updated_time: "2025-09-03 11:26:32",
    img_url:
      "https://ai.aipingke.cn/images/55fe5e432c357135c98408c325dd120c_cover.jpg",
    space_id: "03f42777-c859-4b04-811b-81dae7eadbb3",
    space_id_test: "3c5bf618-1188-4c01-a688-29ffceba0b40",
    course_id:
      "ad5532a256964ea6bdaaa40b7b29e98f&tk=IpGNkzKe7F8gyivAdXgXRzHZ4zZ/3k0GtolCM6Uh7ZdK0Vp1e8IoUempAQyHrdn/ZFYJvHZg4gnWT729Duu/ZgQ817ajCc3stX/QIrxgQ10=",
  },
  {
    id: 11,
    name: "初中二年级 流体压强",
    created_name: getUserInfo("name"),
    updated_time: "2025-09-02 11:26:32",
    img_url:
      "https://ai.aipingke.cn/images/e19db000e27f78b183b8ffadd72f56c3_cover.jpg",
    space_id: "fbf39b1c-b084-45cc-a002-1f52b615ce5d",
    space_id_test: "4ab52bf6-fe93-4299-b8ff-69f44d325bd8",
    course_id:
      "47a39dbad2584ecc855b165804d8ea72&tk=AAuownYkm4JApK1BC7T59Or2Om2+IC5sWJQF/BuQk1iAArUrLJirNS/csldUkuLD/rTkmKyNN9NXoKPLawJbhxWknkPEoi9+LcHcdi8ZhAc=",
  },
];
const ClassCard = (props: any) => {
  const createCardRef = useRef<{ openModal: (params?: any) => void }>();
  const dispatch = useDispatch();
  // const { search } = useLocation();
  // const searchParams = new URLSearchParams(search);
  // const courseId = searchParams.get("courseId");
  const [context] = useTeacherContext()
  const courseId = context?.course_id
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDataList();
  }, []);


  // 获取数据列表
  const getDataList = async() => {
    setLoading(true);
    // const { code, data }: any = await dispatch({
    //   type: "teachSourceModel/postData",
    //   apiUrl: "docLabelListUrl",
    //   payload: {},
    // });
    // if (code == 200) {
    //   setDataList(data?.list || []);
    // }

    setTimeout(() => {
      // setDataList([]);
      setDataList(data);
      setLoading(false);
    }, 200);
  }
  // 处理时间展示
  const handleTime = (time: string) => {
    if (dayjs().diff(time, "day") === 0) {
      return dayjs(time).format("HH:mm");
    } else if (dayjs(time).year() !== dayjs().year()) {
      return dayjs(time).format("YYYY/MM/DD");
    } else {
      return dayjs(time).format("MM/DD");
    }
  }
  // 生成骨架屏列表
  const renderSkeletons = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <div className="card-content-item" key={`skeleton-${index}`}>
        <div className="card-content-item-body">
          <Skeleton.Node active />
        </div>
        <div className="card-content-item-footer" />
      </div>
    ));
  };

  // 点击创建
  const onClickCreate = () => {
    createCardRef.current?.openModal();
  }
  // 点击查看
  const onClickView = (item: any) => {
    window.open(
      `https://www.aipingke.cn/report/?course_id=${item?.course_id}`,
      "_blank"
    );
  }
  // 处理数据
  const handleData = () => {
    if (location.host.includes("edu-test") && getUserInfo("phone") === "15912345678") {
      return dataList?.filter((item: any) => item?.space_id_test === courseId);
    } else if (location.host.includes("edu") && getUserInfo("phone") === "13041261084") {
      return dataList?.filter((item: any) => item?.space_id === courseId);
    } else {
      return dataList;
    }
  }

  return (
    <div className="assessment-card">
      <div className="assessment-card-header">
        <div>&nbsp; 讲授课列表</div>
        <Button type="primary" onClick={onClickCreate}>
          创建讲授课
        </Button>
      </div>

      <div className="assessment-card-content">
        {loading && <div className="card-content">{renderSkeletons()}</div>}
        {!loading && <>
          {dataList.length > 0 ? (
            <div className="card-content">
              {handleData().map((item: any) => (
                <div key={item?.id} className="card-content-item">
                  <div
                    className="card-content-item-body"
                    onClick={() => onClickView(item)}
                  >
                    <img
                      alt="图片"
                      className="bgimg"
                      src={item?.img_url || require("@/assets/class_bg.png")}
                    />
                    <ZYIcon type="bofangtubiao" className="play" />
                  </div>
                  <div className="card-content-item-footer">
                    <div className="title" title={item?.name}>
                      <ZYIcon type={"yinpin"} />
                      <span>{item?.name}</span>
                    </div>
                    <div className="desc">
                      <div>
                        <span>{item?.created_name} · </span>
                        <span>{handleTime(item?.updated_time)}更新</span>
                      </div>
                      <Dropdown
                        placement="bottom"
                        overlayClassName="menu-icon"
                        menu={{
                          items: menuItems,
                          onClick: (e: any) => console.log(e, item),
                        }}
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<MoreOutlined />}
                        />
                      </Dropdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-content">
              <Empty
                description={
                  <>
                    <p>还没有课程相关资料</p>
                    <p>点击创建课程吧</p>
                  </>
                }
                image={require("@/assets/courseEmpty.png")}
                imageStyle={{ width: 80, height: "auto", margin: "0 auto 10px" }}
              />
            </div>
          )}
        </>}
      </div>
      <CreateCard onRef={createCardRef} />
    </div>
  );
};

export default ClassCard;
