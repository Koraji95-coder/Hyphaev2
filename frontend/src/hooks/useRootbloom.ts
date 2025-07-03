import { useState } from "react";
import { generateContent }      from "@/services/rootbloom"

export function useRootbloom() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(prompt: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await generateContent(prompt);
      setResponse(res);
    } catch (err: any) {
      setError(err?.message || "Rootbloom request failed");
    } finally {
      setLoading(false);
    }
  }

  return { response, generate, loading, error };
}
