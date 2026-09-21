import { useLayoutEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { useElementSize } from "@/hooks/useElementSize";
import { score } from "./domain";

export default function ProfileRadar({
  items,
  color,
  personal,
}: {
  items: any[];
  color: string;
  personal: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<ReactECharts>(null);
  const { width } = useElementSize(host);
  const resize = () =>
    chart.current?.getEchartsInstance()?.resize({ width, height: 224 });
  useLayoutEffect(() => {
    if (width > 0) resize();
  }, [width]);
  const compact = width < 280;
  const radius = Math.max(28, Math.min(78, width / 2 - 62));
  return (
    <div ref={host} style={{ width: "100%", minWidth: 0, height: 224 }}>
      {width > 0 && (
        <ReactECharts
          ref={chart}
          autoResize={false}
          onChartReady={resize}
          style={{ height: 224, width: "100%" }}
          notMerge
          option={{
            animation: false,
            tooltip: { trigger: "item", confine: true },
            radar: {
              center: ["50%", "51%"],
              radius,
              splitNumber: 4,
              axisNameGap: compact ? 8 : 12,
              indicator: items.map((i) => ({
                name:
                  compact && i.name.length > 4
                    ? i.name.slice(0, -2) + "\n" + i.name.slice(-2)
                    : i.name,
                max: 100,
              })),
              axisName: {
                color: "#737f88",
                fontSize: 11,
                width: compact ? 48 : 70,
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
                data: [
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
                    name: personal ? "个人表现" : "班级均值",
                    value: items.map((i) => i.value),
                    itemStyle: { color },
                    lineStyle: { width: 2 },
                    areaStyle: { color, opacity: 0.14 },
                  },
                ],
              },
            ],
          }}
        />
      )}
    </div>
  );
}
