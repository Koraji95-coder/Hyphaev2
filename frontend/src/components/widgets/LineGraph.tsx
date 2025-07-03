import React from "react";

interface LineGraphProps {
  timeframe: string;
}

const LineGraph: React.FC<LineGraphProps> = ({ timeframe }) => {
  // Generate random data based on timeframe
  const getDataPoints = () => {
    const dataPoints = {
      day: 24,
      week: 7,
      month: 30,
    };

    const count = dataPoints[timeframe as keyof typeof dataPoints] || 24;

    const modelAccuracy = Array.from({ length: count }, () => {
      return 85 + Math.random() * 10;
    });

    const processingTime = Array.from({ length: count }, () => {
      return 60 + Math.random() * 40;
    });

    const inference = Array.from({ length: count }, () => {
      return 40 + Math.random() * 50;
    });

    return { modelAccuracy, processingTime, inference };
  };

  const { modelAccuracy, processingTime, inference } = getDataPoints();

  // Create SVG path for a line
  const createPath = (
    dataPoints: number[],
    maxValue: number,
    minValue: number = 0,
  ) => {
    const range = maxValue - minValue;
    const width = 100 / (dataPoints.length - 1);

    return dataPoints
      .map((point, i) => {
        const x = i * width;
        const y = 100 - ((point - minValue) / range) * 100;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  // Format x-axis labels based on timeframe
  const getXAxisLabels = () => {
    switch (timeframe) {
      case "day":
        return ["00:00", "06:00", "12:00", "18:00", "23:59"];
      case "week":
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      case "month":
        return ["Week 1", "Week 2", "Week 3", "Week 4"];
      default:
        return ["", "", "", "", ""];
    }
  };

  const xLabels = getXAxisLabels();

  return (
    <div className="h-64 relative">
      <div className="absolute top-0 left-0 p-2">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-primary-400 mr-2"></span>
            <span className="text-xs text-gray-300">Model Accuracy</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-secondary-400 mr-2"></span>
            <span className="text-xs text-gray-300">Processing Time</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-accent-400 mr-2"></span>
            <span className="text-xs text-gray-300">Inference Speed</span>
          </div>
        </div>
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.5">
          <line x1="0" y1="0" x2="100" y2="0" />
          <line x1="0" y1="25" x2="100" y2="25" />
          <line x1="0" y1="50" x2="100" y2="50" />
          <line x1="0" y1="75" x2="100" y2="75" />
          <line x1="0" y1="100" x2="100" y2="100" />

          <line x1="0" y1="0" x2="0" y2="100" />
          <line x1="25" y1="0" x2="25" y2="100" />
          <line x1="50" y1="0" x2="50" y2="100" />
          <line x1="75" y1="0" x2="75" y2="100" />
          <line x1="100" y1="0" x2="100" y2="100" />
        </g>

        {/* Model Accuracy Line */}
        <path
          d={createPath(modelAccuracy, 100, 80)}
          fill="none"
          stroke="rgba(14, 165, 233, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={`${createPath(modelAccuracy, 100, 80)} L 100 100 L 0 100 Z`}
          fill="rgba(14, 165, 233, 0.1)"
          stroke="none"
        />

        {/* Processing Time Line */}
        <path
          d={createPath(processingTime, 120, 40)}
          fill="none"
          stroke="rgba(139, 92, 246, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Inference Speed Line */}
        <path
          d={createPath(inference, 100, 20)}
          fill="none"
          stroke="rgba(249, 115, 22, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
        {xLabels.map((label, index) => (
          <span key={index} className="text-xs text-gray-500">
            {label}
          </span>
        ))}
      </div>

      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between items-start py-4">
        <span className="text-xs text-gray-500">100%</span>
        <span className="text-xs text-gray-500">75%</span>
        <span className="text-xs text-gray-500">50%</span>
        <span className="text-xs text-gray-500">25%</span>
        <span className="text-xs text-gray-500">0%</span>
      </div>
    </div>
  );
};

export default LineGraph;
