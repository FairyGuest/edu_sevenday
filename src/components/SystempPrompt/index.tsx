import { InfoCircleOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import React, { useMemo, useRef, useState } from "react";
import { connect } from "umi";
import Example from "./Example";
import SelectionModal from "./SelectionModal";
import "./index.less";

const prefix = "ai-config-info-input";
const AIConfigInfoInput = function (props: any) {
  const { id, value, onChange, agentValue } = props;

  const contentEditableRef = useRef<any>(null); // 输入框ref
  const [showExamples, setShowExamples] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [distance, setDistance] = useState({ top: 0, left: 0 });
  const gSelection = useRef<any>(null);
  const gLastEditRange = useRef<any>(null);
  const ignoreBlur = useRef(false);

  const saveSelection = () => {
    const selection: any = window.getSelection();
    const range = selection?.getRangeAt(0);
    if (selection?.rangeCount > 0 && range) {
      gSelection.current = selection;
      gLastEditRange.current = range;

      // 创建一个临时光标范围来计算当前输入字符的位置
      const tempRange = range.cloneRange();
      tempRange.collapse(false); // 将光标放置在当前输入字符后

      // 获取当前字符位置的边界矩形
      const rect = tempRange.getBoundingClientRect();
      const parentRect = contentEditableRef.current.getBoundingClientRect();

      // 计算相对于输入框顶部的距离- 当前输入字符到输入框顶部的距离
      const distance_to_top = rect.top - parentRect.top;
      const distance_to_left = rect.left - parentRect.left;
      setDistance({ top: distance_to_top + 20, left: distance_to_left });
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key == "@") {
      setTimeout(() => {
        setShowSelectionModal(true);
        ignoreBlur.current = true;
      }, 100);
    }
  };

  const createSpan = (param: any) => {
    const { title, id } = param;
    if (title && id) {
      const node = document.createElement("span");
      node.innerText = "@" + title;
      node.setAttribute("data", `${id}`);
      node.setAttribute("contentEditable", "false");
      node.setAttribute("style", "color:#1C6CFF");
      return node;
    }
  };

  // 自定义删除函数
  const deleteAtSymbol = () => {
    const selection: any = gSelection.current;
    if (selection?.rangeCount > 0) {
      const range = gLastEditRange.current;
      range.setStart(range.startContainer, range.startOffset - 1); // 将起始位置向左移动一位，覆盖 `@`
      range.deleteContents(); // 删除选区内容（即 `@` 符号）
    }
  };
  // 选择下拉选项回调
  const updEditContent = (selectedInfo: any, type: any) => {
    handleCloseModal();
    setTimeout(() => {
      updInputContent(selectedInfo); // 更新输入框显示
      // getEndFoucs(contentEditableRef);
    }, 100);
  };

  // 更新输入框值
  const updInputContent = (selectedInfo: any) => {
    const selection = gSelection.current;
    const range = gLastEditRange.current;
    const node = createSpan(selectedInfo);
    if (selection && range) {
      deleteAtSymbol();

      range?.deleteContents();
      range?.insertNode(node);

      selection?.removeAllRanges();
      selection?.addRange(range);
      range.collapse(false);
    }
  };

  const handleCloseModal = () => {
    ignoreBlur.current = false;
    setShowSelectionModal(false);
  };

  const handleSubmitValue = () => {
    if (ignoreBlur.current) {
      return;
    }

    let tempText = contentEditableRef?.current?.innerHTML.trim();
    // 如果内容为空，移除掉任何 <br> 标签
    if (!tempText || tempText === "<br>") {
      tempText = ""; // 设置为空字符串，避免无意义的 <br> 插入
    }
    onChange(tempText);
  };

  const onUseExample = (exampleText: string) => {
    onChange(exampleText);
    setShowExamples(false);
  };

  const exampleList = useMemo(() => {
    return [
      {
        label: `示例：`,
        key: "1",
        text: `# 角色设定：你是一个高效的AI助教，致力于协助高校老师整理文件和制作讲义。

                # 能力设定：
                1. 资料管理：将课程相关信息整合进知识库。当请求查找资料时，从知识库中检索并提供准确结果。
                2. 讲义生成：根据主题及用户要求，从知识库中提取相关信息并生成讲义课件。

                # 情景使用工具逻辑：
                1. 查找课程资料时，优先从知识库中检索信息，注明引用来源；若知识库内容未覆盖提问内容，调用互联网工具搜索。
                2. 设计讲义时，调用Pexels获取图片插件，提供插图设计推荐。

                # 行为约束：
                1. 仅围绕高校教学相关事务进行操作，不输出无关内容。
                2. 输出语言需要符合学术规范和标准，语言风格流畅严谨。示例：
                  - 讲义名称：卷积神经网络（CNN）基础概述
                  - 来源：深度学习讲义系列，李明教授编
                  - 内容介绍：本讲义详细讲解了卷积神经网络的基本结构......
        `,
      },
    ];
  }, [agentValue]);

  return (
    <div className={prefix} id={id}>
      <div className="tooltip">
        <Popover
          open={showExamples}
          onOpenChange={(open) => setShowExamples(open)}
          content={<Example onSubmit={onUseExample} data={exampleList} />}
          getPopupContainer={(triggerNode: any) => triggerNode.parentNode}
        >
          示例&nbsp;
          <InfoCircleOutlined />
        </Popover>
      </div>

      {showSelectionModal && (
        <SelectionModal
          updEditContent={updEditContent}
          onClose={handleCloseModal}
          position={distance}
        />
      )}

      <div
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        ref={contentEditableRef}
        spellCheck={false} // 禁止红色波浪线
        //@ts-ignore
        placeholder={`角色设定：\n说明ta的角色和职责，例如：Boss

          能力设定：\n描述ta的能力或希望他完成的工作事项，例如：帮我查询明天上海的天气
          
          可用工具描述：\n当XXX情况下调用@Guery；当XXX情况下调用@AQ；

          输出约束：\n希望按照什么格式输出；
          `}
        className="search_input_box"
        onKeyDown={handleKeyDown}
        onInput={saveSelection}
        onBlur={handleSubmitValue}
        onFocus={() => setShowSelectionModal(false)}
      />
    </div>
  );
};

export default connect(({}: any) => ({}))(AIConfigInfoInput);
