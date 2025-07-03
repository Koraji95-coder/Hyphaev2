import { create } from "zustand";
import { toast } from "react-toastify";
import jexl from "jexl";

export interface AlertRule {
  id: string;
  symbol: string;
  condition: string;
  action: "toast" | "websocket" | "both";
  enabled: boolean;
  severity?: "info" | "warning" | "error"; // optional for display
  title?: string;
  description?: string;
  timestamp?: string;
}

interface AlertStore {
  rules: AlertRule[];
  liveAlerts: AlertRule[];
  addRule: (rule: Omit<AlertRule, "id">) => void;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  pushLiveAlert: (alert: AlertRule) => void;
  evaluateCondition: (symbol: string, data: any) => void;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  rules: [],
  liveAlerts: [],

  addRule: (rule) =>
    set((state) => ({
      rules: [...state.rules, { ...rule, id: crypto.randomUUID() }],
    })),

  removeRule: (id) =>
    set((state) => ({
      rules: state.rules.filter((rule) => rule.id !== id),
    })),

  toggleRule: (id) =>
    set((state) => ({
      rules: state.rules.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule,
      ),
    })),

  pushLiveAlert: (alert) =>
    set((state) => ({
      liveAlerts: [...state.liveAlerts, alert],
    })),

  evaluateCondition: (symbol, data) => {
    const { rules } = get();
    const activeRules = rules.filter((r) => r.enabled && r.symbol === symbol);

    activeRules.forEach((rule) => {
      try {
        const context = {
          price: data.price,
          volume: data.volume,
          rsi: data.indicators?.rsi,
          sentiment: data.sentiment,
          ...data,
        };

        if (typeof rule.condition !== "string" || !rule.condition.trim()) {
          console.error("Invalid rule condition");
          return;
        }

        const result = jexl.evalSync(rule.condition, context);

        if (result) {
          const timestamp = new Date().toLocaleTimeString();
          const alert: AlertRule = {
            ...rule,
            title: `Alert Triggered: ${rule.symbol}`,
            description: `Condition met: ${rule.condition}`,
            severity: "warning",
            timestamp,
          };

          get().pushLiveAlert(alert);

          if (rule.action === "toast" || rule.action === "both") {
            toast.info(`⚠️ ${rule.symbol} - ${rule.condition}`, {
              position: "top-right",
              autoClose: 5000,
            });
          }

          if (rule.action === "websocket" || rule.action === "both") {
            // WebSocket action stub
          }
        }
      } catch (error) {
        console.error(`Error evaluating alert rule: ${error}`);
      }
    });
  },
}));
