import { memo } from "react";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import MarkdownRender from "@/components/MarkdownRender";
import "./index.less";

/** Shared rich text for imported questions and teaching resources. */
const schema: typeof defaultSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [["className", /^language-./, "math-inline", "math-display"]],
  },
};

function LearningContent({
  children,
  className = "",
}: {
  children?: string | null;
  className?: string;
}) {
  return (
    <div className={`learning-content ${className}`}>
      <MarkdownRender
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeKatex]}
      >
        {String(children || "")}
      </MarkdownRender>
    </div>
  );
}

export default memo(LearningContent);
