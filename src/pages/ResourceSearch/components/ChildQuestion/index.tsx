import { Flex } from "antd";
import { useState, useCallback, useMemo } from "react";
import AudioPlayer from "../AudioPlayer";
import SafeMathRenderer from "../SafeMathRenderer";
import "./index.less";

// 子题组件
interface ChildQuestionProps {
  child: any;
  childIndex: number;
}

const ChildQuestion = ({ child, childIndex }: ChildQuestionProps) => {
  const [showChildAnswer, setShowChildAnswer] = useState(false);
  const childData = child;
  const childAnswer = childData.answerList ?? childData.answer;

  const childIsSelectQuestion = useMemo(() => Array.isArray(child.options), [child.options]);
  
  const childAnswerDisplay = useMemo(() => {
    if (!childIsSelectQuestion) {
      if (Array.isArray(childAnswer)) {
        return childAnswer.join('、');
      }
      return childAnswer;
    }
    
    if (Array.isArray(childAnswer)) {
      return childAnswer.map((ans: any) => {
        if (typeof ans === 'number') {
          return String.fromCharCode(65 + ans);
        } else {
          const index = childData.options.findIndex((option: string) => option === ans);
          return index >= 0 ? String.fromCharCode(65 + index) : ans;
        }
      }).join('、');
    } else {
      if (typeof childAnswer === 'number') {
        return String.fromCharCode(65 + childAnswer);
      } else {
        const index = childData.options.findIndex((option: string) => option === childAnswer);
        return index >= 0 ? String.fromCharCode(65 + index) : childAnswer;
      }
    }
  }, [childIsSelectQuestion, childAnswer, childData.options]);

  const handleChildAnalysisClick = useCallback(() => {
    setShowChildAnswer(!showChildAnswer);
  }, [showChildAnswer]);

  return (
    <div className="child-question">
      {/* 子题可点击区域 */}
      <div className="child-question-clickable" onClick={handleChildAnalysisClick}>
        {/* 子题题干 */}
        <div className="child-question-stem">
          <span className="child-question-number">({childIndex + 1})</span>
          <SafeMathRenderer html={`<p>${childData.stem}</p>`} className="child-question-text" />
        </div>

        {/* 子题音频 */}
        {/* {childData.quesAudio && (
          <div className="child-question-audio">
            <AudioPlayer src={childData.quesAudio}/>
          </div>
        )} */}

        {/* 子题选项 */}
        {childIsSelectQuestion && (
          <div className="child-question-options">
            {childData.options.map((option: string, optionIndex: number) => (
              <Flex key={optionIndex} className="child-option-item" align="flex-start">
                <span className="child-option-label">{String.fromCharCode(65 + optionIndex)}.</span>
                <SafeMathRenderer html={option} className="child-option-content" />
              </Flex>
            ))}
          </div>
        )}
      </div>

      {/* 子题答案和解析 */}
      {showChildAnswer && (
        <Flex vertical gap={8} className="child-question-answer-section">
          {childAnswer && (
            <div className="child-question-answer">
              【答案】
              {!childIsSelectQuestion ? (
                <SafeMathRenderer html={`<p>${childAnswerDisplay}</p>`} />
              ) : (
                <SafeMathRenderer html={`<p>${childAnswerDisplay}</p>`} />
              )}
            </div>
          )}

          {childData.quesAnalysis && (
            <div className="child-question-analysis">
              【分析】
              <SafeMathRenderer html={`<p>${childData.quesAnalysis}</p>`} />
            </div>
          )}
        </Flex>
      )}
    </div>
  );
};

// 子题列表组件
interface ChildQuestionListProps {
  children: any[];
}

export const ChildQuestionList = ({ children }: ChildQuestionListProps) => {
  return (
    <Flex vertical gap={16} className="question-children">
      {children.map((child: any, childIndex: number) => (
        <ChildQuestion
          key={child.id}
          child={child}
          childIndex={childIndex}
        />
      ))}
    </Flex>
  );
};

export default ChildQuestion;