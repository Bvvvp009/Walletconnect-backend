import { DatabaseAdapter, QueryOptions, QueryResult, DatabaseHealth, DatabaseEvent } from '../types/database';
import { UserSession } from '../types';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

export class SQLiteDatabase implements DatabaseAdapter {
  private db: Database | null = null;
  private isConnectedFlag = false;
  private eventHandlers: Map<string, ((event: DatabaseEvent) => void)[]> = new Map();
  private databasePath: string;

  constructor(config: { databasePath: string }) {
    this.databasePath = config.databasePath;
  }

  async connect(): Promise<void> {
    try {
      this.db = await open({
        filename: this.databasePath,
        driver: sqlite3.Database
      });

      // Create tables if they don't exist
      await this.createTables();
      
      this.isConnectedFlag = true;
      this.emitEvent({
        type: 'connect',
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

  async disconnect(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
    
    this.isConnectedFlag = false;
    this.emitEvent({
      type: 'disconnect',
      timestamp: new Date()
    });
  }

  isConnected(): boolean {
    return this.isConnectedFlag && this.db !== null;
  }

  async saveSession(session: UserSession): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      await this.db.run(`
        INSERT OR REPLACE INTO user_sessions (
          userId, topic, address, sessionData, isActive, 
          createdAt, updatedAt, lastActivity, chainId, namespace
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        session.userId,
        session.topic || null,
        session.address || null,
        session.sessionData ? JSON.stringify(session.sessionData) : null,
        session.isActive ? 1 : 0,
        session.createdAt.toISOString(),
        session.updatedAt.toISOString(),
        session.lastActivity.toISOString(),
        (session.sessionData as any)?.chainId || null,
        (session.sessionData as any)?.namespaces?.['eip155']?.chains?.[0] || null
      ]);

      this.emitEvent({
        type: 'migration',
        timestamp: new Date(),
        data: { action: 'save_session', userId: session.userId }
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

  async getSession(userId: string): Promise<UserSession | null> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const row = await this.db.get(`
        SELECT * FROM user_sessions WHERE userId = ?
      `, [userId]);

      if (!row) {
        return null;
      }

      return this.rowToSession(row);
    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        error: error as Error
      });
      throw error;
    }
  }

  async getAllSessions(options?: QueryOptions): Promise<QueryResult<UserSession>> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      let query = 'SELECT * FROM user_sessions';
      const params: any[] = [];

      // Add WHERE clause if provided
      if (options?.where) {
        const whereConditions = Object.entries(options.where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        query += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      // Add ORDER BY if provided
      if (options?.orderBy) {
        query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
      }

      // Add LIMIT and OFFSET
      if (options?.limit) {
        query += ` LIMIT ?`;
        params.push(options.limit);
        
        if (options?.offset) {
          query += ` OFFSET ?`;
          params.push(options.offset);
        }
      }

      const rows = await this.db.all(query, params);
      const sessions = rows.map(row => this.rowToSession(row));

      // Get total count
      const countResult = await this.db.get('SELECT COUNT(*) as count FROM user_sessions');
      const total = countResult?.count || 0;

      return {
        data: sessions,
        total,
        limit: options?.limit || sessions.length,
        offset: options?.offset || 0
      };
    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        error: error as Error
      });
      throw error;
    }
  }

  async updateSession(userId: string, updates: Partial<UserSession>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates).map(value => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return value;
      });

      values.push(userId);

      await this.db.run(`
        UPDATE user_sessions SET ${updateFields} WHERE userId = ?
      `, values);

      this.emitEvent({
        type: 'migration',
        timestamp: new Date(),
        data: { action: 'update_session', userId }
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

  async deleteSession(userId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      await this.db.run(`
        DELETE FROM user_sessions WHERE userId = ?
      `, [userId]);

      this.emitEvent({
        type: 'migration',
        timestamp: new Date(),
        data: { action: 'delete_session', userId }
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

  async cleanupExpiredSessions(timeout: number = 24 * 60 * 60 * 1000): Promise<number> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const cutoffTime = new Date(Date.now() - timeout).toISOString();
      
      const result = await this.db.run(`
        DELETE FROM user_sessions 
        WHERE lastActivity < ? OR isActive = 0
      `, [cutoffTime]);

      const deletedCount = result.changes || 0;

      this.emitEvent({
        type: 'cleanup',
        timestamp: new Date(),
        data: { deletedCount }
      });

      return deletedCount;
    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        error: error as Error
      });
      throw error;
    }
  }

  async getHealth(): Promise<DatabaseHealth> {
    if (!this.db) {
      return {
        isConnected: false,
        responseTime: 0,
        activeConnections: 0,
        totalSessions: 0,
        lastError: 'Database not connected',
        timestamp: new Date()
      };
    }

    try {
      const startTime = Date.now();
      
      // Test connection
      await this.db.get('SELECT 1');
      
      const responseTime = Date.now() - startTime;
      
      // Get session count
      const countResult = await this.db.get('SELECT COUNT(*) as count FROM user_sessions');
      const totalSessions = countResult?.count || 0;

      return {
        isConnected: true,
        responseTime,
        activeConnections: 1, // SQLite doesn't have connection pooling
        totalSessions,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        isConnected: false,
        responseTime: 0,
        activeConnections: 0,
        totalSessions: 0,
        lastError: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  async backup(): Promise<string> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const sessions = await this.getAllSessions();
      const backup = {
        sessions: sessions.data,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(backup, null, 2);
    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        error: error as Error
      });
      throw error;
    }
  }

  async restore(backup: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const data = JSON.parse(backup);
      
      // Clear existing data
      await this.db.run('DELETE FROM user_sessions');
      
      // Restore sessions
      for (const session of data.sessions) {
        await this.saveSession(session);
      }

      this.emitEvent({
        type: 'migration',
        timestamp: new Date(),
        data: { action: 'restore_backup', sessionCount: data.sessions.length }
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

  async migrate(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      await this.createTables();
      
      this.emitEvent({
        type: 'migration',
        timestamp: new Date(),
        data: { action: 'migrate' }
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

  on(event: string, callback: (event: DatabaseEvent) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  off(event: string, callback: (event: DatabaseEvent) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        userId TEXT PRIMARY KEY,
        topic TEXT,
        address TEXT,
        sessionData TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        lastActivity TEXT NOT NULL,
        chainId INTEGER,
        namespace TEXT
      )
    `);

    // Create indexes for better performance
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_topic ON user_sessions(topic);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_address ON user_sessions(address);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_isActive ON user_sessions(isActive);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_lastActivity ON user_sessions(lastActivity);
    `);
  }

  private rowToSession(row: any): UserSession {
    return {
      userId: row.userId,
      topic: row.topic || undefined,
      address: row.address || undefined,
      sessionData: row.sessionData ? JSON.parse(row.sessionData) : undefined,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      lastActivity: new Date(row.lastActivity),
      wcClient: null // Placeholder - will be set by the SDK
    };
  }

  private emitEvent(event: DatabaseEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in database event handler:', error);
        }
      }
    }
  }
} 