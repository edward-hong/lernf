import { useState } from 'react';
import type { AIProviderId } from '../../types/aiProvider';
import { validateKeyFormat } from '../../constants/aiProviders';

interface APIKeyInputProps {
  providerId: AIProviderId;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function APIKeyInput({
  providerId,
  value,
  onChange,
  placeholder = 'Enter API key',
}: APIKeyInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (newValue: string) => {
    onChange(newValue);

    if (newValue && !validateKeyFormat(providerId, newValue)) {
      setValidationError('Invalid API key format');
    } else {
      setValidationError(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            autoComplete="off"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>

      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}

      {!validationError && value && (
        <p className="text-sm text-green-600">Format looks valid</p>
      )}
    </div>
  );
}
