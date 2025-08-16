import { StorageAdapter, StorageEvent, StorageStats } from '../types/storage';

export class MemoryStorage implements StorageAdapter {
  private storage: Map<string, any> = new Map();
  private eventHandlers: Map<string, ((event: StorageEvent) => void)[]> = new Map();
  private isConnectedFlag = false;
  private stats = {
    totalItems: 0,
    totalSize: 0,
    expiredItems: 0,
    hitRate: 0,
    missRate: 0,
    lastCleanup: new Date(),
    uptime: Date.now()
  };

  async connect(): Promise<void> {
    this.isConnectedFlag = true;
    this.emitEvent({
      type: 'connect',
      timestamp: new Date()
    });
  }

  async disconnect(): Promise<void> {
    this.isConnectedFlag = false;
    this.emitEvent({
      type: 'disconnect',
      timestamp: new Date()
    });
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  async getItem<T = string>(key: string): Promise<T | undefined> {
    try {
      const item = this.storage.get(key);
      if (!item) {
        this.updateStats('miss');
        return undefined;
      }

      // Check if item has expired
      if (item.expiresAt && new Date() > item.expiresAt) {
        await this.removeItem(key);
        this.updateStats('miss');
        return undefined;
      }

      this.updateStats('hit');
      this.emitEvent({
        type: 'get',
        timestamp: new Date(),
        key,
        data: item.value
      });

      return item.value;
    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        key,
        error: error as Error
      });
      throw error;
    }
  }

  async setItem<T = string>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : undefined;
      
      const item = {
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt
      };

      const oldItem = this.storage.get(key);
      if (oldItem) {
        this.stats.totalSize -= this.getItemSize(oldItem);
      }

      this.storage.set(key, item);
      this.stats.totalItems = this.storage.size;
      this.stats.totalSize += this.getItemSize(item);

      this.emitEvent({
        type: 'set',
        timestamp: new Date(),
        key,
        data: value
      });
    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        key,
        error: error as Error
      });
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const item = this.storage.get(key);
      if (item) {
        this.stats.totalSize -= this.getItemSize(item);
        this.stats.totalItems--;
      }

      this.storage.delete(key);

      this.emitEvent({
        type: 'delete',
        timestamp: new Date(),
        key
      });
    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        key,
        error: error as Error
      });
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.storage.clear();
      this.stats.totalItems = 0;
      this.stats.totalSize = 0;

      this.emitEvent({
        type: 'clear',
        timestamp: new Date()
      });
    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        error: error as Error
      });
      throw error;
    }
  }

  async getItems<T = string>(keys: string[]): Promise<Record<string, T>> {
    const result: Record<string, T> = {};
    
    for (const key of keys) {
      const value = await this.getItem<T>(key);
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }

  async setItems<T = string>(items: Record<string, T>, ttl?: number): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      await this.setItem(key, value, ttl);
    }
  }

  async removeItems(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.removeItem(key);
    }
  }

  async getKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async getEntries<T = string>(): Promise<[string, T][]> {
    const entries: [string, T][] = [];
    
    for (const [key, item] of this.storage.entries()) {
      if (!item.expiresAt || new Date() <= item.expiresAt) {
        entries.push([key, item.value]);
      }
    }

    return entries;
  }

  async hasKey(key: string): Promise<boolean> {
    const item = this.storage.get(key);
    if (!item) return false;
    
    if (item.expiresAt && new Date() > item.expiresAt) {
      await this.removeItem(key);
      return false;
    }
    
    return true;
  }

  async getStats(): Promise<StorageStats> {
    const now = Date.now();
    return {
      ...this.stats,
      uptime: now - this.stats.uptime
    };
  }

  async cleanup(): Promise<number> {
    let removedCount = 0;
    const now = new Date();

    for (const [key, item] of this.storage.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        await this.removeItem(key);
        removedCount++;
      }
    }

    this.stats.expiredItems += removedCount;
    this.stats.lastCleanup = now;

    this.emitEvent({
      type: 'expire',
      timestamp: now,
      data: { removedCount }
    });

    return removedCount;
  }

  async backup(): Promise<string> {
    const data = {
      storage: Array.from(this.storage.entries()),
      stats: this.stats,
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  async restore(backup: string): Promise<void> {
    try {
      const data = JSON.parse(backup);
      
      // Clear current storage
      await this.clear();
      
      // Restore data
      for (const [key, item] of data.storage) {
        this.storage.set(key, item);
      }
      
      this.stats = data.stats;
      
      this.emitEvent({
        type: 'info',
        timestamp: new Date(),
        data: { message: 'Storage restored from backup' }
      });
    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        error: error as Error
      });
      throw error;
    }
  }

  on(event: string, callback: (event: StorageEvent) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  off(event: string, callback: (event: StorageEvent) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emitEvent(event: StorageEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in storage event handler:', error);
        }
      }
    }
  }

  private updateStats(type: 'hit' | 'miss'): void {
    const total = this.stats.hitRate + this.stats.missRate + 1;
    
    if (type === 'hit') {
      this.stats.hitRate++;
    } else {
      this.stats.missRate++;
    }
  }

  private getItemSize(item: any): number {
    return JSON.stringify(item).length;
  }
} 