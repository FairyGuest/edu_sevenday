import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Placement = "floating" | "sidebar";
const LayoutContext = createContext<{
  placement: Placement;
  setPlacement: (value: Placement) => void;
  minimized: boolean;
  setMinimized: (value: boolean) => void;
}>({
  placement: "floating",
  setPlacement: () => {},
  minimized: false,
  setMinimized: () => {},
});
function savedPlacement(): Placement {
  try {
    return localStorage.getItem("assistant:placement") === "sidebar"
      ? "sidebar"
      : "floating";
  } catch {
    return "floating";
  }
}

/** One React commit lays out both the business page and the chat. Neither is remounted. */
export function AssistantLayout({ children }: { children: ReactNode }) {
  const [placement, setPlacement] = useState<Placement>(savedPlacement);
  const [minimized, setMinimized] = useState(() => {
    try {
      return localStorage.getItem("assistant:minimized") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("assistant:placement", placement);
    } catch {}
  }, [placement]);
  useEffect(() => {
    try {
      localStorage.setItem("assistant:minimized", String(minimized));
    } catch {}
  }, [minimized]);
  return (
    <LayoutContext.Provider
      value={{ placement, setPlacement, minimized, setMinimized }}
    >
      <div
        className={
          "ga_workspace ga_workspace--" +
          placement +
          (minimized ? " ga_workspace--minimized" : "")
        }
      >
        {children}
      </div>
    </LayoutContext.Provider>
  );
}
export const useAssistantLayout = () => useContext(LayoutContext);
