import { numToLetter } from "@/utils";
import "./index.less";

const FormOptionMultiple = (props: any) => {
  const onChangeMultiple = (index: any) => {
    const arr = props?.value || [];
    const hasValue = arr.includes?.(index);
    return hasValue
      ? arr.filter((item: any) => item !== index)
      : [...arr, index];
  };

  return (
    <div className="form-option-container">
      {props?.options?.map?.((item: any, index: number) => {
        const optionValue = numToLetter(index + 1);
        const selectedIndexes = props?.value || [];
        const isActive = selectedIndexes?.includes?.(index);

        return (
          <div
            className={`option-btn ${isActive ? "option-btn-activate" : ""}`}
            key={index}
            onClick={() => {
              if (props?.readOnly) {
                return;
              }
              // multiple=true 或多选题 mode：可多选；否则单选
              const isMultiple =
                props?.multiple === true ||
                props?.mode === "多选题" ||
                props?.mode === "multiple_choice" ||
                props?.mode === "multiple";
              const selectList = isMultiple
                ? onChangeMultiple(index)
                : [index];
              props?.onChange?.(selectList);
            }}
          >
            {optionValue}
          </div>
        );
      })}
    </div>
  );
};

export default FormOptionMultiple;
