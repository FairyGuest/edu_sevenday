import { Breadcrumb as AntBreadcrumb } from "antd";
import { useBreadcrumb, BreadcrumbItem } from "./useBreadcrumb";
import "./index.less";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  const breadcrumbItems = useBreadcrumb(items);

  if (!items?.length) return null;

  return (
    <div
      className={`setting-topic-breadcrumb${className ? ` ${className}` : ""}`}
    >
      <AntBreadcrumb separator="/" items={breadcrumbItems} />
    </div>
  );
};

export default Breadcrumb;
export { useBreadcrumb };
export type { BreadcrumbItem };
