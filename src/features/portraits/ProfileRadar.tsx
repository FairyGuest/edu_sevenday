import { useLayoutEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { useElementSize } from "@/hooks/useElementSize";
import { score } from "./domain";

function axisLabel(name: string, columns: number) {
  const characters = Array.from(String(name));
  const lineSize =
    Math.ceil(characters.length / Math.ceil(characters.length / columns)) ||
    columns;
  const lines = [];
  for (let index = 0; index < characters.length; index += lineSize)
    lines.push(characters.slice(index, index + lineSize).join(""));
  return lines.join("\n");
}

export default function ProfileRadar({
  items,
  color,
  personal,
  max = 100,
  seriesName,
  height = 248,
}: {
  items: any[];
  color: string;
  personal: boolean;
  max?: number;
  seriesName?: string;
  height?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<ReactECharts>(null);
  const { width } = useElementSize(host);
  const resize = () =>
    chart.current?.getEchartsInstance()?.resize({ width, height });
  useLayoutEffect(() => {
    if (width > 0) resize();
  }, [width, height]);
  const compact = width < 280;
  const labelWidth = compact ? 48 : 70;
  const labelGap = compact ? 8 : 12;
  const labels = items.map((item) => axisLabel(item.name, compact ? 4 : 6));
  const labelHeight =
    Math.max(1, ...labels.map((label) => label.split("\n").length)) * 15;
  const radius = Math.max(
    20,
    Math.min(
      height / 2 - labelHeight - labelGap - 8,
      width / 2 - labelWidth - labelGap - 8,
    ),
  );
  return (
    <div
      ref={host}
      data-axis-count={items.length}
      aria-label={items.map((item) => `${item.name}：${item.value}`).join("；")}
      style={{ width: "100%", minWidth: 0, height }}
    >
      {width > 0 && (
        <ReactECharts
          ref={chart}
          autoResize={false}
          onChartReady={resize}
          style={{ height, width: "100%" }}
          notMerge
          option={{
            animation: false,
            tooltip: { trigger: "item", confine: true },
            radar: {
              center: ["50%", "50%"],
              radius,
              splitNumber: 4,
              axisNameGap: labelGap,
              indicator: labels.map((name) => ({
                name,
                max,
              })),
              axisName: {
                color: "#737f88",
                fontSize: 11,
                width: labelWidth,
                lineHeight: 15,
                overflow: "break",
              },
              axisLine: { lineStyle: { color: "#e6ebef" } },
              splitLine: { lineStyle: { color: "#e2e8ec" } },
              splitArea: { areaStyle: { color: ["#fff", "#f8fafb"] } },
            },
            series: [
              {
                type: "radar",
                symbolSize: 4,
                data: items.every(
                  (i) =>
                    typeof i.value === "number" && Number.isFinite(i.value),
                )
                  ? [
                      ...(personal &&
                      items.every((i) => score(i.class_avg) !== null)
                        ? [
                            {
                              name: "班级均值",
                              value: items.map((i) => i.class_avg),
                              lineStyle: {
                                color: "#9da4ae",
                                type: "dashed",
                                width: 1.5,
                              },
                              itemStyle: { color: "#9da4ae" },
                              areaStyle: { opacity: 0 },
                            },
                          ]
                        : []),
                      {
                        name:
                          seriesName || (personal ? "个人表现" : "班级均值"),
                        value: items.map((i) => i.value),
                        itemStyle: { color },
                        lineStyle: { width: 2 },
                        areaStyle: { color, opacity: 0.14 },
                      },
                    ]
                  : [],
              },
            ],
          }}
        />
      )}
    </div>
  );
}
