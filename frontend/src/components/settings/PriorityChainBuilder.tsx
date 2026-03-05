import type { AIProviderId } from '../../types/aiProvider';

interface PriorityChainBuilderProps {
  primaryProvider: string;
  backupProviders: AIProviderId[];
  availableProviders: AIProviderId[];
  onChange: (backups: AIProviderId[]) => void;
}

export function PriorityChainBuilder({
  primaryProvider,
  backupProviders,
  availableProviders,
  onChange,
}: PriorityChainBuilderProps) {
  const handleAddBackup = (providerId: AIProviderId) => {
    if (!backupProviders.includes(providerId)) {
      onChange([...backupProviders, providerId]);
    }
  };

  const handleRemoveBackup = (index: number) => {
    const newBackups = backupProviders.filter((_, i) => i !== index);
    onChange(newBackups);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBackups = [...backupProviders];
    [newBackups[index - 1], newBackups[index]] = [
      newBackups[index],
      newBackups[index - 1],
    ];
    onChange(newBackups);
  };

  const handleMoveDown = (index: number) => {
    if (index === backupProviders.length - 1) return;
    const newBackups = [...backupProviders];
    [newBackups[index], newBackups[index + 1]] = [
      newBackups[index + 1],
      newBackups[index],
    ];
    onChange(newBackups);
  };

  const unusedProviders = availableProviders.filter(
    (id) => !backupProviders.includes(id),
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Backup Providers
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        If primary provider fails, these will be tried in order.
      </p>

      {/* Current chain visualization */}
      <div className="space-y-2 mb-4">
        {/* Primary */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-900 min-w-[60px]">
            Primary:
          </span>
          <span className="text-sm text-blue-700">
            {primaryProvider === 'backend-default'
              ? 'Backend Default'
              : primaryProvider}
          </span>
        </div>

        {/* Backups */}
        {backupProviders.map((providerId, index) => (
          <div
            key={providerId}
            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <span className="text-sm font-medium text-gray-600 min-w-[60px]">
              Backup {index + 1}:
            </span>
            <span className="flex-1 text-sm text-gray-900">{providerId}</span>

            {/* Move buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
              >
                &uarr;
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === backupProviders.length - 1}
                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
              >
                &darr;
              </button>
            </div>

            {/* Remove button */}
            <button
              onClick={() => handleRemoveBackup(index)}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              Remove
            </button>
          </div>
        ))}

        {backupProviders.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg">
            No backup providers configured
          </div>
        )}
      </div>

      {/* Add backup */}
      {unusedProviders.length > 0 && (
        <div className="flex items-center gap-3">
          <select
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              if (e.target.value) {
                handleAddBackup(e.target.value as AIProviderId);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Add backup provider...
            </option>
            {unusedProviders.map((providerId) => (
              <option key={providerId} value={providerId}>
                {providerId}
              </option>
            ))}
          </select>
        </div>
      )}

      {unusedProviders.length === 0 && backupProviders.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          All available providers are configured
        </p>
      )}
    </div>
  );
}
