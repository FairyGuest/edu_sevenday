import React, { useState, useImperativeHandle, useEffect, useCallback, useRef, useMemo } from "react";
import { Drawer, Button } from "antd";
import {
  ReloadOutlined,
  ZoomInOutlined,
  RotateRightOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
} from "@ant-design/icons";
import { ZYIcon } from "@/components";

import "./index.less";

const clampIndex = (index: number, total: number) => {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
};

const clampValue = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const normalizeRotation = (value: number) => {
  const rotation = value % 360;
  return rotation < 0 ? rotation + 360 : rotation;
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const SCALE_STEP = 0.25;

export default function OriginQuestionModal({
  onRef,
  originImages = [],
}: {
  onRef: React.RefObject<any>;
  originImages?: any[];
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const imageSizeMapRef = useRef<Record<string, { width: number; height: number }>>({});
  const dragStateRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);
  const imageList = useMemo(() => originImages, [originImages]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(clampIndex(index, imageList.length));
  }, [imageList.length]);

  const currentImage = useMemo(() => imageList[currentIndex], [imageList, currentIndex]);

  const getMoveBounds = useCallback(
    (targetScale: number) => {
      const container = previewContainerRef.current;
      if (!container || !currentImage?.url) {
        return { maxX: 0, maxY: 0 };
      }

      const imageSize = imageSizeMapRef.current[currentImage.url];
      if (!imageSize?.width || !imageSize?.height) {
        return { maxX: 0, maxY: 0 };
      }

      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return { maxX: 0, maxY: 0 };
      }

      const fitRatio = Math.min(rect.width / imageSize.width, rect.height / imageSize.height);
      const baseWidth = imageSize.width * fitRatio;
      const baseHeight = imageSize.height * fitRatio;
      const normalizedRotation = normalizeRotation(rotation);
      const isQuarterTurn = normalizedRotation === 90 || normalizedRotation === 270;
      const displayWidth = isQuarterTurn ? baseHeight : baseWidth;
      const displayHeight = isQuarterTurn ? baseWidth : baseHeight;
      const scaledWidth = displayWidth * targetScale;
      const scaledHeight = displayHeight * targetScale;

      return {
        maxX: Math.max((scaledWidth - rect.width) / 2, 0),
        maxY: Math.max((scaledHeight - rect.height) / 2, 0),
      };
    },
    [currentImage?.url, rotation],
  );

  const clampOffset = useCallback(
    (targetOffset: { x: number; y: number }, targetScale: number) => {
      const { maxX, maxY } = getMoveBounds(targetScale);
      return {
        x: clampValue(targetOffset.x, -maxX, maxX),
        y: clampValue(targetOffset.y, -maxY, maxY),
      };
    },
    [getMoveBounds],
  );

  const resetTransform = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
    setIsDragging(false);
    dragStateRef.current = null;
  }, []);

  const updateScale = useCallback(
    (nextScaleInput: number) => {
      setScale((prevScale) => {
        const nextScale = clampValue(nextScaleInput, MIN_SCALE, MAX_SCALE);
        if (nextScale === prevScale) {
          return prevScale;
        }
        setOffset((prevOffset) => {
          const ratio = nextScale / prevScale;
          return clampOffset(
            {
              x: prevOffset.x * ratio,
              y: prevOffset.y * ratio,
            },
            nextScale,
          );
        });
        return nextScale;
      });
    },
    [clampOffset],
  );

  useImperativeHandle(onRef, () => ({
    openModal: () => {
      setIsModalVisible(true);
    },
  }));

  useEffect(() => {
    setCurrentIndex(0);
    resetTransform();
  }, [imageList, resetTransform]);

  useEffect(() => {
    resetTransform();
  }, [currentIndex, resetTransform]);

  useEffect(() => {
    if (!isModalVisible) return;
    const container = previewContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      setOffset((prevOffset) => clampOffset(prevOffset, scale));
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [isModalVisible, clampOffset, scale]);

  useEffect(() => {
    setOffset((prevOffset) => clampOffset(prevOffset, scale));
  }, [rotation, clampOffset, scale]);

  const canGoPrev = currentIndex === 0;
  const canGoNext = currentIndex >= imageList.length - 1;
  const cursorStyle = scale > 1 ? (isDragging ? "grabbing" : "grab") : "default";

  return (
    <Drawer
      className="origin-question-drawer"
      title="原题预览"
      open={isModalVisible}
      onClose={() => setIsModalVisible(false)}
      width='45%'
      closable={{ placement: "end" }}
      mask={false}
    >
      <div className="origin-question-viewer">
        <div className="origin-question-thumbnails">
          <Button
            className="number-prev"
            color="default"
            variant="filled"
            icon={<ZYIcon type="zuo" />}
            disabled={canGoPrev}
            onClick={() => goToIndex(Math.max(currentIndex - 1, 0))}
          />
          <div className="origin-question-thumbnail-list">
            {imageList.map((item, index) => (
              <div
                key={index}
                className={`origin-question-thumbnail${index === currentIndex ? " active" : ""}`}
                onClick={() => goToIndex(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <Button
            className="number-next"
            icon={<ZYIcon type="you" />}
            color="default"
            variant="filled"
            disabled={canGoNext}
            onClick={() => goToIndex(Math.min(currentIndex + 1, (imageList?.length ?? 0) - 1))}
          />
        </div>

        <div ref={previewContainerRef} className="origin-question-preview-host">
          {currentImage ? (
            <div
              className="origin-question-preview-stage"
              onWheel={(event) => {
                event.preventDefault();
                updateScale(scale + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP));
              }}
            >
              <img
                key={currentImage.url}
                src={currentImage.url}
                draggable={false}
                className="origin-question-preview-image"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  cursor: cursorStyle,
                }}
                onLoad={(event) => {
                  const target = event.currentTarget;
                  imageSizeMapRef.current[currentImage.url] = {
                    width: target.naturalWidth,
                    height: target.naturalHeight,
                  };
                  setOffset((prevOffset) => clampOffset(prevOffset, scale));
                }}
                onPointerDown={(event) => {
                  if (scale <= 1) return;
                  event.preventDefault();
                  dragStateRef.current = {
                    startX: event.clientX,
                    startY: event.clientY,
                    offsetX: offset.x,
                    offsetY: offset.y,
                  };
                  setIsDragging(true);
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (!isDragging || !dragStateRef.current) return;
                  const deltaX = event.clientX - dragStateRef.current.startX;
                  const deltaY = event.clientY - dragStateRef.current.startY;
                  setOffset(
                    clampOffset(
                      {
                        x: dragStateRef.current.offsetX + deltaX,
                        y: dragStateRef.current.offsetY + deltaY,
                      },
                      scale,
                    ),
                  );
                }}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                  setIsDragging(false);
                  dragStateRef.current = null;
                }}
                onPointerCancel={() => {
                  setIsDragging(false);
                  dragStateRef.current = null;
                }}
              />

              <Button
                className="origin-question-switch-button origin-question-switch-left"
                icon={<ZYIcon type="zuo" />}
                color="default"
                variant="filled"
                disabled={canGoPrev}
                onClick={() => goToIndex(Math.max(currentIndex - 1, 0))}
              />
              <Button
                className="origin-question-switch-button origin-question-switch-right"
                icon={<ZYIcon type="you" />}
                color="default"
                variant="filled"
                disabled={canGoNext}
                onClick={() => goToIndex(Math.min(currentIndex + 1, imageList.length - 1))}
              />

              <div className="origin-question-preview-index">
                {currentIndex + 1} / {imageList.length}
              </div>

              <div className="origin-question-toolbar">
                <Button type="text" icon={<RotateLeftOutlined />} onClick={() => setRotation((prev) => prev - 90)} />
                <Button type="text" icon={<RotateRightOutlined />} onClick={() => setRotation((prev) => prev + 90)} />
                <Button
                  type="text"
                  icon={<ZoomOutOutlined />}
                  disabled={scale <= MIN_SCALE}
                  onClick={() => updateScale(scale - SCALE_STEP)}
                />
                <Button
                  type="text"
                  icon={<ZoomInOutlined />}
                  disabled={scale >= MAX_SCALE}
                  onClick={() => updateScale(scale + SCALE_STEP)}
                />
                <Button type="text" icon={<ReloadOutlined />} onClick={resetTransform} />
              </div>
            </div>
          ) : (
            <div className="origin-question-empty">暂无图片</div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
