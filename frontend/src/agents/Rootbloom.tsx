// src/agents/Rootbloom.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Card from "@/components/ui/StatusCard";
import { generateContent, RootbloomResponse } from "@/services/rootbloom";
import { useAgentStream } from "@/hooks/useAgentStream";

const Rootbloom: React.FC = () => {
  // create a unique client ID for WS
  const clientId = useMemo(() => `${Date.now()}-${Math.random()}`, []);
  const streamEvents = useAgentStream(`/rootbloom/stream/${clientId}`);

  const [logs, setLogs] = useState<RootbloomResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // helper to call the HTTP generate endpoint
  const generate = useCallback(
    async (prompt: string, context?: any) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await generateContent(prompt, context);
        setLogs((prev) => [...prev, resp]);
      } catch (err: any) {
        console.error("[Rootbloom] generate error:", err);
        setError(err.message || "Generation failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // kick off an initial (empty) generate call on mount
  useEffect(() => {
    generate("");
  }, [generate]);

  // whenever a WS event comes in, append it
  useEffect(() => {
    if (streamEvents.length === 0) return;
    const last = streamEvents[streamEvents.length - 1];
    if (last.type === "generation") {
      const entry: RootbloomResponse = {
        agent: last.agent || "Rootbloom",
        response: last.data,
        timestamp: last.timestamp,
        metadata: last.metadata,
      };
      setLogs((prev) => [...prev, entry]);
    }
    // you could also handle `type==="error"` here if you like
  }, [streamEvents]);

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-hyphae-300">
          🌸 Rootbloom Node Activity
        </h2>
        <button
          onClick={() => generate("", /* optional context */)}
          className="px-4 py-2 bg-hyphae-500 hover:bg-hyphae-600 rounded-xl text-white"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-hyphae-300">Generating...</p>}
      {error && <p className="text-fungal-300">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {logs.map((log, i) => (
          <Card
            key={i}
            title={log.agent}
            value={log.response}
            icon={<ArrowUpRight />}
            trend="stable"
            trendValue="0%"
            color="accent"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Rootbloom;
