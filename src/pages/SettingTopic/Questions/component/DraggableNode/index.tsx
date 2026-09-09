import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { connect, useDispatch, useLocation } from "umi";
import {
  arrayMove,
  SortableContext,
  useSortable,
  /*
    垂直列表使用verticalListSortingStrategy,
  横向列表使用horizontalListSortingStrategy
  */
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  message,
  Tooltip,
  Popover,
  InputNumber,
  Button,
  Space,
} from "antd";
import { useEffect, useState, useRef, memo } from "react";
import {
  FileDoneOutlined,
  DeleteOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
// import QuestionType from "./QuestionType";
import QuestionType from "@/components/QuestionType";
import { deepCopy } from "@/utils";
import "./../../index.less";

const App = (props: any) => {
  const { val, selectPrintType, download } = props;

  const [showIcon, setShowIcon] = useState(false);
  const [show, setShow] = useState(val?.showDetails);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w?: number; h?: number }>({});
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: val.id,
  });

  useEffect(() => {
    if (isDragging && nodeRef.current) {
      setSize({
        w: nodeRef.current.offsetWidth,
        h: nodeRef.current.offsetHeight,
      });
    }
    if (!isDragging) {
      setSize({}); // 拖完释放
    }
  }, [isDragging]);

  useEffect(() => {
    setShow(val?.showDetails);
  }, [val?.showDetails]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    width: isDragging && size.w ? `${size.w}px` : undefined,
    height: isDragging && size.h ? `${size.h}px` : undefined,
  };

  const showRowAnswer = () => {
    const next = !show;
    setShow(next);
    props?.toggleShowDetails?.(val, next);
  };

  return (
    <div>
      {props?.flagStatusTi == "edit" && (
        <div
          // style={{ paddingBottom: "16px" }}
          className={`question_row_box_css ${props?.isHighlighted ? "question_row_box_highlight" : ""
            }`}
          style={style}
          // ref={setNodeRef}
          ref={(el) => {
            setNodeRef(el);
            nodeRef.current = el;
          }}
          {...attributes}
          {...listeners}
          onMouseEnter={() => setShowIcon(true)}
          onMouseLeave={() => setShowIcon(false)}
          onClick={showRowAnswer}
        >
          <div className="question_drag_box">
            {/* {showIcon && <OrderedListOutlined className="question_drag_icon" />} */}
            {/* <Tooltip placement="top" title={"拖动"}>
              <OrderedListOutlined className="question_drag_icon" />
            </Tooltip> */}
            <div
              className="question_drag_box_title_box"
              style={{
                justifyContent: `${val?.source_summary ? "space-between" : "flex-end"}`,
              }}
            >
              {/* {val?.source_summary && (
                <div className="question_drag_box_title_box_left">
                  {val?.source_summary}
                </div>
              )} */}
              <div></div>
              <div
                className="question_drag_box_title_box_right_box"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <div className="question_drag_box_title_box_right_content">
                  <div className="question_drag_box_title_box_right_content_change">
                    {props?.setType == 'chapterTopic' && <Button
                      key={2}
                      type="primary"
                      style={{ boxShadow: "none" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        props?.handleChangeTi({
                          ...val,
                          question_rules_list: val?.question_rules,
                        });
                      }}
                    >
                      换题
                    </Button>}
                  </div>
                  <div className="question_drag_box_title_box_right_content_input_num_box">
                    {props?.showScore && (
                      <>
                        <InputNumber
                          className="question_drag_box_title_box_right_content_input_num question_drag_box_title_box_right_content_input_score"
                          addonBefore="分数"
                          precision={0}
                          min={0}
                          max={999}
                          step={1}
                          value={
                            val?.score != null && val?.score !== ""
                              ? Number(val.score)
                              : undefined
                          }
                          placeholder="0"
                          onChange={(value) => {
                            props?.changeScore?.(val, value);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        />
                        <div className="question_drag_box_title_box_right_content_input_num_box_line"></div>
                      </>
                    )}
                    <InputNumber
                      className="question_drag_box_title_box_right_content_input_num"
                      // prefix="添加答题区域"
                      addonBefore="添加答题区域"
                      precision={0}
                      min={0}
                      max={20}
                      // controls={false}
                      step={1}
                      value={val?.spacing === 0 ? undefined : val?.spacing}
                      placeholder="0"
                      onChange={(value) => {
                        props?.chengeAnswerArea(val, value);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    />
                    <div className="question_drag_box_title_box_right_content_input_num_box_line"></div>
                  </div>
                </div>
                <div>
                  <div className="question_row_icon">
                    <Tooltip placement="top" title={"删除"}>
                      <DeleteOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          props?.delRow(val);
                        }}
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
            <QuestionType
              // showAnswer={props?.showAnswer}
              showSource={true}
              showAnswer={show}
              row={val}
              rowKey={val?.rowKey}
              setType={props?.setType}
              selectPrintType={selectPrintType}
              download={download}
            />
            {val?.spacing > 0 && (
              <div
                style={{
                  height: `${20 * val?.spacing}px`,
                  width: "100%",
                }}
              ></div>
            )}
          </div>
        </div>
      )}
      {props?.flagStatusTi != "edit" && (
        <div className="question_row_box_css" onClick={showRowAnswer}>
          <div className="question_drag_box">
            {val?.source_summary && props?.flagStatusTi == "edit" && (
              <div className="question_drag_box_title_box">
                <div className="question_drag_box_title_box_left">
                  {val?.source_summary}
                </div>
              </div>
            )}
            <QuestionType
              showAnswer={show}
              row={val}
              rowKey={val?.rowKey}
              showSource={true}
              setType={props?.setType}
              selectPrintType={selectPrintType}
              download={download}
            />
            {val?.spacing > 0 && (
              <div
                style={{
                  height: `${20 * val?.spacing}px`,
                  width: "100%",
                }}
              ></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(memo(App));
