import { ReactNode, useMemo } from "react";
import type { BreadcrumbProps as AntBreadcrumbProps } from "antd";
import { ZYIcon } from "@/components";

export interface BreadcrumbItem {
  title?: ReactNode;
  onClick?: () => void;
}

const BACK_TITLE = "返回";

export function useBreadcrumb(
  items: BreadcrumbItem[],
): AntBreadcrumbProps["items"] {
  return useMemo(() => {
    if (!items?.length) return [];

    return items.map((item, index) => {
      const isFirst = index === 0;
      const isLast = index === items.length - 1;
      const clickable = Boolean(item.onClick) && !isLast;

      if (isFirst) {
        return {
          title: (
            <span
              className="setting-topic-breadcrumb__back"
              onClick={item.onClick}
            >
              <span className="setting-topic-breadcrumb__back-icon">
                <ZYIcon type="zuo" size={12} />
              </span>
              <span className="setting-topic-breadcrumb__back-text">
                {item.title ?? BACK_TITLE}
              </span>
            </span>
          ),
        };
      }

      return {
        title: (
          <span
            className={`setting-topic-breadcrumb__text${
              clickable ? " setting-topic-breadcrumb__text--link" : ""
            }${isLast ? " setting-topic-breadcrumb__text--current" : ""}`}
            onClick={clickable ? item.onClick : undefined}
          >
            {item.title}
          </span>
        ),
      };
    });
  }, [items]);
}
