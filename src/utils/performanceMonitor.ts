import { analytics } from './analytics';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface MetricsFilter {
  name?: string;
  minDuration?: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();

  private constructor() {
    this.setupPerformanceObserver();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.recordMetric(entry.name, entry.duration);
        });
      });

      observer.observe({ entryTypes: ['measure', 'longtask'] });
    }
  }

  startMark(name: string): void {
    this.marks.set(name, performance.now());
  }

  endMark(name: string, metadata?: Record<string, any>): void {
    const startTime = this.marks.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, metadata);
      this.marks.delete(name);
    }
  }

  private recordMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.metrics.push(metric);
    
    // Report to analytics if duration is concerning
    if (duration > 1000) {
      analytics.track('performance_issue', {
        ...metric,
        severity: duration > 3000 ? 'high' : 'medium'
      });
    }
  }

  getMetrics(filter?: MetricsFilter): PerformanceMetric[] {
    let filteredMetrics = [...this.metrics];

    if (filter?.name) {
      filteredMetrics = filteredMetrics.filter(m => m.name === filter.name);
    }

    // Using optional chaining with nullish coalescing for type safety
    const minDuration = filter?.minDuration ?? 0;
    if (minDuration > 0) {
      filteredMetrics = filteredMetrics.filter(m => m.duration >= minDuration);
    }

    return filteredMetrics;
  }

  clearMetrics(): void {
    this.metrics = [];
    this.marks.clear();
  }

  // Added utility methods
  getAverageMetric(name: string): number {
    const relevantMetrics = this.getMetrics({ name });
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.duration, 0);
    return sum / relevantMetrics.length;
  }

  getMetricsSummary(): Record<string, { avg: number; count: number }> {
    const summary: Record<string, { avg: number; count: number }> = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { avg: 0, count: 0 };
      }
      const entry = summary[metric.name];
      entry.avg = (entry.avg * entry.count + metric.duration) / (entry.count + 1);
      entry.count++;
    });

    return summary;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();