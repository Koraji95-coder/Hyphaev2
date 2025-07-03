// src/components/dashboard/panels/MarketDashboard/index.tsx
import React, { useEffect } from "react";
import { useMarketDashboard } from "./useMarketDashboard";
import SummaryCards    from "./SummaryCards";
import IndexTicker     from "./IndexTicker";
import ChartPanel      from "./ChartPanel";
import WatchlistTable  from "./WatchlistTable";
import PDFInsights     from "./PDFInsights";
import NewsPanel       from "./NewsPanel";
import TutorialOverlay from "./TutorialOverlay";
import { Search, Sun, Moon } from "lucide-react";
import SystemAlerts from "@/components/widgets/SystemAlert";
import AlertRulesPanel from "./AlertRulesPanel";

export default function MarketDashboard() {
  // Make sure your hook returns ALL these props!
  const ctx = useMarketDashboard();

  // Only call if defined (TS safety)
  useEffect(() => {
    if (ctx.calculateIndicators && ctx.historicalData) {
      ctx.calculateIndicators(ctx.historicalData);
    }
  }, [ctx.historicalData, ctx.calculateIndicators]);

  // Defensive: Market context and news
  const firstNews = ctx.marketContext?.latest_news?.[0];
  const marketSymbol = ctx.marketContext?.symbol || "–";
  const sentimentScore = firstNews?.sentiment?.score ?? 0;

  return (
    <div className={`min-h-screen p-6 ${ctx.darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* HEADER BAR (theme & search) */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search symbols…"
            value={ctx.searchTerm}
            onChange={e => ctx.setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white w-full"
          />
        </div>
        <button
          onClick={ctx.toggleTheme}
          className="ml-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
        >
          {ctx.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
      <SummaryCards
        analysis={firstNews?.title || "–"}
        market={{
          symbol: marketSymbol,
          price: sentimentScore,
          change: 0, // Put actual change if available in marketContext!
        }}
        newsCount={ctx.newsData.length}
        liveCount={ctx.watchlist.length}
        onViewNews={() => window.scrollTo(0, document.body.scrollHeight)}
      />

      <IndexTicker indices={ctx.indices} />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <ChartPanel
            data={ctx.historicalData}
            chartType={ctx.chartType}
            setChartType={ctx.setChartType}
            indicators={ctx.indicators}
            trendlines={ctx.trendlines}
            selectedIndicators={ctx.selectedIndicators}
            toggleIndicator={ctx.toggleIndicator}
            />
          <WatchlistTable
            watchlist={ctx.filteredWatchlist}
            searchTerm={ctx.searchTerm}
            setSearchTerm={ctx.setSearchTerm}
            onAddSymbol={() => alert("Show symbol add modal!")}
          />
        </div>
        <div className="col-span-4 space-y-6">
          <PDFInsights
            insights={ctx.pdfInsights}
            showModal={ctx.showUploadModal}
            selectedFile={ctx.selectedFile}
            onFileChange={ctx.handleFileChange}
            onUpload={ctx.handleUpload}
            status={ctx.uploadStatus}
            onClose={() => ctx.setShowUploadModal(false)}
          />
          {/* 
            Make sure NewsPanel expects `news: NewsArticle[]` (not just a single article)
            and the NewsArticle interface matches ctx.newsData shape.
          */}
          <NewsPanel
            news={ctx.newsData}
            filter={ctx.newsFilter}
            setFilter={ctx.setNewsFilter}
          />
        </div>
      </div>

      <TutorialOverlay
        isOpen={ctx.showTutorial}
        onClose={() => ctx.setShowTutorial(false)}
      />
      <button
        onClick={() => ctx.setShowTutorial(s => !s)}
        className="fixed bottom-4 left-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
      >
        {ctx.showTutorial ? "Hide Guide" : "Show Guide"}
      </button>
      <AlertRulesPanel />
      <SystemAlerts />
    </div>
  );
}
