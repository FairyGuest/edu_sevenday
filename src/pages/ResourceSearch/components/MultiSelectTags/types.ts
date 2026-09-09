export interface Option {
  label: string;
  value: string;
}

export interface MultiSelectTagsProps {
  options: Option[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
}