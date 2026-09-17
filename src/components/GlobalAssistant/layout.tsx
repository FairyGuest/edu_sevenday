import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Placement = "floating" | "sidebar";
const LayoutContext = createContext<{ placement: Placement; setPlacement: (value: Placement) => void }>({ placement: "floating", setPlacement: () => {} });
function savedPlacement(): Placement {
  try { return localStorage.getItem("assistant:placement") === "sidebar" ? "sidebar" : "floating"; } catch { return "floating"; }
}

/** One React commit lays out both the business page and the chat. Neither is remounted. */
export function AssistantLayout({ children }: { children: ReactNode }) {
  const [placement, setPlacement] = useState<Placement>(savedPlacement);
  useEffect(() => { try { localStorage.setItem("assistant:placement", placement); } catch {} }, [placement]);
  return <LayoutContext.Provider value={{ placement, setPlacement }}>
    <div className={"ga_workspace ga_workspace--" + placement}>{children}</div>
  </LayoutContext.Provider>;
}
export const useAssistantLayout = () => useContext(LayoutContext);
