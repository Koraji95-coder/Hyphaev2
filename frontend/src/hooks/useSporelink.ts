// src/hooks/useSporelink.ts
import { useState, useMemo } from "react";
import { analyzeMarketData, getMarketData, getMarketNews } from "@/services/sporelink";
import { useAgentStream } from "@/hooks/useAgentStream";

export function useSporelink() {
  // unique client ID for the WS
  const clientId = useMemo(() => `${Date.now()}-${Math.random()}`, []);
  const events = useAgentStream(`/sporelink/stream/${clientId}`);

  const [analysis, setAnalysis] = useState<any>(null);
  const [market,   setMarket]   = useState<any>(null);
  const [news,     setNews]     = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function analyze(prompt: string) {
    setLoading(true);
    setError(null);
    try { setAnalysis(await analyzeMarketData(prompt)); }
    catch (e:any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function fetchMarket(symbol: string) {
    setLoading(true);
    setError(null);
    try { setMarket(await getMarketData(symbol)); }
    catch (e:any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function fetchNews(category?: string, limit?: number) {
    setLoading(true);
    setError(null);
    try { setNews((await getMarketNews(category, limit)).news); }
    catch (e:any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return {
    clientId,
    events,
    analysis,
    market,
    news,
    analyze,
    fetchMarket,
    fetchNews,
    loading,
    error,
  };
}
