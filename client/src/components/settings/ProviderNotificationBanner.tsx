import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProviderNotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem('provider-banner-dismissed');
    if (dismissed) return;

    const requestCount = parseInt(
      localStorage.getItem('ai-request-count') || '0',
      10,
    );

    // Show after 10 AI requests
    if (requestCount >= 10) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('provider-banner-dismissed', 'true');
    setIsVisible(false);
  };

  const handleConfigure = () => {
    handleDismiss();
    navigate('/settings');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <div className="bg-white border border-blue-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Tip: Use Your Own AI Provider
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Get faster responses and more control by using your own Claude,
              OpenAI, or Gemini API key.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfigure}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Configure Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
