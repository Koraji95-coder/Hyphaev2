import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* 👇 Toggle switch with hand cursor */}
      <div
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out flex items-center ${
          checked ? 'bg-emerald-500' : 'bg-gray-300'
        } cursor-pointer`}
        onClick={onChange}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
        {/* A11y input */}
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          aria-label={label}
        />
      </div>

      {/* 👇 Label: text-color reactive, not clickable, no cursor edit */}
      <span
        className={`text-sm font-medium transition-colors duration-300 ${
          checked ? 'text-emerald-600' : 'text-gray-600'
        } select-none`}
      >
        {label}
      </span>
    </div>
  );
};

export default Toggle;
