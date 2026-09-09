import { useEffect, useState, useMemo } from "react";
import {
  Layout,
  Button,
  Drawer,
  Space,
  InputNumber,
  Tree,
  message,
  Checkbox,
  Form,
} from "antd";
import { connect, useDispatch, useLocation } from "umi";
import QuestionsPdf from "@/pages/SetQuestions/components/QuestionsPdf";
import PDFViewer from "@/components/PDFViewer";
import { ZYIcon } from "@/components";
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
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  // const { search } = useLocation();
  // const searchParams = new URLSearchParams(search);
  // const courseId = searchParams.get("courseId");

  const [catalogTree, setCatalogTree] = useState<any>([]); // 目录树
  const [checkKeys, setCheckKeys] = useState<any>([]); // 选中的节点
  const [checkItems, setCheckItems] = useState<any>([]); // 选中的节点item
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [maxPageNum, setMaxPageNum] = useState(1);
  // 拍平后所有树节点
  const allTreeNodes = useMemo(() => {
    const flattenTree = (tree: any) => {
      const result: any[] = []; // 目录树拍平
      const dfs = (nodes: any) => {
        for (const node of nodes) {
          const { children, ...rest } = node;
          result.push(rest); // 只保留非 children 的属性
          if (children && children.length > 0) {
            dfs(children);
          }
        }
      };
      dfs(tree);
      return result;
    };
    return flattenTree(catalogTree);
  }, [catalogTree]);

  useEffect(() => {
    if (catalogTree?.length > 0) {
      setExpandedKeys(getAllKeys(catalogTree));
    }
    // 默认展开所有节点
  }, [catalogTree]);

  useEffect(() => {
    setOpen(openDrawer);
    initPage();
    // getCourseCatalog();
  }, [openDrawer]);

  useEffect(() => {
    setLoading(false);
  }, [rowDrawer]);

  const getAllKeys = (nodes: any[]): string[] => {
    const keys: string[] = [];
    const traverse = (nodeList: any[]) => {
      nodeList.forEach((node) => {
        keys.push(node?.id as string);
        if (node?.children) {
          traverse(node?.children);
        }
      });
    };
    traverse(nodes);
    return keys;
  };

  const initPage = () => {
    if (props?.pageNumStr?.type == 1) {
      let arr = props?.pageNumStr?.checkItems?.map((item: any) => {
        return item?.id;
      });
      setCheckKeys(arr);
      setCheckItems(props?.pageNumStr?.checkItems);
    } else {
      if (!pageNumStr) {
        return;
      }
      let arr = pageNumStr?.str_page?.split("-");
      form.setFieldsValue({
        startPage: arr?.[0],
        endPage: arr?.[1],
      });
      // setStartPage(arr?.[0] as number);
      // setEndPage(arr?.[1] as number);
    }
  };

  const submitFn = (values: any) => {
    // is_master_doc == 1 是否是主教材
    if (rowDrawer?.is_master_doc !== 1) {
      const { startPage, endPage } = values;
      if (!startPage || !endPage) {
        message.warning("请填写完整页码");
        return;
      }
      if (startPage > endPage) {
        message.warning("开始页码不能比结束页码大");
        return;
      }
      cancel?.();
      let str_page = `${startPage}-${endPage}`;
      props?.pageNumStrFn?.({
        str_page,
        rowDrawer,
        type: rowDrawer?.is_master_doc,
      });
    } else {
      if (checkItems?.length == 0) {
        message.warning("请选择目录");
        return;
      }
      cancel?.();
      // checkItems 目录list rowDrawer当前文件 is_master_doc = 1 是主教材
      props?.pageNumStrFn?.({
        checkItems,
        rowDrawer,
        type: rowDrawer?.is_master_doc,
      });
    }
    props?.checkFn?.([rowDrawer]);
  };

  const titleBox = () => {
    return (
      <div className="drawer_title_box">
        <p>{rowDrawer?.doc_name}</p>
      </div>
    );
  };
  // 获取目录信息
  // const getCourseCatalog = async () => {
  //   const { code, data = [] }: any = await dispatch({
  //     type: "teachSourceModel/getData",
  //     apiUrl: "getMasterCatalogUrl",
  //     payload: { space_id: courseId },
  //   });
  //   if (code == 200) {
  //     setCatalogTree(data.slice(1));
  //   }
  // };
  // 目录树节点全选
  // const onTreeCheckAll = (e: any) => {
  //   if (e.target.checked) {
  //     setCheckKeys(allTreeNodes.map((item: any) => item.id)); // 拍平后所有树节点

  //     setCheckItems(allTreeNodes);  // 拍平后所有树节点
  //   } else {
  //     setCheckKeys([]);
  //   }
  // };
  // 目录树节点选中
  const onTreeCheck = (checkedKeys: any, e: any) => {
    setCheckItems(e.checkedNodes);
    setCheckKeys(checkedKeys);
  };

  // pdf 最多多少页
  const onTotalpages = (param: any) => {
    console.log("onTotalpages", param);
    setMaxPageNum(param || 1);
  };

  const onFinish = (values: any) => {
    submitFn?.(values);
  };

  // 底部按钮
  const footerBtn = [
    <Button
      key="back"
      onClick={() => cancel?.()}
      style={{ margin: "0 12px 0 8px" }}
    >
      取消
    </Button>,
    <Button
      key="submit"
      type="primary"
      // loading={loading}
      onClick={() => {
        submitFn?.({});
      }}
    >
      确认
    </Button>,
  ];
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
              <Form.Item
                name="startPage"
                label="范围从"
                rules={[{ required: true, message: "开始的页码不能为空" }]}
              >
                <InputNumber
                  className="drawer_title_box_input_number"
                  precision={0}
                  min={1}
                  max={maxPageNum}
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
              <Form.Item
                name="endPage"
                label=""
                rules={[{ required: true, message: "结束的页码不能为空" }]}
              >
                <InputNumber
                  className="drawer_title_box_input_number"
                  precision={0}
                  min={1}
                  max={maxPageNum}
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
                  // console.log("-----")
                  form.submit();
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

  const footerFn = () => {
    if (!editPage) {
      return [];
    }
    if (rowDrawer?.is_master_doc === 1) {
      return footerBtn;
    }
    return [];
  };



  return (
    <>
      {open && (
        <Drawer
          closable={true}
          maskClosable={false}
          // destroyOnHidden={true}
          title={titleBox()}
          placement="right"
          open={open}
          loading={loading}
          width={1000}
          onClose={() => {
            cancel?.();
          }}
          // footer={rowDrawer?.is_master_doc === 1 ? footerBtn : []}
          footer={footerFn()}
          className="drawerjiaoan"
        >
          {
            <div className="drawer_questions_pdf_box">
              {editPage && rowDrawer?.is_master_doc !== 1 && contentScope()}
              <div className="drawer_questions_pdf_box_css">
                {rowDrawer?.file_type == "pdf" ? (
                  <PDFViewer
                    onTotalpages={onTotalpages}
                    fileInfo={rowDrawer}
                    checkType={editPage && rowDrawer?.is_master_doc}
                    onTreeCheck={onTreeCheck}
                    checkItems={checkItems}
                  />
                ) : (
                  <QuestionsPdf docId={rowDrawer?.id} />
                )}
              </div>
            </div>
          }
        </Drawer>
      )}
    </>
  );
};

export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(App);
