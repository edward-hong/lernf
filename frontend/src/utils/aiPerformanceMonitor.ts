interface PerformanceMetric {
  provider: string;
  model: string;
  requestTime: number;
  tokenCount?: number;
  success: boolean;
  timestamp: Date;
}

const MAX_METRICS = 100;

class AIPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  constructor() {
    this.load();
  }

  recordRequest(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > MAX_METRICS) {
      this.metrics = this.metrics.slice(-MAX_METRICS);
    }

    this.save();
  }

  getAverageResponseTime(provider?: string): number {
    const relevant = provider
      ? this.metrics.filter((m) => m.provider === provider && m.success)
      : this.metrics.filter((m) => m.success);

    if (relevant.length === 0) return 0;

    const total = relevant.reduce((sum, m) => sum + m.requestTime, 0);
    return Math.round(total / relevant.length);
  }

  getSuccessRate(provider?: string): number {
    const relevant = provider
      ? this.metrics.filter((m) => m.provider === provider)
      : this.metrics;

    if (relevant.length === 0) return 0;

    const successful = relevant.filter((m) => m.success).length;
    return Math.round((successful / relevant.length) * 100);
  }

  getStats(): {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    byProvider: Record<
      string,
      { count: number; avgTime: number; successRate: number }
    >;
  } {
    const byProvider: Record<string, PerformanceMetric[]> = {};

    this.metrics.forEach((metric) => {
      if (!byProvider[metric.provider]) {
        byProvider[metric.provider] = [];
      }
      byProvider[metric.provider].push(metric);
    });

    return {
      totalRequests: this.metrics.length,
      successRate: this.getSuccessRate(),
      avgResponseTime: this.getAverageResponseTime(),
      byProvider: Object.entries(byProvider).reduce(
        (acc, [provider, metrics]) => {
          const successful = metrics.filter((m) => m.success);
          const avgTime =
            successful.reduce((sum, m) => sum + m.requestTime, 0) /
            (successful.length || 1);

          acc[provider] = {
            count: metrics.length,
            avgTime: Math.round(avgTime),
            successRate: Math.round(
              (successful.length / metrics.length) * 100,
            ),
          };
          return acc;
        },
        {} as Record<
          string,
          { count: number; avgTime: number; successRate: number }
        >,
      ),
    };
  }

  clear(): void {
    this.metrics = [];
    localStorage.removeItem('ai-performance-metrics');
  }

  private save(): void {
    try {
      localStorage.setItem(
        'ai-performance-metrics',
        JSON.stringify(this.metrics),
      );
    } catch (error) {
      console.warn('Failed to save performance metrics:', error);
    }
  }

  private load(): void {
    try {
      const stored = localStorage.getItem('ai-performance-metrics');
      if (stored) {
        this.metrics = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load performance metrics:', error);
    }
  }
}

export const performanceMonitor = new AIPerformanceMonitor();
