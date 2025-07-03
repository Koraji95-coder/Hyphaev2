import React from "react";
import Button from "../../../ui/Button";
import { Bell } from "lucide-react";

const NotificationSettings: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start">
        <div className="p-2 rounded-lg bg-secondary-500/20 mr-4">
          <Bell size={20} className="text-secondary-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white mb-1">
            Notification Preferences
          </h3>
          <p className="text-sm text-gray-400">
            Control how you receive alerts, warnings, and system updates.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">Agent alerts</span>
          <input
            type="checkbox"
            className="form-checkbox accent-secondary-500 w-5 h-5"
            defaultChecked
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white">System errors</span>
          <input
            type="checkbox"
            className="form-checkbox accent-secondary-500 w-5 h-5"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white">Memory usage thresholds</span>
          <input
            type="checkbox"
            className="form-checkbox accent-secondary-500 w-5 h-5"
            defaultChecked
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white">Weekly summaries</span>
          <input
            type="checkbox"
            className="form-checkbox accent-secondary-500 w-5 h-5"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button variant="ghost" className="mr-3">
          Cancel
        </Button>
        <Button variant="primary">Save Preferences</Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
