import { useEffect, useState } from 'react';
import { performanceMonitor } from '../../utils/aiPerformanceMonitor';

export function PerformanceStats() {
  const [stats, setStats] = useState(performanceMonitor.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(performanceMonitor.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (stats.totalRequests === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Performance Stats
        </h2>
        <p className="text-sm text-gray-600">
          No AI requests yet. Stats will appear here after you start using the
          features.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Performance Stats
        </h2>
        <button
          onClick={() => {
            if (confirm('Clear all performance data?')) {
              performanceMonitor.clear();
              setStats(performanceMonitor.getStats());
            }
          }}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear Stats
        </button>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalRequests}
          </div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {stats.successRate}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {stats.avgResponseTime}ms
          </div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
        </div>
      </div>

      {/* By provider */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">By Provider</h3>
        {Object.entries(stats.byProvider).map(
          ([provider, providerStats]) => (
            <div
              key={provider}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{provider}</div>
                <div className="text-sm text-gray-600">
                  {providerStats.count} requests
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-600">Success: </span>
                  <span className="font-medium text-gray-900">
                    {providerStats.successRate}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Avg: </span>
                  <span className="font-medium text-gray-900">
                    {providerStats.avgTime}ms
                  </span>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
