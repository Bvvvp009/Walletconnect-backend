// Storage Configuration Types
export interface StorageConfig {
  type: 'memory' | 'file' | 'redis' | 'database';
  options?: Record<string, any>;
}

// Memory Storage Types
export interface MemoryStorageConfig {
  type: 'memory';
  options?: {
    maxSize?: number;
    ttl?: number;
    cleanupInterval?: number;
  };
}

// File Storage Types
export interface FileStorageConfig {
  type: 'file';
  filePath: string;
  options?: {
    encoding?: string;
    autoBackup?: boolean;
    backupInterval?: number;
  };
}

// Redis Storage Types
export interface RedisStorageConfig {
  type: 'redis';
  connectionString: string;
  options?: {
    keyPrefix?: string;
    ttl?: number;
    retryDelayOnFailover?: number;
    enableReadyCheck?: boolean;
  };
}

// Database Storage Types
export interface DatabaseStorageConfig {
  type: 'database';
  tableName: string;
  options?: {
    connectionString?: string;
    databaseType?: 'sqlite' | 'postgresql' | 'mysql';
  };
}

// Storage Item Types
export interface StorageItem<T = any> {
  key: string;
  value: T;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// Storage Events
export interface StorageEvent {
  type: 'set' | 'get' | 'delete' | 'clear' | 'expire' | 'error' | 'connect' | 'disconnect' | 'info';
  key?: string;
  timestamp: Date;
  data?: any;
  error?: Error;
}

// Storage Statistics
export interface StorageStats {
  totalItems: number;
  totalSize: number;
  expiredItems: number;
  hitRate: number;
  missRate: number;
  lastCleanup: Date;
  uptime: number;
}

// Storage Adapter Interface
export interface StorageAdapter {
  // Basic Operations
  getItem<T = string>(key: string): Promise<T | undefined>;
  setItem<T = string>(key: string, value: T, ttl?: number): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // Batch Operations
  getItems<T = string>(keys: string[]): Promise<Record<string, T>>;
  setItems<T = string>(items: Record<string, T>, ttl?: number): Promise<void>;
  removeItems(keys: string[]): Promise<void>;
  
  // Query Operations
  getKeys(): Promise<string[]>;
  getEntries<T = string>(): Promise<[string, T][]>;
  hasKey(key: string): Promise<boolean>;
  
  // Utility Operations
  getStats(): Promise<StorageStats>;
  cleanup(): Promise<number>;
  backup(): Promise<string>;
  restore(backup: string): Promise<void>;
  
  // Events
  on(event: string, callback: (event: StorageEvent) => void): void;
  off(event: string, callback: (event: StorageEvent) => void): void;
  
  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// Storage Factory Types
export interface StorageFactory {
  createStorage(config: StorageConfig): StorageAdapter;
  getSupportedTypes(): string[];
  validateConfig(config: StorageConfig): boolean;
}

// Storage Migration Types
export interface StorageMigration {
  from: StorageAdapter;
  to: StorageAdapter;
  migrate(): Promise<void>;
  validate(): Promise<boolean>;
}

// Storage Cache Types
export interface CacheConfig {
  maxSize: number;
  ttl: number;
  cleanupInterval: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
}

export interface CacheAdapter extends StorageAdapter {
  getCacheStats(): Promise<StorageStats>;
  warmup(keys: string[]): Promise<void>;
  invalidate(pattern: string): Promise<number>;
} 