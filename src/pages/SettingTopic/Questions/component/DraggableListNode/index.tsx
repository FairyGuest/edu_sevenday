import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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
import { Card, message, Tooltip, Popover, InputNumber, Button } from "antd";
import { useEffect, useState, useRef, memo } from "react";
import {
  FileDoneOutlined,
  DeleteOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
// import QuestionType from "./QuestionType";
import QuestionType from "@/components/QuestionType";
import { deepCopy } from "@/utils";
import DraggableNode from "../DraggableNode";
import { questionNumber } from "@/global";
import ChangeKnowledgeModal from "../ChangeKnowledgeModal";
import "./../../index.less";

const App = (props: any) => {
  const {
    commonModel,
    flagStatusTi,
    addQuestion,
    searchRow = {},
    isDragVerification = true,
    selectPrintType,
    download,
  } = props;
  const highlightTimerRef = useRef<any>(null);
  const dispatch = useDispatch();
  const [items, setItems] = useState<any>([]);
  const [questionTypes, setQuestionTypes] = useState<any>([]);
  const [change_status_ti_drawer, setChange_status_ti_drawer] = useState(false);
  // const [handleQuestion, setHandleQuestion] = useState<any>(null); // 要替换的题目
  const [changeRow, setChangeRow] = useState<any>(null); // 要替换的题目
  const [uploadType, setUploadType] = useState<any>("");
  // const [itemsFlagList, setItemsFlagList] = useState<any>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // useEffect(() => {
  //   console.log("flagStatusTi", flagStatusTi);
  //   if (flagStatusTi == "cancel") {
  //     setItems(itemsFlagList);
  //   }

  //   if (flagStatusTi == "save") {
  //     questionsUpdate(items);
  //   }
  // }, [flagStatusTi]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    console.log('activeactive',active)
    console.log('overover',over)
    setActiveId(null);
    if (active.id !== over?.id) {
      const overIndex = items.findIndex((i: any) => i?.id === over?.id);
      if (isDragVerification) {
        let flag_row = items.find((i: any) => i?.id === active?.id);

        let flag_first_index = items.findIndex((item: any) => {
          return item?.question_type == flag_row?.question_type;
        });

        let flag_num = items?.filter((item: any, index: any) => {
          return item?.question_type == flag_row?.question_type;
        });

        if (overIndex > flag_first_index + flag_num?.length - 1) {
          message.warning("该题目不可插入至其他题型");
          return;
        }
        if (flag_first_index > overIndex) {
          message.warning("该题目不可插入至其他题型");
          return;
        }
      }

      const activeIndex = items.findIndex((i: any) => i?.id === active?.id);
      const newlist = arrayMove(items, activeIndex, overIndex);
      setItems(newlist);
      props?.topicUpdate?.(newlist);

      // 拖动完成后高亮0.5秒
      setHighlightId(active.id as string);
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
      highlightTimerRef.current = setTimeout(() => {
        setHighlightId(null);
      }, 500);
    }
  };

  useEffect(() => {
    if (props?.questions?.length > 0) {
      setItems(props?.questions);
    }

    // setChange_status_ti_drawer(addQuestion);
    if (addQuestion) {
      setUploadType("add");
      setChange_status_ti_drawer(true);
    }

    if (props?.attributeObject?.question_types?.length > 0) {
      setQuestionTypes(
        props?.attributeObject?.question_types?.map((item: any, index: any) => {
          return {
            ...item,
            sort: index,
          };
        }),
      );
    }
  }, [props]);

  const handleChangeTi = async (item: any) => {
    setChangeRow(item);
    setUploadType("change");
    setChange_status_ti_drawer(true);
    // await dispatch({
    //   type: "commonModel/setData",
    //   payload: { change_status_ti: "change" },
    // });
  };

  const delRow = (row: any) => {
    console.log("删除题", row);
    if (items?.length == 1) {
      message.warning("已剩最后一题，无法删除");
      return;
    }
    let arr = items?.filter((item: any) => {
      return item?.id != row?.id;
    });
    setItems(arr);
    props?.topicUpdate?.(arr);
  };

  //答题区域
  const chengeAnswerArea = (val: any, value: any) => {
    let _arr = items?.map((v: any, k: any) => {
      if (v?.id == val?.id) {
        return { ...v, spacing: value };
      }
      return v;
    });
    setItems(deepCopy(_arr));
    props?.topicUpdate?.(deepCopy(_arr));
  };

  const changeScore = (val: any, value: any) => {
    const _arr = items?.map((v: any) => {
      if (v?.id == val?.id) {
        return { ...v, score: value ?? 0 };
      }
      return v;
    });
    setItems(deepCopy(_arr));
    props?.topicUpdate?.(deepCopy(_arr));
  };

  // 组件卸载时清理高亮定时器
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const toggleShowDetails = (val: any, next?: boolean) => {
    const _arr = items?.map((v: any) => {
      if (v?.id === val?.id) {
        const showDetails = typeof next === "boolean" ? next : !v?.showDetails;
        return { ...v, showDetails };
      }
      return v;
    });
    setItems(deepCopy(_arr));
    props?.topicUpdate?.(deepCopy(_arr));
  };

  // 添加 / 替换题
  const questionsUpdateChange = (arr: any) => {
    console.log('arr',arr)
    setItems(deepCopy(arr));
    props?.topicUpdate?.(deepCopy(arr));
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 鼠标移动小于 5px 时不触发拖拽
      },
    }),
  );

  // 判断题型标题
  const getQuestionaType = (val: any) => {
    if (
      !(
        props?.creation_type == "external_question_bank" ||
        props?.creation_type == "consistent_question_difficulty" ||
        props?.creation_type == "overall_comprehensive_difficulty"
      )
    ) {
      return "";
    }
    // 获取题型的数量
    let _flagArr = items?.filter((item: any) => {
      return item?.question_type == val?.question_type;
    });

    if (_flagArr?.[0]?.id == val?.id) {
      let _flagRow = questionTypes?.find((item: any) => {
        return item?.en_name == val?.question_type;
      });
      // let _flagSort = questionNumber()?.find((item: any) => {
      //   return item?.small == _flagRow?.sort + 1;
      // });
      return (
        <span
          className="questiona_type_css"
          key={val?.id}
          style={{
            fontWeight: "600",
            fontSize: "18px",
          }}
        >
          {getQuestionaTypeSort(val)}
          {_flagRow?.name}
        </span>
      );
    }

    return "";
  };

  // 处理题型排序
  const getQuestionaTypeSort = (val: any) => {
    let arr: any = [];
    let _flagSort = 0;
    questionTypes?.map((item: any) => {
      let _flagRow = items?.filter((v: any) => {
        return item?.en_name == v?.question_type;
      });
      arr.push({
        ...item,
        list: _flagRow,
      });
    });

    let _flagArr = arr?.filter((item: any) => {
      return item?.list?.length > 0;
    });

    _flagArr?.map((item: any, index: any) => {
      if (val?.question_type == item?.en_name) {
        _flagSort = index;
      }
    });

    return questionNumber[_flagSort]?.large + "、";
  };

  const activeItem = activeId
    ? (items.find((item: any) => item?.id === activeId) ?? null)
    : null;

  return (
    <>
      <DndContext
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <SortableContext
          items={items?.map((i: any) => i?.id)}
          strategy={verticalListSortingStrategy}
        >
          {items?.map((item: any, index: any) => {
            return (
              <div key={item?.id + index}>
                <h5
                  style={{
                    margin: "0",
                  }}
                >
                  {/* {getQuestionaType(item)} */}
                </h5>
                <div className="question_row_box" key={item?.id + index}>
                  <DraggableNode
                    key={item?.id + index}
                    val={{ ...item, rowKey: index }}
                    delRow={delRow}
                    handleChangeTi={handleChangeTi}
                    chengeAnswerArea={chengeAnswerArea}
                    changeScore={changeScore}
                    showScore={props?.showScore}
                    flagStatusTi={flagStatusTi}
                    isHighlighted={highlightId === item?.id}
                    toggleShowDetails={toggleShowDetails}
                    setType={props?.setType}
                    selectPrintType={selectPrintType}
                    download={download}
                  />
                </div>
              </div>
            );
          })}
        </SortableContext>
        {/* 占位防止变形 */}
        <DragOverlay>
          {activeItem ? (
            <div className="question_row_box">
              <DraggableNode
                val={{
                  ...activeItem,
                  rowKey: items.findIndex((i: any) => i?.id === activeItem.id),
                }}
                delRow={delRow}
                handleChangeTi={handleChangeTi}
                chengeAnswerArea={chengeAnswerArea}
                changeScore={changeScore}
                showScore={props?.showScore}
                flagStatusTi={flagStatusTi}
                toggleShowDetails={toggleShowDetails}
                setType={props?.setType}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {change_status_ti_drawer && (
        <ChangeKnowledgeModal
          {...props}
          // submitChapterFn={submitChapterFn}
          // chapteList={chapteList}
          // rowDrawer={rowDrawer}
          questionsUpdateChange={questionsUpdateChange}
          changeRow={changeRow}
          items={items}
          openDrawer={change_status_ti_drawer}
          uploadType={uploadType}
          attributeObject={props?.attributeObject}
          // attributeObject={searchRow}
          addSearchRow={searchRow}
          cancel={() => {
            setChange_status_ti_drawer(false);
            props?.closeDrawer?.(false);
          }}
        />
      )}
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(memo(App));
