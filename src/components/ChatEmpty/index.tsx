import { getUserInfo } from "@/utils";
import { connect, useDispatch } from "@umijs/max";

// import "./index.less";
import { Empty } from "antd";

const App = (props: any) => {
  const {
    emptySty = {},
    descriptionSty = {},
    title = "",
    ImgComponent,
    ZYIconStyle,
  } = props;

  return (
    <>
      <div className="w-full h-full flex items-center justify-center">
        <Empty
          image={ImgComponent || require("@/assets/courseEmpty.png")}
          imageStyle={{
            width: 80,
            height: "auto",
            margin: "0 auto 12px",
            ...ZYIconStyle,
          }}
          style={{
            ...emptySty,
          }}
          description={
            <span
              style={{
                color: "#646E8B",
                // width: "154px",
                fontSize: 16,
                textAlign: "left",
                display: "inline-block",
                ...descriptionSty,
              }}
            >
              {title || `${getUserInfo("name")}您好，我能帮你什么？`}
            </span>
          }
        />
      </div>
    </>
  );
};
export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(App);
