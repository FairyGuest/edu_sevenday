import { ZYIcon } from "@/components";
import { uuid } from "@/utils";
import { Button, message } from "antd";
import { useEffect, useRef, useState } from "react";
import "./index.less";
const QuestionInput = (props: {
  value: string;
  onQuestionChange: (value: string, id: number | string) => void;
  onDeleteQuestion: (id: number | string) => void;
  id: number | string;
  onAddQuestion: Function;
  isLast: boolean;
}) => {
  const {
    value,
    onQuestionChange,
    id,
    onAddQuestion,
    onDeleteQuestion,
    isLast,
  } = props;
  const customTextareaRef = useRef<any>(null);
  const [gSelection, setGSelection] = useState<any>(null);
  const [gLastEditRange, setGLastEditRange] = useState<any>(null);
  const added = useRef<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [inputValue, setInputValue] = useState(value);
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  useEffect(() => {
    if (value || !isLast) {
      // 存在值或者index不是最后一个 说明已经添加过
      added.current = true;
      setShowDeleteIcon(true);
    }
  }, [value]);
  //  插入节点
  const insertNode = (node: any) => {
    // 获取当前选区的范围
    // 获取当前选区的范围
    const selection = gSelection;
    const range = gLastEditRange;
    if (selection && range) {
      range?.deleteContents();
      range?.insertNode(node);
      // 重置选区
      selection?.removeAllRanges();
      selection?.addRange(range);
      range.collapse(false); // 光标移至最后

      const text = getText();
      if (!added.current && text) {
        onAddQuestion();
        added.current = true;
        setShowDeleteIcon(true);
      }
    }
  };
  const handleInput = (event: any) => {
    const selection: any = window.getSelection();
    if (selection?.rangeCount > 0) {
      setGSelection(selection);
      setGLastEditRange(selection.getRangeAt(0));
    }
    const text = getText();
    if (!added.current && text && event.target) {
      onAddQuestion();
      added.current = true;
      setShowDeleteIcon(true);
    }
  };

  // 添加标签
  const addTag = (param: any) => {
    const { text, id } = param;
    if (text && id) {
      const pSpan = document.createElement("wise");
      pSpan.setAttribute("class", `wise_text`);

      const node = document.createElement("span");
      node.innerText = text;

      const endNode = document.createElement("span");
      endNode.innerHTML = "&nbsp;";
      const startNode = document.createElement("span");
      startNode.innerHTML = "&nbsp;";

      node.setAttribute("data", `${id}`);
      node.setAttribute("class", `edit_text`);
      node.setAttribute("contentEditable", "false");

      pSpan.append(startNode);
      pSpan.append(node);
      pSpan.append(endNode);

      insertNode(pSpan);
    }
  };

  // 添加因子
  const getText = () => {
    const tempText = customTextareaRef?.current?.innerHTML?.trim();
    return tempText;
  };

  const onClickEdit = (event: any) => {
    const editEle = event.target;
    const editClass = editEle?.className; //编辑节点样式
    if (editClass == "edit_text") {
      editEle.setAttribute("contentEditable", "true");
      editEle.focus();
      editEle.addEventListener("blur", () => {
        editEle.setAttribute("contentEditable", "false");
      });
    }
    handleInput(event);
  };

  const onClickInsert = () => {
    addTag({ id: uuid(), text: "我是占位符" });
  };
  const handleQuestionChange = () => {
    console.log("handleQuestionChange");
    // 失去焦点时提交数据变更
    const text = getText();
    onQuestionChange(text, id);
  };
  function onKeyDown(event: any) {
    const element = event.target;
    const keyCode = event.keyCode;
    const wise = element?.className; //编辑节点
    if (wise == "edit_text" && keyCode == 13) {
      // 可以编辑节点不支持回车
      event.preventDefault();
      return;
    }
  }
  return (
    <div className="placeholder_custom_textarea_container" key={id}>
      <Button type="link" onClick={onClickInsert} className="btn-insert">
        [插入占位]
      </Button>
      {showDeleteIcon && (
        <ZYIcon
          type="delet"
          onClick={() => onDeleteQuestion(id)}
          className="btn-delete"
        />
      )}
      <div
        dangerouslySetInnerHTML={{ __html: inputValue }}
        ref={customTextareaRef}
        contentEditable="true"
        className="constent_edit"
        onClick={onClickEdit}
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onBlur={handleQuestionChange}
      />
    </div>
  );
};
const PlaceholderEdit = (props: {
  id?: string;
  value?: [];
  onChange?: any;
}) => {
  const { id, value = [{ id: uuid(), question: "" }], onChange } = props;
  const [questionList, setQuestionList] = useState<any>(value);
  useEffect(() => {
    if (!value?.length) {
      setQuestionList([{ id: uuid(), question: "" }]);
    } else {
      setQuestionList(value);
    }
  }, [value]);
  const addQuestion = () => {
    if (questionList.length >= 10) {
      message.warning("最多可提出十个问题");
      return;
    }
    const newQuestionList = [...questionList, { id: uuid(), question: "" }]; // 添加一个空字符串
    setQuestionList(newQuestionList);
  };
  const deleteQuestion = (id: number | string) => {
    let newQuestionList = [];
    // 列表的每个question都不为空
    const emptyItem = questionList.filter((item: any) => !item.question);
    if (questionList.length == 10 && emptyItem.length == 0) {
      newQuestionList = questionList
        .filter((item: any) => item.id !== id)
        .concat([{ id: uuid(), question: "" }]);
    } else {
      newQuestionList = questionList.filter((item: any) => item.id !== id);
    }
    setQuestionList(newQuestionList);
    onChange?.(newQuestionList);
  };
  const onQuestionChange = (changedValue: string, id: number | string) => {
    // 修改数组中指定位置的值
    const newQuestionList = questionList.map((item: any) => {
      if (item.id === id) {
        return { ...item, question: changedValue };
      }
      return item;
    });
    setQuestionList(newQuestionList);
    onChange?.(newQuestionList);
  };

  return (
    <div className="placeholder_edit_container" id={id}>
      <div className="placeholder_title_continer">
        <div className="place_label">预置提问模板</div>
        <div className="tips">最多可提出十个问题</div>
      </div>
      {questionList?.map((item: any, index: number) => {
        const isLast = index === questionList.length - 1;
        return (
          <QuestionInput
            isLast={isLast}
            value={item.question}
            key={item.id}
            onQuestionChange={onQuestionChange}
            onAddQuestion={addQuestion}
            onDeleteQuestion={deleteQuestion}
            id={item.id}
          />
        );
      })}
    </div>
  );
};

export default PlaceholderEdit;
