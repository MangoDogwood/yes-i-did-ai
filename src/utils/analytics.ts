// src/utils/analytics.ts

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  track(name: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        sessionId: this.sessionId
      },
      timestamp: new Date().toISOString()
    };

    this.events.push(event);
    this.persistEvent(event);
  }

  private persistEvent(event: AnalyticsEvent): void {
    try {
      const storedEvents = localStorage.getItem('analytics_events');
      const events = storedEvents ? JSON.parse(storedEvents) : [];
      events.push(event);
      localStorage.setItem('analytics_events', JSON.stringify(events.slice(-100)));
    } catch (error) {
      console.error('Failed to persist analytics event:', error);
    }
  }
}

export const analytics = new Analytics();