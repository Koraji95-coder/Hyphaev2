import { useState } from "react";
import { submitFeedback, getPendingFeedback } from "@/services/feedback";
import type { FeedbackEntry } from "@/services/feedback";

export function useFeedback() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendFeedback(data: FeedbackEntry) {
    setLoading(true);
    setError(null);
    try {
      return await submitFeedback(data);
    } catch (err: any) {
      setError(err?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPending() {
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingFeedback();
      setPending(res);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  }

  return { sendFeedback, fetchPending, pending, loading, error };
}
