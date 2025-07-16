import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface InlineEditFieldProps {
  initialValue?: string;
  type?: string;
  placeholder?: string;
  onSave: (newValue: string) => Promise<void>;
  onCancel: () => void;
  className?: string; // Add className prop
}

export default function InlineEditField({
  initialValue = '',
  type = 'text',
  placeholder,
  onSave,
  onCancel,
  className,
}: InlineEditFieldProps) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(value);
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type={type}
        value={value}
        placeholder={placeholder || initialValue}
        onChange={(e) => setValue(e.target.value)}
        className={`px-4 py-3 rounded bg-dark-400 text-white border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className || ''}`}
      />
      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? 'Saving…' : 'Save'}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}