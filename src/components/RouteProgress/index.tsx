import { useEffect, useRef, useState } from "react";
import { useLocation } from "@umijs/max";
import { beginNavigation, finishNavigation, subscribeNavigation } from "./coordinator";
import "./index.less";

export default function RouteProgress() {
  const location = useLocation();
  const firstRef = useRef(true);
  const [pending, setPending] = useState(false);
  const [w, setW] = useState(0);

  useEffect(() => subscribeNavigation((state) => {
    setPending(state.pending);
    setW(state.pending ? 35 : 100);
  }), []);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    document.querySelector<HTMLElement>(".content_wrap, .page_root")?.scrollTo({ top: 0 });
    const navigation = beginNavigation(`${location.pathname}${location.search}`);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!navigation.signal.aborted) finishNavigation(navigation.id);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (pending) return;
    const timer = window.setTimeout(() => setW(0), 180);
    return () => window.clearTimeout(timer);
  }, [pending]);

  if (!w) return null;
  return <div className="rp_wrap" aria-hidden><i style={{ width: `${w}%` }} /></div>;
}
