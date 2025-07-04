// src/components/dashboard/panels/MarketDashboard/TutorialOverlay.tsx
import React from "react";

interface Props { isOpen:boolean; onClose:()=>void; }
export default function TutorialOverlay({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-dark-200 rounded-lg shadow-lg max-w-md border border-dark-100/50 text-white">
      <h3 className="text-lg font-semibold mb-2">Market Terms</h3>
      <div className="space-y-2 text-sm">
        <p><strong>SMA:</strong> Simple Moving Average</p>
        <p><strong>RSI:</strong> Relative Strength Index</p>
        <p><strong>MACD:</strong> Moving Average Convergence Divergence</p>
        <p><strong>Volume:</strong> Shares traded</p>
        <p><strong>Candlestick:</strong> Open/high/low/close</p>
      </div>
      <button onClick={onClose} className="mt-2 text-sm text-indigo-600">Close</button>
    </div>
  );
}
