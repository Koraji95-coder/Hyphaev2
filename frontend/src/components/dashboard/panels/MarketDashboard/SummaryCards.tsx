import React from "react";
import StatusCard from "@/components/ui/StatusCard";
import { ArrowUpRight } from "lucide-react";

interface Props {
  analysis: string;
  market: { symbol: string; price: number; change: number };
  newsCount: number;
  liveCount: number;
  onViewNews: () => void;
}

export default function SummaryCards({
  analysis,
  market,
  newsCount,
  liveCount,
  onViewNews,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatusCard
        title="AI Analysis"
        value={analysis}
        icon={<ArrowUpRight />}
        trend="stable"
        trendValue="0%"
        color="accent"
      />

      <StatusCard
        title={`Market: ${market.symbol}`}
        value={`$${market.price.toFixed(2)}`}
        icon={<ArrowUpRight />}
        trend={market.change >= 0 ? "up" : "down"}
        trendValue={`${market.change.toFixed(2)}%`}
        color="accent"
      />

      <StatusCard
        title="Headlines"
        value={`${newsCount} items`}
        icon={<ArrowUpRight />}
        trend="stable"
        trendValue={`${newsCount}`}
        color="secondary"
        onClick={onViewNews}
      />

      <StatusCard
        title="Live Updates"
        value={`${liveCount}`}
        icon={<ArrowUpRight />}
        trend="stable"
        trendValue={`${liveCount}`}
        color="warning"
      />
    </div>
  );
}
