import React from "react";
import MathHtmlRenderer from "@/components/MathHtmlRenderer";

interface AnswerLabelProps {
  answer?: string;
  row?: any;
}

const AnswerLabel: React.FC<AnswerLabelProps> = ({ answer = "", row }) => {
  return (
    <div className="answer-label">
      <span className="answer-label-tag">【答案】</span>
      <div className="answer-label-content">
        {answer ? <MathHtmlRenderer htmlString={answer} row={row} /> : null}
      </div>
    </div>
  );
};

export default AnswerLabel;
