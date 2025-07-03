import React, { useEffect } from "react";
import Button from "@/components/ui/Button";
import { useNeuroweave } from "@/hooks/useNeuroweave";

const Neuroweave: React.FC = () => {
  const { response, ask, loading, error } = useNeuroweave();

  // Initial prompt (empty prompt triggers default behavior)
  useEffect(() => {
    ask("");
  }, [ask]);

  return (
    <div className="bg-dark-200 p-6 rounded-2xl shadow-inner border border-hyphae-500/20 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-hyphae-300">🧠 Neuroweave Panel</h2>
        <Button
          onClick={() => ask("")}
          className="bg-hyphae-500 hover:bg-hyphae-600 text-white"
        >
          Refresh Threads
        </Button>
      </div>

      {loading && (
        <p className="mb-4 text-hyphae-300">Loading neural threads…</p>
      )}

      {error && (
        <div className="mb-4 p-4 rounded bg-fungal-500/10 border border-fungal-500 text-fungal-300">
          {error}
        </div>
      )}

      <pre className="whitespace-pre-wrap max-h-[50vh] overflow-auto text-sm bg-dark-300 p-4 rounded-lg border border-hyphae-500/10">
        {response}
      </pre>
    </div>
  );
};

export default Neuroweave;
