import React from "react";

const SystemMetrics: React.FC = () => {
  // Generate mock data points for the chart
  const generateDataPoints = (count: number, min: number, max: number) => {
    return Array.from(
      { length: count },
      () => Math.floor(Math.random() * (max - min + 1)) + min,
    );
  };

  const cpuData = generateDataPoints(24, 30, 80);
  const memoryData = generateDataPoints(24, 40, 90);
  const networkData = generateDataPoints(24, 20, 60);

  // Calculate SVG path for a line chart
  const createLinePath = (dataPoints: number[], height: number) => {
    const max = Math.max(...dataPoints);
    const min = Math.min(...dataPoints);
    const range = max - min;

    const width = 100 / (dataPoints.length - 1);

    return dataPoints
      .map((point, i) => {
        const x = i * width;
        const y = 100 - ((point - min) / range) * height;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg overflow-hidden h-full">
      <div className="p-4 border-b border-dark-100/50">
        <h2 className="text-lg font-semibold text-white">System Metrics</h2>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-dark-300/50 border border-dark-100/30">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">CPU Usage</h3>
              <span className="text-xs bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full">
                {cpuData[cpuData.length - 1]}%
              </span>
            </div>
            <div className="h-10">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  d={createLinePath(cpuData, 80)}
                  fill="none"
                  stroke="rgba(14, 165, 233, 0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d={`${createLinePath(cpuData, 80)} L 100 100 L 0 100 Z`}
                  fill="rgba(14, 165, 233, 0.1)"
                  stroke="none"
                />
              </svg>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-dark-300/50 border border-dark-100/30">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">Memory</h3>
              <span className="text-xs bg-secondary-500/20 text-secondary-300 px-2 py-0.5 rounded-full">
                {memoryData[memoryData.length - 1]}%
              </span>
            </div>
            <div className="h-10">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  d={createLinePath(memoryData, 80)}
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d={`${createLinePath(memoryData, 80)} L 100 100 L 0 100 Z`}
                  fill="rgba(139, 92, 246, 0.1)"
                  stroke="none"
                />
              </svg>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-dark-300/50 border border-dark-100/30">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">Network</h3>
              <span className="text-xs bg-accent-500/20 text-accent-300 px-2 py-0.5 rounded-full">
                {networkData[networkData.length - 1]}%
              </span>
            </div>
            <div className="h-10">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  d={createLinePath(networkData, 80)}
                  fill="none"
                  stroke="rgba(249, 115, 22, 0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d={`${createLinePath(networkData, 80)} L 100 100 L 0 100 Z`}
                  fill="rgba(249, 115, 22, 0.1)"
                  stroke="none"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-dark-300/70 rounded-lg p-4 relative h-48">
          <div className="absolute top-4 left-4 right-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">
                System Performance (24h)
              </h3>
              <div className="flex space-x-3">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-400 mr-1"></span>
                  <span className="text-xs text-gray-400">CPU</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-secondary-400 mr-1"></span>
                  <span className="text-xs text-gray-400">Memory</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-accent-400 mr-1"></span>
                  <span className="text-xs text-gray-400">Network</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-full pt-8">
            <svg
              width="100%"
              height="calc(100% - 8px)"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              <line
                x1="0"
                y1="0"
                x2="100"
                y2="0"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="25"
                x2="100"
                y2="25"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="50"
                x2="100"
                y2="50"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="75"
                x2="100"
                y2="75"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="100"
                x2="100"
                y2="100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />

              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <line
                x1="25"
                y1="0"
                x2="25"
                y2="100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <line
                x1="50"
                y1="0"
                x2="50"
                y2="100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <line
                x1="75"
                y1="0"
                x2="75"
                y2="100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <line
                x1="100"
                y1="0"
                x2="100"
                y2="100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />

              {/* CPU line */}
              <path
                d={createLinePath(cpuData, 80)}
                fill="none"
                stroke="rgba(14, 165, 233, 0.7)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Memory line */}
              <path
                d={createLinePath(memoryData, 80)}
                fill="none"
                stroke="rgba(139, 92, 246, 0.7)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Network line */}
              <path
                d={createLinePath(networkData, 80)}
                fill="none"
                stroke="rgba(249, 115, 22, 0.7)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="absolute bottom-2 left-4 right-4 flex justify-between">
            <span className="text-xs text-gray-500">00:00</span>
            <span className="text-xs text-gray-500">06:00</span>
            <span className="text-xs text-gray-500">12:00</span>
            <span className="text-xs text-gray-500">18:00</span>
            <span className="text-xs text-gray-500">Now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;
