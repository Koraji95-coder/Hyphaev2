// src/components/dashboard/panels/MarketDashboard/useMarketDashboard.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import io from "socket.io-client";
import { mean, deviation } from "d3-array";
import { calculateAllIndicators } from "@/lib/indicators/registry";
import { useAlertStore } from "@/lib/alerts/AlertManager";

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  volume: number;
}
export interface PDFInsight {
  filename: string;
  tickers: string[];
  timestamp: string;
}
export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  timestamp: string;
  sentiment: { score: number; label: string };
  tickers: string[];
  categories: string[];
}
export interface MarketContext {
  symbol: string;
  news_count: number;
  sentiment: { score: number; label: string };
  related_symbols: string[];
  top_categories: string[];
  latest_news: NewsArticle[];
}

export function useMarketDashboard() {
  const [indices, setIndices] = useState<Record<string, { price: number; change: number }>>({
    "^DJI": { price: 35000, change: 0 },
    "^GSPC": { price: 4500, change: 0 },
    "^IXIC": { price: 14000, change: 0 },
  });
  const [watchlist, setWatchlist] = useState<Quote[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [pdfInsights, setPdfInsights] = useState<PDFInsight[]>([]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chartType, setChartType] = useState<"line" | "candle" | "volume">("line");
  const [indicators, setIndicators] = useState<Record<string, number[]> | null>(null);
  const [trendlines, setTrendlines] = useState<any[]>([]);
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [marketContext, setMarketContext] = useState<MarketContext | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [newsFilter, setNewsFilter] = useState<"all" | "positive" | "negative">("all");
  const [showTutorial, setShowTutorial] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { evaluateCondition } = useAlertStore();

  // Indicator selection state
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(["sma", "rsi"]);

  // Use registry to calculate indicators
  const calculateIndicators = useCallback(
    (data: any[]) => {
      const prices = data.map((d) => d.price);
      const all = calculateAllIndicators(prices, selectedIndicators);
      setIndicators(all);

      // Fire alert rules based on indicator data for selectedSymbol
      if (selectedSymbol) {
        evaluateCondition(selectedSymbol, {
          ...all,
          price: prices[prices.length - 1], // add current price for convenience
          // add more properties as needed
        });
      }

      // Trend detection
      const windowSize = 20;
      const trends: Array<{ start: number; end: number; direction: "up" | "down" }> = [];
      for (let i = windowSize; i < prices.length; i++) {
        const slice = prices.slice(i - windowSize, i);
        const avg = mean(slice) ?? 0;
        const std = deviation(slice) ?? 0;
        if (std && Math.abs(prices[i] - avg) > std * 2) {
          trends.push({
            start: i - windowSize,
            end: i,
            direction: prices[i] > avg ? "up" : "down",
          });
        }
      }
      setTrendlines(trends);
    },
    [selectedIndicators, selectedSymbol, evaluateCondition]
  );

  // fetch historical data whenever selectedSymbol changes
  useEffect(() => {
    if (!selectedSymbol) return;
    (async () => {
      try {
        const res = await fetch(`/api/v1/market/${encodeURIComponent(selectedSymbol)}/history`);
        const hist = await res.json();
        setHistoricalData(hist);
        calculateIndicators(hist);
      } catch (err) {
        console.error("Failed to fetch historical data:", err);
      }
    })();
  }, [selectedSymbol, calculateIndicators]);

  // websocket for live quotes + indices
  useEffect(() => {
    const socket = io("ws://localhost:8000/market");
    socket.on("quote", (q: Quote) => {
      setWatchlist((prev) => {
        const idx = prev.findIndex((x) => x.symbol === q.symbol);
        if (idx === -1) return [...prev, q];
        const copy = [...prev];
        copy[idx] = q;
        return copy;
      });
      // Fire alert rules on quote update
      evaluateCondition(q.symbol, q);
    });
    socket.on("index", (d: any) => {
      setIndices((prev) => ({ ...prev, [d.symbol]: { price: d.price, change: d.change } }));
    });
    return () => {
      socket.disconnect();
    };
  }, [evaluateCondition]);

  // Poll news every 5 minutes
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/v1/news");
        setNewsData(await res.json());
      } catch (err) {
        console.error("Failed to fetch news:", err);
      }
    };
    fetchNews();
    const id = setInterval(fetchNews, 300_000);
    return () => clearInterval(id);
  }, []);

  // fetch market context when selectedSymbol changes
  useEffect(() => {
    if (!selectedSymbol) return;
    (async () => {
      try {
        const res = await fetch(`/api/v1/market-context/${selectedSymbol}`);
        setMarketContext(await res.json());
      } catch (err) {
        console.error("Failed to fetch market context:", err);
      }
    })();
  }, [selectedSymbol]);

  // memo for your filtered watchlist
  const filteredWatchlist = useMemo(
    () =>
      watchlist.filter((q) =>
        q.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [watchlist, searchTerm]
  );

  // Indicator toggling helper
  const toggleIndicator = (name: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  // Handlers
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  }
  async function handleUpload() {
    if (!selectedFile) return;
    setUploadStatus("uploading");
    const form = new FormData();
    form.append("file", selectedFile);
    try {
      const res = await fetch("/api/v1/upload/pdf", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPdfInsights((prev) => [
        {
          filename: selectedFile.name,
          tickers: data.analysis.tickers,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      setUploadStatus("success");
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch {
      setUploadStatus("error");
    }
  }
  function toggleTheme() {
    setDarkMode((d) => !d);
    document.documentElement.classList.toggle("dark");
  }

  return {
    indices,
    watchlist,
    historicalData,
    pdfInsights,
    uploadStatus,
    darkMode,
    searchTerm,
    chartType,
    indicators,
    trendlines,
    newsData,
    marketContext,
    selectedSymbol,
    newsFilter,
    showTutorial,
    showUploadModal,
    selectedFile,
    selectedIndicators,
    setSelectedIndicators,
    toggleIndicator,

    // state‐setters you’ll use in JSX
    setSearchTerm,
    setChartType,
    setSelectedSymbol,
    setNewsFilter,
    setShowTutorial,
    setShowUploadModal,

    // handlers & helpers
    handleFileChange,
    handleUpload,
    toggleTheme,
    filteredWatchlist,
    calculateIndicators,
  };
}
