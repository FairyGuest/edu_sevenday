import { Button, Dropdown, Empty, Image, Skeleton } from "antd";
import "./index.less"

// 定义icon菜单选项
const GraphEmpty = (props: any) => {

  return (
    <div className='k12_empty_container'>
    <Empty
        description={ <p>暂无资源</p>}
        image={require("@/assets/courseEmpty.png")}
        imageStyle={{ width: 80, height: 48, margin: "0 auto 10px" }}
    />
    </div>
  );
};

export default GraphEmpty;
