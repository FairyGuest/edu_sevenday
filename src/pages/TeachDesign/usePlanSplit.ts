import { useCallback, useState, type RefObject } from "react";
import { useElementSize } from "@/hooks/useElementSize";

/** Keep each orientation's proportions when the assistant or viewport changes size. */
export function usePlanSplit(ref: RefObject<HTMLDivElement>) {
  const { width, height } = useElementSize(ref);
  const stacked = width > 0 && width < 1020;
  const [ratios, setRatios] = useState({ horizontal: 0.5, vertical: 0.5 });
  const axis = stacked ? "vertical" : "horizontal";
  const saved = ratios[axis];
  const ratio = saved === 0 || saved === 1 ? saved : stacked
    ? Math.max(0.2, Math.min(0.8, saved))
    : width > 0 ? Math.max(434 / width, Math.min(1 - 560 / width, saved)) : saved;
  const extent = stacked ? height : width;
  const onResize = useCallback((next: number[]) => {
    const total = next[0] + next[1];
    if (!Number.isFinite(total) || total <= 0) return;
    const value = Math.max(0, Math.min(1, next[0] / total));
    setRatios(prev => prev[axis] === value ? prev : { ...prev, [axis]: value });
  }, [axis]);
  return {
    stacked, onResize,
    // Update the child's dimensions and axis in the same render. Otherwise AntD's
    // observer can cache the previous axis before React switches the layout.
    splitterStyle: { width, height },
    panelSizes: [`${ratio * 100}%`, `${(1 - ratio) * 100}%`],
    sizes: [extent * ratio, extent * (1 - ratio)],
    leftWidth: ratio === 0 ? 0 : stacked ? width : width * ratio,
    rightWidth: ratio === 1 ? 0 : stacked ? width : width * (1 - ratio),
  };
}
