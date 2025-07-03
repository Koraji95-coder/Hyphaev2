import { useState } from "react";
import { askNeuroweave, testNeuroweave } from "@/services/neuroweave";

export function useNeuroweave() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(prompt: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await askNeuroweave(prompt);
      setResponse(res.response);
      return res.response;
    } catch (err: any) {
      setError(err?.message || "Neuroweave request failed");
    } finally {
      setLoading(false);
    }
  }

  async function test() {
    setLoading(true);
    setError(null);
    try {
      const res = await testNeuroweave();
      setResponse(res.agent);
      return res.agent;
    } catch (err: any) {
      setError(err?.message || "Neuroweave test failed");
    } finally {
      setLoading(false);
    }
  }

  return { response, ask, test, loading, error };
}
