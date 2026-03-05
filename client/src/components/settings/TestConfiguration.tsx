import { useState } from 'react';
import type { AIProviderSettings } from '../../types/aiProvider';
import { callAI } from '../../api/aiClient';

interface TestConfigurationProps {
  settings: AIProviderSettings;
}

export function TestConfiguration({ settings: _settings }: TestConfigurationProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const startTime = Date.now();

      const response = await callAI({
        messages: [{ role: 'user', content: 'Hi, this is a test.' }],
        maxTokens: 50,
      });

      const duration = Date.now() - startTime;

      setTestResults(
        `Success!\n\nProvider: ${response.provider}\nModel: ${response.model}\nResponse time: ${duration}ms\n\nResponse: "${response.content.slice(0, 100)}${response.content.length > 100 ? '...' : ''}"`,
      );
    } catch (error) {
      setTestResults(
        `Test failed:\n\n${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Test Configuration
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Send a test request through your configured provider chain.
      </p>

      <button
        onClick={handleTest}
        disabled={isTesting}
        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isTesting ? 'Testing...' : 'Test Configuration'}
      </button>

      {testResults && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
            {testResults}
          </pre>
        </div>
      )}
    </div>
  );
}
