// src/components/dashboard/panels/MarketDashboard/NewsPanel.tsx
import React from "react";
import { Newspaper } from "lucide-react";
import type { NewsArticle } from "./useMarketDashboard";
import { format } from "date-fns";

interface Props {
  news: NewsArticle[];
  filter: "all" | "positive" | "negative";
  setFilter: (f: "all" | "positive" | "negative") => void;
}

export default function NewsPanel({ news, filter, setFilter }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Newspaper /> Market News
        </h2>
        {(["all", "positive", "negative"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === f ? "bg-indigo-600 text-white" : "bg-gray-100"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {news
          .filter((a) => filter === "all" || a.sentiment.label === filter)
          .map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border-t pt-4"
            >
              <h3 className="font-medium">{a.title}</h3>
              <div className="text-xs text-gray-500">
                {a.source} • {format(new Date(a.timestamp), "MMM d, h:mm a")}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {a.tickers.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 bg-indigo-50 rounded-full text-xs"
                  >
                    ${t}
                  </span>
                ))}
                {a.categories.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </a>
          ))}
      </div>
    </div>
  );
}
