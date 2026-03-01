interface KeyStrengthIndicatorProps {
  apiKey: string;
  providerId: string;
}

export function KeyStrengthIndicator({
  apiKey,
  providerId,
}: KeyStrengthIndicatorProps) {
  if (!apiKey) return null;

  // Simple heuristics (not cryptographically meaningful, just UX feedback)
  const hasCorrectPrefix =
    (providerId === 'claude' && apiKey.startsWith('sk-ant-')) ||
    (providerId === 'openai' &&
      (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-'))) ||
    (providerId === 'gemini' && apiKey.startsWith('AIza'));

  const hasGoodLength = apiKey.length >= 40;
  const hasVariety =
    /[A-Z]/.test(apiKey) && /[a-z]/.test(apiKey) && /[0-9]/.test(apiKey);

  const strength = [hasCorrectPrefix, hasGoodLength, hasVariety].filter(
    Boolean,
  ).length;

  const strengthLabel =
    strength === 3
      ? 'Strong'
      : strength === 2
        ? 'Good'
        : strength === 1
          ? 'Weak'
          : 'Invalid';

  const strengthColor =
    strength === 3
      ? 'text-green-600'
      : strength === 2
        ? 'text-blue-600'
        : strength === 1
          ? 'text-yellow-600'
          : 'text-red-600';

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Key strength:</span>
      <span className={`font-medium ${strengthColor}`}>{strengthLabel}</span>

      {/* Visual bar */}
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`w-6 h-2 rounded-full ${
              level <= strength
                ? strength === 3
                  ? 'bg-green-500'
                  : strength === 2
                    ? 'bg-blue-500'
                    : 'bg-yellow-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
