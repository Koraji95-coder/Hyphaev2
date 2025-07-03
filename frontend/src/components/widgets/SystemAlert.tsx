import { AlertTriangle, ArrowUpRight, Activity } from "lucide-react";
import { useAlertStore, AlertRule } from "../../lib/alerts/AlertManager";

export default function SystemAlerts() {
  // Explicitly type Zustand selector:
  const liveAlerts = useAlertStore((state: { liveAlerts: AlertRule[] }) => state.liveAlerts);

  return (
    <div className="bg-dark-200/80 backdrop-blur-sm rounded-xl p-6 border border-dark-100/50 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">System Alerts</h2>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            liveAlerts.length > 0
              ? "bg-warning-500/20 text-warning-300"
              : "bg-success-500/20 text-success-300"
          }`}
        >
          {liveAlerts.length} Warnings
        </span>
      </div>

      <div className="space-y-3">
        {liveAlerts.length === 0 ? (
          <p className="text-sm text-gray-400">No active system alerts.</p>
        ) : (
          liveAlerts.map((alert: AlertRule, idx: number) => (
            <div
              key={alert.id || idx}
              className={`p-4 rounded-lg ${
                alert.severity === "warning"
                  ? "bg-warning-500/10 border border-warning-500/20"
                  : "bg-dark-300/50 border border-dark-100/30"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`p-2 rounded-lg ${
                    alert.severity === "warning"
                      ? "bg-warning-500/20"
                      : "bg-success-500/20"
                  } mr-3`}
                >
                  {alert.severity === "warning" ? (
                    <AlertTriangle size={18} className="text-warning-400" />
                  ) : (
                    <Activity size={18} className="text-success-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">
                    {alert.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">
                      {alert.timestamp}
                    </span>
                    <button className="ml-4 text-xs text-primary-400 hover:text-primary-300">
                      Investigate
                      <ArrowUpRight size={12} className="inline ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
