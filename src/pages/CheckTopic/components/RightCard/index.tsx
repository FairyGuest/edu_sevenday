import { connect, useDispatch } from "@umijs/max";
import { Button, Form, Modal, Radio, Select } from "antd";
import { FileDoneOutlined } from "@ant-design/icons";

import "./index.less";
import { latexReplace } from "@/utils";
import MarkdownRender from "@/components/MarkdownRender";
import { useState } from "react";
import Chect from "./Check";

// import mock from "./mock.json";

const { Option } = Select;

const App = (props: any) => {
  const { onRef, roleModel } = props;
  const dispatch = useDispatch();

  const [active, setActive] = useState("1");
  const [activeStudent, setActiveStudent] = useState("");

  const [form] = Form.useForm();

  return (
    <div className="check_topic_right_css_right">
      <Chect {...props} />
    </div>
  );
};
export default connect((state: any) => ({
  authModel: state.authModel,
  commonModel: state.commonModel,
}))(App);
