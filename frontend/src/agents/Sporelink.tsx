// src/agents/Sporelink.tsx
import React, { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import Card from "@/components/ui/StatusCard";
import { useSporelink } from "@/hooks/useSporelink";
import MarketDashboard from "@/components/dashboard/panels/MarketDashboard";


const Sporelink: React.FC = () => {
  const {
    analysis,
    market,
    news,
    events,
    analyze,
    fetchMarket,
    fetchNews,
  } = useSporelink();

  useEffect(() => {
    analyze("What’s the market outlook today?");
    fetchMarket("AAPL");
    fetchNews("technology", 5);
  }, [analyze, fetchMarket, fetchNews]);

  return (
    <div className="space-y-8 p-6">
      {/* ── Top‐level summary cards ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {analysis && (
          <Card
            title="AI Analysis"
            value={analysis.response}
            icon={<ArrowUpRight />}
            color="accent"
            trend="stable"
            trendValue="0%"
          />
        )}

        {market && (
          <Card
            title={`Market: ${market.data.symbol}`}
            value={`$${market.data.price.toFixed(2)}`}
            icon={<ArrowUpRight />}
            color="accent"
            trend={market.data.change >= 0 ? "up" : "down"}
            trendValue={`${market.data.change.toFixed(2)}%`}
          />
        )}

        {/* News teaser — wrap in a clickable div */}
        {news.length > 0 && (
          <div
            onClick={() => window.scrollTo(0, document.body.scrollHeight)}
            className="cursor-pointer"
          >
            <Card
              title="Latest Headlines"
              value={`${news.length} items`}
              icon={<ArrowUpRight />}
              color="secondary"
              trend="stable"
              trendValue=""
            />
          </div>
        )}

        <Card
          title="Live Updates"
          value={`${events.length}`}
          icon={<ArrowUpRight />}
          color="warning"
          trend="stable"
          trendValue=""
        />
      </div>

      {/* ── Full Market Dashboard ─────────────────────────── */}
      <MarketDashboard />
    </div>
  );
};

export default Sporelink;
