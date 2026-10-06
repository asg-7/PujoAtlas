type TelemetryEventType =
  | 'search_query'
  | 'search_click'
  | 'zone_click'
  | 'filter_click'
  | 'locate_me_click'
  | 'near_me_click'
  | 'layer_toggle'
  | 'entity_view'
  | 'navigate_outbound'
  | 'pandal_card_click'
  | 'pandal_save_toggle'
  | 'pandal_visited_toggle'
  | 'share_click'
  | 'mobile_nav_click'
  | 'nav_tab_click'
  | 'language_toggle'
  | 'discover_category_click'
  | 'food_category_click'
  | 'heritage_age_click';

interface TelemetryEvent {
  type: TelemetryEventType;
  payload: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

/**
 * T-24: Privacy-First Event Telemetry.
 * Lightweight event logger recording interactions without PII.
 * Batches analytics pings and sends them via sendBeacon on unload,
 * or when the queue reaches a threshold.
 */
class TelemetryLogger {
  private events: TelemetryEvent[] = [];
  private readonly endpoint = '/api/telemetry/batch'; // Conceptual backend endpoint
  private readonly sessionId = Math.random().toString(36).substring(2, 15);
  private readonly BATCH_SIZE = 20;

  constructor() {
    if (typeof window !== 'undefined') {
      // Send remaining events on page unload
      window.addEventListener('beforeunload', () => this.flush());
      
      // Also flush on visibility change (mobile friendly)
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush();
        }
      });
    }
  }

  /**
   * Track an event. Pushes to the queue and flushes if full.
   */
  track(type: TelemetryEventType, payload: Record<string, unknown> = {}) {
    this.events.push({
      type,
      payload,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });

    // Optionally log to console in dev mode
    if (import.meta.env?.DEV) {
      console.debug(`[Telemetry] ${type}:`, payload);
    }

    if (this.events.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Flush the event queue to the server.
   */
  private flush() {
    if (this.events.length === 0 || typeof navigator === 'undefined') return;

    const data = JSON.stringify({ events: this.events });

    try {
      if (navigator.sendBeacon) {
        // High reliability for page unloads
        navigator.sendBeacon(this.endpoint, data);
      } else {
        // Fallback for older browsers
        fetch(this.endpoint, {
          method: 'POST',
          body: data,
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {});
      }
    } catch (e) {
      // Silent fail — analytics should never break the app
    }

    this.events = [];
  }
}

export const telemetry = new TelemetryLogger();
