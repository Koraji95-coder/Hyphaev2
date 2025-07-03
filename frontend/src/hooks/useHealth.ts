import { useEffect, useState } from "react";
import { getHealth } from "@/services/health";

export function useHealth() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getHealth()
      .then(setData)
      .catch((err) => setError(err?.message || "Health check failed"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
