import { WalletConnectEvent, EventHandler, EventHandlerMap } from '../types/events';

export class EventBus {
  private handlers: EventHandlerMap = {};
  private eventHistory: WalletConnectEvent[] = [];
  private maxHistorySize = 1000;

  /**
   * Subscribe to an event
   */
  on<T extends WalletConnectEvent>(event: T['type'], handler: EventHandler<T>): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler as EventHandler);
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends WalletConnectEvent>(event: T['type'], handler: EventHandler<T>): void {
    if (!this.handlers[event]) {
      return;
    }
    
    const index = this.handlers[event].indexOf(handler as EventHandler);
    if (index > -1) {
      this.handlers[event].splice(index, 1);
    }
  }

  /**
   * Emit an event
   */
  emit<T extends WalletConnectEvent>(event: T): void {
    // Add to history
    this.addToHistory(event);

    // Call handlers
    const handlers = this.handlers[event.type] || [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }
  }

  /**
   * Subscribe to an event once
   */
  once<T extends WalletConnectEvent>(event: T['type'], handler: EventHandler<T>): void {
    const onceHandler = async (eventData: T) => {
      await handler(eventData);
      this.off(event, onceHandler as EventHandler<T>);
    };
    this.on(event, onceHandler as EventHandler<T>);
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      delete this.handlers[event];
    } else {
      this.handlers = {};
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.handlers[event]?.length || 0;
  }

  /**
   * Subscribe to an event (alias for on)
   */
  subscribe<T extends WalletConnectEvent>(event: T['type'], handler: EventHandler<T>): () => void {
    this.on(event, handler);
    return () => this.off(event, handler);
  }

  /**
   * Publish an event (alias for emit)
   */
  publish<T extends WalletConnectEvent>(event: T): void {
    this.emit(event);
  }

  /**
   * Get event history
   */
  getEventHistory(eventType?: string, limit?: number): WalletConnectEvent[] {
    let events = this.eventHistory;
    
    if (eventType) {
      events = events.filter(event => event.type === eventType);
    }
    
    if (limit) {
      events = events.slice(-limit);
    }
    
    return events;
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Filter events
   */
  filterEvents(predicate: (event: WalletConnectEvent) => boolean): WalletConnectEvent[] {
    return this.eventHistory.filter(predicate);
  }

  /**
   * Get event statistics
   */
  getEventStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    lastEventTime: Date;
  } {
    const eventsByType: Record<string, number> = {};
    
    for (const event of this.eventHistory) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }

    return {
      totalEvents: this.eventHistory.length,
      eventsByType,
      lastEventTime: this.eventHistory.length > 0 
        ? this.eventHistory[this.eventHistory.length - 1]?.timestamp || new Date()
        : new Date()
    };
  }

  /**
   * Add event to history
   */
  private addToHistory(event: WalletConnectEvent): void {
    this.eventHistory.push(event);
    
    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
} 