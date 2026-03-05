import { useState } from 'react';

export function SecurityNotice() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          &#x26A0;&#xFE0F;
        </span>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1">
            Security Notice
          </h3>
          <p className="text-sm text-amber-800">
            Your API keys are stored in your browser's local storage with basic
            obfuscation. This is NOT cryptographically secure.
          </p>

          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-amber-700 hover:text-amber-900 underline mt-2"
            >
              Read more about security
            </button>
          )}

          {isExpanded && (
            <div className="mt-3 space-y-2 text-sm text-amber-800">
              <p>
                Anyone with physical access to your device could potentially
                extract these keys from your browser's storage.
              </p>
              <p className="font-medium">For maximum security:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Only use keys on devices you control</li>
                <li>Use restricted API keys with spending limits</li>
                <li>Rotate keys regularly</li>
                <li>Clear settings when using shared devices</li>
                <li>Never share your device while logged in</li>
              </ul>
              <p className="mt-3">
                By adding an API key, you acknowledge these risks and take
                responsibility for key security.
              </p>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-sm text-amber-700 hover:text-amber-900 underline mt-1"
              >
                Show less
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
