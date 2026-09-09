import { useEffect, useState } from "react";
import { useDispatch } from "umi";
import { message } from "antd";
import { DndContext } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import QuestionType from "@/components/QuestionType";
import type { DragEndEvent } from "@dnd-kit/core"; // @ts-ignore

import "./index.less";

const App = (props: any) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (props?.questions?.length > 0) {
      setItems(props?.questions);
    }
  }, [props]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      let flag_row = items.find((i: any) => i?.id === active?.id);

      let flag_first_index = items.findIndex((item: any) => {
        return item?.question_type == flag_row?.question_type;
      });

      let flag_num = items?.filter((item: any, index: any) => {
        return item?.question_type == flag_row?.question_type;
      });

      const overIndex = items.findIndex((i: any) => i?.id === over?.id);

      if (overIndex > flag_first_index + flag_num?.length - 1) {
        message.warning("不是一个题型，无法继续移动");
        return;
      }
      if (flag_first_index > overIndex) {
        message.warning("不是一个题型，无法继续移动");
        return;
      }

      const activeIndex = items.findIndex((i: any) => i?.id === active?.id);
      const newlist = arrayMove(items, activeIndex, overIndex);
      setItems(newlist);
    }
  };

  const DraggableListNode = (val: any) => {
    return (
      <div style={{ paddingBottom: "16px" }}>
        <div className="question_drag_box">
          <QuestionType
            showAnswer={props?.showAnswer}
            row={val}
            rowIndex={val?.rowIndex}
            rowKey={val?.rowIndex}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <DndContext
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i: any) => i?.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item: any, index: any) => (
            <div className="question_row_box" key={item.id}>
              <DraggableListNode
                key={item.id}
                {...item}
                rowKey={index}
                rowIndex={index}
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </>
  );
};

export default App;
