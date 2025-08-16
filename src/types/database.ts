import { UserSession } from './index';

// Database Connection Types
export interface DatabaseConnection {
  isConnected: boolean;
  connectionString?: string;
  options?: Record<string, any>;
}

// SQLite Types
export interface SQLiteConfig {
  type: 'sqlite';
  databasePath: string;
  options?: {
    verbose?: boolean;
    timeout?: number;
  };
}

// PostgreSQL Types
export interface PostgreSQLConfig {
  type: 'postgresql';
  connectionString: string;
  options?: {
    ssl?: boolean;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  };
}

// MySQL Types
export interface MySQLConfig {
  type: 'mysql';
  connectionString: string;
  options?: {
    ssl?: boolean;
    connectionLimit?: number;
    acquireTimeout?: number;
    timeout?: number;
  };
}

// MongoDB Types
export interface MongoDBConfig {
  type: 'mongodb';
  connectionString: string;
  databaseName: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
  };
}

// Redis Types
export interface RedisConfig {
  type: 'redis';
  connectionString: string;
  options?: {
    retryDelayOnFailover?: number;
    enableReadyCheck?: boolean;
    maxRetriesPerRequest?: number;
    lazyConnect?: boolean;
  };
}

// Memory Types
export interface MemoryConfig {
  type: 'memory';
  options?: {
    maxSize?: number;
    ttl?: number;
  };
}

// Database Session Storage
export interface DatabaseSession {
  userId: string;
  topic?: string;
  address?: string;
  sessionData?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  chainId?: number;
  namespace?: string;
}

// Database Migration Types
export interface Migration {
  version: number;
  name: string;
  up: (connection: any) => Promise<void>;
  down: (connection: any) => Promise<void>;
}

// Database Query Types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  where?: Record<string, any>;
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Database Health Check
export interface DatabaseHealth {
  isConnected: boolean;
  responseTime: number;
  activeConnections: number;
  totalSessions: number;
  lastError?: string;
  timestamp: Date;
}

// Database Events
export interface DatabaseEvent {
  type: 'connect' | 'disconnect' | 'error' | 'migration' | 'cleanup';
  timestamp: Date;
  data?: any;
  error?: Error;
}

// Database Adapter Interface
export interface DatabaseAdapter {
  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Session Management
  saveSession(session: UserSession): Promise<void>;
  getSession(userId: string): Promise<UserSession | null>;
  getAllSessions(options?: QueryOptions): Promise<QueryResult<UserSession>>;
  updateSession(userId: string, updates: Partial<UserSession>): Promise<void>;
  deleteSession(userId: string): Promise<void>;
  
  // Maintenance
  cleanupExpiredSessions(timeout?: number): Promise<number>;
  getHealth(): Promise<DatabaseHealth>;
  
  // Events
  on(event: string, callback: (event: DatabaseEvent) => void): void;
  off(event: string, callback: (event: DatabaseEvent) => void): void;
  
  // Utilities
  backup(): Promise<string>;
  restore(backup: string): Promise<void>;
  migrate(): Promise<void>;
} 