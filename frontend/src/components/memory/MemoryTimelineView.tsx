import React, { useEffect, useRef, useState } from "react";
import { useAgentStream } from "@/hooks/useAgentStream";
import { fetchMemoryTimeline } from "@/services/memory";

interface MemoryEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type?: string;
  metadata?: Record<string, any>;
}

interface MemoryTimelineViewProps {
  user: string;
}

const MemoryTimelineView: React.FC<MemoryTimelineViewProps> = ({ user }) => {
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventListRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to memory event stream
  const memoryEvents = useAgentStream("/state/memory/stream");

  // Fetch initial timeline data and map to MemoryEvent shape
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    fetchMemoryTimeline(user)
      .then((records: any[]) => {
        const mapped = records.map((r) => ({
          id: String(r.id),
          title: r.role,
          description: r.content,
          timestamp: r.created_at,
          type: r.role,
          metadata: r.metadata ?? r.meta_info ?? {},
        } as MemoryEvent));
        setEvents(mapped);
      })
      .catch((err) => {
        console.error("[MemoryTimelineView] Timeline fetch failed:", err);
        setError("Failed to load memory timeline");
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Handle real-time updates
  useEffect(() => {
    if (memoryEvents.length === 0) return;
    const last = memoryEvents[memoryEvents.length - 1];
    const mapped: MemoryEvent = {
      id: last.id ? String(last.id) : `${last.agent}-${last.timestamp}`,
      title: last.role ?? `Event from ${last.agent}`,
      description: last.content ?? "No description.",
      timestamp: last.timestamp,
      type: last.type ?? last.role,
      metadata: last.metadata ?? {},
    };
    setEvents((prev) => [...prev.slice(-49), mapped]);
  }, [memoryEvents]);

  // Auto-scroll to bottom on updates
  useEffect(() => {
    const el = eventListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events]);

  if (loading) {
    return (
      <div className="bg-dark-200 p-4 rounded-xl shadow-lg border border-hyphae-500/20 text-white">
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-hyphae-300">Loading memory timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-200 p-4 rounded-xl shadow-lg border border-hyphae-500/20 text-white">
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-fungal-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-200 p-4 rounded-xl shadow-lg border border-hyphae-500/20 text-white">
      <h3 className="text-lg font-semibold mb-4 text-hyphae-300">
        Memory Timeline for {user}
      </h3>
      <div
        className="overflow-auto max-h-[300px] space-y-4 scrollbar-thin scrollbar-thumb-hyphae-500/20 scrollbar-track-dark-300"
        ref={eventListRef}
      >
        {events.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No memory events recorded yet
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-dark-300 p-4 rounded-lg border border-hyphae-500/10 hover:border-hyphae-500/20 transition-colors"
            >
              <h4 className="text-white font-medium">{event.title}</h4>
              <p className="text-gray-400 mt-1">{event.description}</p>
              <div className="flex justify-between items-center mt-2">
                <small className="text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </small>
                {event.type && (
                  <span className="text-xs px-2 py-1 rounded-full bg-hyphae-500/10 text-hyphae-300">
                    {event.type}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryTimelineView;
