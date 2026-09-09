import { useEffect, useState } from "react";
import { Drawer, Spin } from "antd";
import { connect, useDispatch } from "@umijs/max";
import ZYIcon from "@/components/ZYIcon";
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import QuestionsPdf from "@/pages/SetQuestions/components/QuestionsPdf";
import MarkdownRender from "@/components/MarkdownRender";
import "./index.less";
const App = (props: any) => {


  const { openDrawer, cancel, rowDrawer } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [details, setDetails] = useState<any>();
  const [courslist, setCourselist] = useState<any>([]);
  const [Previewl, setPreviewl] = useState(true)
  const dispatch = useDispatch();
  const [loadinglist, setLoadinglist] = useState<boolean>(true);

  useEffect(() => {
    setPreviewl(openDrawer)
    setOpen(openDrawer);
    if (openDrawer) {
      DocsList();
    } else {
      setCourselist([]);
      setDetails([]);
    }
  }, [openDrawer]);
  useEffect(() => {
    setLoading(false);
  }, [rowDrawer]);

  const DocsList = async () => {

    //  console.log("rowDrawer====>>>>",rowDrawer)

    setLoadinglist(true);
    let { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "kbsDocsListUrl",
      payload: {
        chunk_id: rowDrawer?.data.properties?.chunk_id,
        doc_id: rowDrawer?.data.doc_id,
      }
    });
    if (code === 200) {
      setDetails(data.chunk_data);
      setCourselist([data.doc_data]);
      setLoadinglist(false);
    }
  }

  const Preview = () => {
    setPreviewl(false)
  }
  const Previewd = () => {
    setPreviewl(true)
  }
  const closeDrawer = () => {
    cancel?.();
    setCourselist([]);
    setDetails([]);
  }
  return (
    <div className="drawercontainer">
      {open && (
        Previewl && (
          <Drawer
            // 可关闭
            closable
            title={<p>{rowDrawer?.data.label}</p>}
            placement="right"
            open={open}
            loading={loading}
            width={"740"}
            onClose={closeDrawer}
          >
            <Spin className="loading_container" tip="资料加载中..." size="large" style={{ overflow: "hidden" }} spinning={loadinglist}>
              <div >
                <div>
                  {
                    courslist?.map((item: any, index: any) => {
                      return (
                        <div
                          onClick={Preview}
                          className="check_file_list_box_css"
                          key={index}>
                          <div className="check_file_list_box_css_left">
                            <div className="check_file_list_box_left">
                              <ZYIcon type={"pdf-color"} style={{ fontSize: 20 }} />
                            </div>
                            <div className="check_file_list_box_right">
                              <div className="check_file_list_box_doc_name">
                                {item.doc_name}
                              </div>
                            </div>
                          </div>
                          <div className="check_file_list_box_jump">
                            <RightOutlined />
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
                <div className="check_file_list_box">
                  {
                    details?.map((item: any, index: any) => {
                      return <MarkdownRender key={index}>{`${item}`}</MarkdownRender>
                    })
                  }
                </div>

              </div>
            </Spin>
          </Drawer>
        ) || (<Drawer
          // 是否显示关闭按钮
          title={<div className="drawer_questions_pdf_title" onClick={Previewd} >
            <LeftOutlined />
            <div className="drawer_questions_pdf_title_text">{courslist[0]?.doc_name}</div>
          </div>}
          closable={true}
          // 点击蒙层是否允许关闭
          maskClosable={true}
          // 弹出位置
          placement="right"
          // 是否加载中
          loading={loading}
          // 弹出框宽度
          width={"740"}
          open={open}
          onClose={closeDrawer}
        >
          <div className="drawer_questions_pdf_box">
            <div className="drawer_questions_pdf_box_css">
              <QuestionsPdf docId={courslist[0]?.id} />
            </div>
          </div>
        </Drawer>
        )
      )}
    </div>
  );
};
export default connect((state: any) => {
  return {
    setQuestionsModel: state.setQuestionsModel,
  };
})(App);
