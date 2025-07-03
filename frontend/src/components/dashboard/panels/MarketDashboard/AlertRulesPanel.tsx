import React, { useState } from "react";
import { useAlertStore, AlertRule } from "@/lib/alerts/AlertManager";
import { Trash2, PlusCircle, ToggleLeft, ToggleRight } from "lucide-react";

export default function AlertRulesPanel() {
  const { rules, addRule, removeRule, toggleRule } = useAlertStore();
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [condition, setCondition] = useState("");
  const [action, setAction] = useState<"toast"|"websocket"|"both">("toast");

  function handleAddRule() {
    if (!symbol || !condition) return;
    addRule({ symbol, condition, action, enabled: true });
    setSymbol("");
    setCondition("");
    setAction("toast");
    setShowForm(false);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Alert Rules</h2>
        <button
          className="text-indigo-600 flex items-center gap-1"
          onClick={() => setShowForm((s) => !s)}
        >
          <PlusCircle className="w-4 h-4" />
          Add Alert
        </button>
      </div>
      {showForm && (
        <div className="mb-4 flex flex-col gap-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="Symbol (e.g. AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder='Condition (e.g. price > 200)'
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
          <select
            className="border rounded px-2 py-1"
            value={action}
            onChange={e => setAction(e.target.value as any)}
          >
            <option value="toast">Toast</option>
            <option value="websocket">WebSocket</option>
            <option value="both">Both</option>
          </select>
          <button
            className="mt-2 bg-indigo-600 text-white rounded px-3 py-1"
            onClick={handleAddRule}
          >
            Save Rule
          </button>
        </div>
      )}
      {rules.length === 0 ? (
        <div className="text-gray-500">No alert rules set.</div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule: AlertRule) => (
            <div key={rule.id} className="flex items-center justify-between border-t pt-2">
              <div>
                <span className="font-bold">{rule.symbol}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-sm">{rule.condition}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-xs bg-indigo-50 px-2 py-0.5 rounded">{rule.action}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleRule(rule.id)}>
                  {rule.enabled ? (
                    <ToggleRight className="text-green-500" />
                  ) : (
                    <ToggleLeft className="text-gray-300" />
                  )}
                </button>
                <button onClick={() => removeRule(rule.id)}>
                  <Trash2 className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
