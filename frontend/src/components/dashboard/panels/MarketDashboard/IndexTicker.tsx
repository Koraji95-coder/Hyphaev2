// src/components/dashboard/panels/MarketDashboard/IndexTicker.tsx
import React from "react";

interface Props {
  indices: Record<string,{price:number,change:number}>;
}

export default function IndexTicker({ indices }: Props) {
  return (
    <div className="bg-dark-200 rounded-lg shadow-sm p-4 mb-6 border border-dark-100/50 text-white">
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(indices).map(([symbol, data]) => (
          <div key={symbol} className={`text-center ${symbol!=="^DJI"?"border-l border-dark-100/50":""}`}>
            <div className="text-sm text-gray-400">
              {symbol==="^DJI"?"Dow Jones":symbol==="^GSPC"?"S&P 500":"Nasdaq"}
            </div>
            <div className="text-xl font-semibold">
              {data.price.toLocaleString(undefined,{minimumFractionDigits:2})}
            </div>
            <div className={`text-sm ${data.change>=0?"text-green-500":"text-red-500"}`}>
              {data.change>=0?"+":""}{data.change.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
