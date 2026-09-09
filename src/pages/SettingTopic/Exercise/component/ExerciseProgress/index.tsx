import { useCallback, useEffect, useState } from "react";
import {
  DotLottieReact,
  setWasmUrl,
  type DotLottie,
} from "@lottiefiles/dotlottie-react";
import { ZYIcon } from "@/components";

import "./index.less";

setWasmUrl("/dotlottie-player.wasm");

const PROGRESS_BAR_WIDTH = 400;
const LOTTIE_RENDER_CONFIG = {
  autoResize: true,
  devicePixelRatio:
    typeof window !== "undefined" ? window.devicePixelRatio : 1,
};

interface ExerciseProgressProps {
  progress: number;
  progressMessage: string;
  className?: string;
}

const ExerciseProgress = ({
  progress,
  progressMessage,
  className,
}: ExerciseProgressProps) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const fillWidth = Math.round((clampedProgress / 100) * PROGRESS_BAR_WIDTH);
  const [showLottie, setShowLottie] = useState(false);
  const [dotLottieInstance, setDotLottieInstance] = useState<DotLottie | null>(
    null,
  );

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShowLottie(true));
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleDotLottieRef = useCallback((instance: DotLottie | null) => {
    setDotLottieInstance(instance);
  }, []);

  useEffect(() => {
    if (!dotLottieInstance) return;

    const handleReady = () => dotLottieInstance.resize();
    dotLottieInstance.addEventListener("ready", handleReady);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => dotLottieInstance.resize());
    });

    return () => dotLottieInstance.removeEventListener("ready", handleReady);
  }, [dotLottieInstance, clampedProgress]);

  return (
    <div className={`exercise-progress ${className || ""}`.trim()}>
      <ZYIcon className="progress-icon" type="zanwupinglun2" />
      <div className="progress-text">{progressMessage}</div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-track">
          <div className="progress-robot" style={{ left: fillWidth }}>
            {showLottie && (
              <DotLottieReact
                className="progress-robot-lottie"
                loop
                autoplay
                src={require("@/assets/roobot.lottie")}
                renderConfig={LOTTIE_RENDER_CONFIG}
                dotLottieRefCallback={handleDotLottieRef}
              />
            )}
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: fillWidth }}
            />
          </div>
        </div>
        <span className="progress-percent">{clampedProgress}%</span>
      </div>
    </div>
  );
};

export default ExerciseProgress;
