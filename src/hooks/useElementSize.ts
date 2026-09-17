import { useLayoutEffect, useState, type RefObject } from "react";

/** Measure the actual host, including sidebar/splitter changes without window resize broadcasts. */
export function useElementSize<T extends HTMLElement>(ref: RefObject<T>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    let frame = 0;
    const measure = () => {
      const width = Math.round(host.clientWidth), height = Math.round(host.clientHeight);
      setSize(prev => prev.width === width && prev.height === height ? prev : { width, height });
    };
    measure();
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); });
    observer.observe(host);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [ref]);
  return size;
}
