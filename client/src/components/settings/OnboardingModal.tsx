import { useState, useEffect } from 'react';

export function OnboardingModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('ai-provider-onboarding-seen');

    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('ai-provider-onboarding-seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">
            Welcome to AI Provider Settings
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-gray-700">
            You can now use your own AI provider API keys for faster responses
            and more control over which models power Lernf's features.
          </p>

          {/* Feature highlights */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Bring Your Own Keys
                </h3>
                <p className="text-sm text-gray-600">
                  Use Claude, OpenAI, or Google Gemini with your own API keys
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Automatic Fallback
                </h3>
                <p className="text-sm text-gray-600">
                  Set backup providers that activate if your primary fails
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Full Control
                </h3>
                <p className="text-sm text-gray-600">
                  Choose which models to use for different features
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🆓</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Free Option Available
                </h3>
                <p className="text-sm text-gray-600">
                  No API key? No problem. Backend default works out of the box.
                </p>
              </div>
            </div>
          </div>

          {/* Security notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  <strong>Security Note:</strong> API keys are stored in your
                  browser's local storage with basic obfuscation. Only add keys
                  on devices you trust.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleDismiss}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
