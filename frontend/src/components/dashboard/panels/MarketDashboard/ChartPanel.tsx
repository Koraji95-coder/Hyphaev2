// src/components/dashboard/panels/MarketDashboard/ChartPanel.tsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ComposedChart,
  Scatter,
  ReferenceLine,
} from "recharts";
import { indicators as indicatorsRegistry } from "@/lib/indicators/registry";

interface ChartPanelProps {
  data: any[];
  chartType: "line" | "candle" | "volume";
  setChartType: (t: "line" | "candle" | "volume") => void;
  indicators: Record<string, number[]> | null;
  trendlines: any[];
  selectedIndicators: string[];
  toggleIndicator: (name: string) => void;
}

const ChartPanel: React.FC<ChartPanelProps> = ({
  data,
  chartType,
  setChartType,
  indicators,
  trendlines,
  selectedIndicators,
  toggleIndicator,
}) => {
  const renderChart = () => {
    switch (chartType) {
      case "candle":
        return (
          <ComposedChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Scatter
              data={data}
              shape={(props: any) => {
                const fill = props.payload.close > props.payload.open ? "#10B981" : "#EF4444";
                return (
                  <rect
                    x={props.cx - 2}
                    y={props.cy}
                    width={4}
                    height={Math.abs(props.payload.high - props.payload.low)}
                    fill={fill}
                  />
                );
              }}
            />
            {selectedIndicators.map((ind) =>
              indicators?.[ind] ? (
                <Line
                  key={ind}
                  type="monotone"
                  data={indicators[ind]}
                  stroke="#6366F1"
                  dot={false}
                />
              ) : null
            )}
            {trendlines.map((trend, i) => (
              <ReferenceLine
                key={i}
                segment={[
                  { x: trend.start, y: data[trend.start]?.price },
                  { x: trend.end, y: data[trend.end]?.price },
                ]}
                stroke={trend.direction === "up" ? "#10B981" : "#EF4444"}
                strokeDasharray="3 3"
              />
            ))}
          </ComposedChart>
        );
      case "volume":
        return (
          <BarChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="volume" fill="#6366F1" opacity={0.8} />
          </BarChart>
        );
      default:
        return (
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#4F46E5"
              dot={false}
            />
            {selectedIndicators.map((ind) =>
              indicators?.[ind] ? (
                <Line
                  key={ind}
                  type="monotone"
                  data={indicators[ind]}
                  stroke="#10B981"
                  dot={false}
                />
              ) : null
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-dark-200 rounded-lg shadow-sm p-6 border border-dark-100/50 text-white">
      {/* Indicator selection UI */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.values(indicatorsRegistry).map((ind) => (
            <button
            key={ind.name}
            onClick={() => toggleIndicator(ind.name)}
            className={`px-3 py-1 rounded text-xs border ${
                selectedIndicators.includes(ind.name)
                ? "bg-indigo-600 text-white border-indigo-700"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
            >
            {ind.label}
            </button>
        ))}
        </div>
      {/* Chart selector */}
      <div className="mb-4 flex gap-2">
        {["line", "candle", "volume"].map((t) => (
          <button
            key={t}
            onClick={() => setChartType(t as any)}
            className={`px-4 py-2 rounded-lg ${
              chartType === t ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {t === "line" ? "Line" : t === "candle" ? "Candlestick" : "Volume"}
          </button>
        ))}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartPanel;
