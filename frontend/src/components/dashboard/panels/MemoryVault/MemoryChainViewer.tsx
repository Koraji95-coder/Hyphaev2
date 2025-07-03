// src/components/memory/MemoryChainViewer.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MemoryEntry {
  type: string;
  agent: string;
  mood?: string;
  timestamp: string;
  content: string;
}

interface Props {
  user: string;
}

type FilterKeys = "agent" | "mood" | "type";

export const MemoryChainViewer: React.FC<Props> = ({ user }) => {
  // typed as an array of MemoryEntry
  const [chain, setChain] = useState<MemoryEntry[]>([]);
  // map from index to expanded/collapsed
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  // keyed by "agent"|"mood"|"type"
  const [filter, setFilter] = useState<Record<FilterKeys, string>>({
    agent: "",
    mood: "",
    type: "",
  });

  useEffect(() => {
    axios
      .get<MemoryEntry[]>(`/api/state/memory/chain/${user}`)
      .then((res) => setChain(res.data))
      .catch(console.error);
  }, [user]);

  const toggle = (idx: number) =>
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const filtered = chain.filter((entry) =>
    ( !filter.agent || entry.agent === filter.agent ) &&
    ( !filter.mood  || entry.mood   === filter.mood  ) &&
    ( !filter.type  || entry.type   === filter.type  )
  );

  // gather unique values for a given key
  const unique = (key: FilterKeys): string[] =>
    Array.from(new Set(chain.map((e) => e[key]!).filter(Boolean)));

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🧬 Memory Chain Viewer</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        {(["agent", "mood", "type"] as FilterKeys[]).map((key) => (
          <select
            key={key}
            className="p-2 border rounded"
            value={filter[key]}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, [key]: e.target.value }))
            }
          >
            <option value="">{key.toUpperCase()}</option>
            {unique(key).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ))}

        <Button onClick={() => setFilter({ agent: "", mood: "", type: "" })}>
          Clear Filters
        </Button>
      </div>

      {/* Timeline Cards */}
      {filtered.map((entry, idx) => (
        <Card key={idx} className="mb-4 shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2 items-center">
                <Badge>{entry.type}</Badge>
                <Badge variant="secondary">{entry.agent}</Badge>
                {entry.mood && <Badge variant="outline">{entry.mood}</Badge>}
              </div>
              <div className="text-sm text-gray-500">{entry.timestamp}</div>
            </div>

            <div className="mt-2">
              <Button
                variant="ghost"
                onClick={() => toggle(idx)}
                size="sm"
                className="text-sm"
              >
                {expanded[idx] ? "Collapse" : "Expand"}{" "}
                {expanded[idx] ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </Button>

              {expanded[idx] && (
                <pre className="mt-2 bg-muted p-2 rounded whitespace-pre-wrap">
                  {entry.content}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MemoryChainViewer;
