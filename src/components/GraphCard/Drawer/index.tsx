import { useEffect, useState } from "react";
import { Layout, Button, Drawer, Space, InputNumber, message, Form } from "antd";
import { connect, useDispatch } from "@umijs/max";
import { history, Outlet, useLocation } from "umi";
import QuestionsPdf from "@/pages/SetQuestions/components/QuestionsPdf";
import "./index.less";

const { Content, Sider } = Layout;

const App = (props: any) => {
  const {
    openDrawer,
    cancel,
    rowDrawer,
    editPage = false,
    pageNumStr = "",
  } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // const { search } = useLocation();
  // const searchParams = new URLSearchParams(search);
  // const courseId = searchParams.get("courseId");
  const [form] = Form.useForm();

  const [startPage, setStartPage] = useState<any>();
  const [endPage, setEndPage] = useState<any>();

  useEffect(() => {
    setOpen(openDrawer);
    initPage();
  }, [openDrawer]);

  useEffect(() => {
    setLoading(false);
  }, [rowDrawer]);

  const initPage = () => {
    let arr = pageNumStr?.split("-");
    // setStartPage(arr?.[0] as number);
    // setEndPage(arr?.[1] as number);
    form.setFieldsValue({
      startPage:arr?.[0],
      endPage:arr?.[1],
    })
  };
  const onFinish=(values:any)=>{
    submitFn?.(values);
  }

  const submitFn = (values:any) => {
    const {startPage,endPage}=values
    if (!startPage || !endPage) {
      message.warning("请填写完整页码");
      return;
    }
    if (startPage > endPage) {
      message.warning("开始页码不能比结束页码大");
      return;
    }
    let str_page = `${startPage}-${endPage}`;
    cancel?.();
    props?.checkFn?.([rowDrawer]);
    props?.pageNumStrFn?.(str_page);
  };

  const titleBox = () => {
    return (
      <div className="drawer_title_box">
        <p>{rowDrawer?.doc_name}</p>
      </div>
    );
  };

  const contentScope = () => {
    return (
      <div className="drawer_content_scope_box">
        <div className="drawer_content_scope_box_css">
          <div>
          <Form
            name="customized_form_controls"
            layout="inline"
            form={form}
            className="page_check_form"
            onFinish={onFinish}
          >
            <Form.Item name="startPage" label="范围从" rules={[{ required: true, message: "开始的页码不能为空" }]}>
            <InputNumber
              className="drawer_title_box_input_number"
              precision={0}
              min={1}
              max={999}
              placeholder="请输入开始的页码"
              // controls={false}
              // value={startPage}
              step={1}
              // onChange={(value) => {
              //   setStartPage(value as number);
              // }}
            />
            </Form.Item>
            <span className="pt-4 mr-4">至</span>
            <Form.Item name="endPage" label="" rules={[{ required: true, message: "结束的页码不能为空" }]}>
            <InputNumber
              className="drawer_title_box_input_number"
              precision={0}
              min={1}
              max={999}
              placeholder="请输入结束的页码"
              // controls={false}
              // value={endPage}
              step={1}
              // onChange={(value) => {
              //   setEndPage(value as number);
              // }}
            /> 
            </Form.Item>

          </Form>

          </div>
          <div>
            <div className="drawer_title_btn">
              <Button
                style={{ marginRight: "6px" }}
                className="back_btn_css_less"
                onClick={() => {
                  cancel?.();
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                className="submit_btn_css_less"
                onClick={() => {
                  form.submit()
                }}
              >
                确认
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {open && (
        <Drawer
          closable={true}
          maskClosable={false}
          destroyOnHidden={true}
          title={titleBox()}
          placement="right"
          open={open}
          loading={loading}
          width={"1000"}
          onClose={() => {
            cancel?.();
          }}
        >
          <div className="drawer_questions_pdf_box">
            {editPage && contentScope()}
            <div className="drawer_questions_pdf_box_css">
              <QuestionsPdf docId={rowDrawer?.id} />
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
};

export default connect((state: any) => ({
  aiClassroomModel: state.aiClassroomModel,
}))(App);
