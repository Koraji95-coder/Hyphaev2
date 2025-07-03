// src/components/dashboard/panels/settings/AccountSettings.tsx

import React from "react";
import Button from "../../../ui/Button";
import { User } from "lucide-react";

const AccountSettings: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="w-32 h-32 rounded-full bg-primary-500/20 flex items-center justify-center mb-4 md:mb-0 md:mr-8">
          <User size={48} className="text-primary-400" />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">Admin User</h3>
          <p className="text-gray-400 mb-4">System Administrator</p>

          <div className="flex space-x-3">
            <Button variant="primary" size="sm">
              Change Avatar
            </Button>
            <Button variant="ghost" size="sm">
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-dark-100/50 pt-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username, Email, Role, Language */}
          {/* ...inputs unchanged... */}
        </div>

        <div className="mt-6">
          <label className="block text-sm text-gray-400 mb-1">Bio</label>
          <textarea
            rows={3}
            className="w-full px-4 py-2 bg-dark-300/70 border border-dark-100/50 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all text-white"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="ghost" className="mr-3">
            Cancel
          </Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
