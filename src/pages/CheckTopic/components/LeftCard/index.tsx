import { connect, useDispatch } from "@umijs/max";
import { Button, Form, Modal, Radio } from "antd";
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import "./index.less";
import { latexReplace } from "@/utils";
import MarkdownRender from "@/components/MarkdownRender";
import Card from "./Card";

const App = (props: any) => {
  const { onRef, roleModel } = props;
  const dispatch = useDispatch();
  const [modal, contextHolder] = Modal.useModal();

  const [form] = Form.useForm();

  const publishedNum = () => {
    let num = 0;
    if (props?.dataListData?.length > 0) {
      // let arr = props?.dataListData?.filter((item: any) => {
      //   return item?.published_to_class;
      // });
      return props?.dataListData?.length;
    }
    return num;
  };

  return (
    <>
      <div className="check_examinationpaper">
        <div className="check_examinationpaper_top">
          {`共${publishedNum()}份已发布的习题`}
        </div>
        <div className="check_examinationpaper_content">
          <Card {...props} />
        </div>
      </div>
    </>
  );
};
export default connect((state: any) => ({
  authModel: state.authModel,
  commonModel: state.commonModel,
}))(App);
