import { UserSession } from './index';

// Event Types
export type EventType = 
  | 'session_connect'
  | 'session_disconnect'
  | 'session_update'
  | 'session_expire'
  | 'session_ping'
  | 'session_event'
  | 'transaction_request'
  | 'transaction_response'
  | 'sign_request'
  | 'sign_response'
  | 'error'
  | 'warning'
  | 'info';

// Event Data Types
export interface EventData {
  [key: string]: any;
}

// Base Event Interface
export interface BaseEvent {
  type: EventType;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  data?: EventData;
  error?: Error;
}

// Session Events
export interface SessionConnectEvent extends BaseEvent {
  type: 'session_connect';
  userId: string;
  sessionId: string;
  data: {
    topic: string;
    address: string;
    chainId: number;
    namespace: string;
  };
}

export interface SessionDisconnectEvent extends BaseEvent {
  type: 'session_disconnect';
  userId: string;
  sessionId: string;
  data: {
    topic: string;
    reason: string;
  };
}

export interface SessionUpdateEvent extends BaseEvent {
  type: 'session_update';
  userId: string;
  sessionId: string;
  data: {
    topic: string;
    updates: Partial<UserSession>;
  };
}

export interface SessionExpireEvent extends BaseEvent {
  type: 'session_expire';
  userId: string;
  sessionId: string;
  data: {
    topic: string;
    expiredAt: Date;
  };
}

export interface SessionPingEvent extends BaseEvent {
  type: 'session_ping';
  userId: string;
  sessionId: string;
  data: {
    topic: string;
    pingTime: number;
  };
}

export interface SessionEventEvent extends BaseEvent {
  type: 'session_event';
  userId: string;
  sessionId: string;
  data: {
    topic: string;
    eventName: string;
    eventData: any;
  };
}

// Transaction Events
export interface TransactionRequestEvent extends BaseEvent {
  type: 'transaction_request';
  userId: string;
  data: {
    to: string;
    value?: string;
    data?: string;
    gas?: string;
    gasPrice?: string;
    nonce?: number;
    chainId?: number;
  };
}

export interface TransactionResponseEvent extends BaseEvent {
  type: 'transaction_response';
  userId: string;
  data: {
    success: boolean;
    hash?: string;
    error?: string;
    receipt?: any;
  };
}

// Sign Events
export interface SignRequestEvent extends BaseEvent {
  type: 'sign_request';
  userId: string;
  data: {
    message?: string;
    typedData?: any;
    address?: string;
  };
}

export interface SignResponseEvent extends BaseEvent {
  type: 'sign_response';
  userId: string;
  data: {
    success: boolean;
    signature?: string;
    error?: string;
  };
}

// System Events
export interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: Error;
  data: {
    context: string;
    userId?: string;
    sessionId?: string;
  };
}

export interface WarningEvent extends BaseEvent {
  type: 'warning';
  data: {
    message: string;
    context: string;
    userId?: string;
    sessionId?: string;
  };
}

export interface InfoEvent extends BaseEvent {
  type: 'info';
  data: {
    message: string;
    context: string;
    userId?: string;
    sessionId?: string;
  };
}

// Union Type for All Events
export type WalletConnectEvent = 
  | SessionConnectEvent
  | SessionDisconnectEvent
  | SessionUpdateEvent
  | SessionExpireEvent
  | SessionPingEvent
  | SessionEventEvent
  | TransactionRequestEvent
  | TransactionResponseEvent
  | SignRequestEvent
  | SignResponseEvent
  | ErrorEvent
  | WarningEvent
  | InfoEvent;

// Event Handler Types
export type EventHandler<T extends WalletConnectEvent = WalletConnectEvent> = (event: T) => void | Promise<void>;

export interface EventHandlerMap {
  [eventType: string]: EventHandler[];
}

// Event Emitter Interface
export interface EventEmitter {
  on<T extends WalletConnectEvent>(event: T['type'], handler: EventHandler<T>): void;
  off<T extends WalletConnectEvent>(event: T['type'], handler: EventHandler<T>): void;
  emit<T extends WalletConnectEvent>(event: T): void;
  once<T extends WalletConnectEvent>(event: T['type'], handler: EventHandler<T>): void;
  removeAllListeners(event?: string): void;
  listenerCount(event: string): number;
}

// Event Bus Interface
export interface EventBus extends EventEmitter {
  // Event Management
  subscribe<T extends WalletConnectEvent>(event: T['type'], handler: EventHandler<T>): () => void;
  publish<T extends WalletConnectEvent>(event: T): void;
  
  // Event History
  getEventHistory(eventType?: string, limit?: number): WalletConnectEvent[];
  clearEventHistory(): void;
  
  // Event Filtering
  filterEvents(predicate: (event: WalletConnectEvent) => boolean): WalletConnectEvent[];
  
  // Event Statistics
  getEventStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    lastEventTime: Date;
  };
}

// Event Logger Interface
export interface EventLogger {
  log(event: WalletConnectEvent): void;
  getLogs(eventType?: string, startTime?: Date, endTime?: Date): WalletConnectEvent[];
  clearLogs(): void;
  exportLogs(format: 'json' | 'csv'): string;
} 