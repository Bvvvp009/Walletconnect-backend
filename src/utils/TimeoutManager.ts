import { TimeoutConfig } from '../types';

// Default timeout configurations
const DEFAULT_TIMEOUTS: TimeoutConfig = {
  connection: 30000, // 30 seconds
  transaction: 60000, // 1 minute
  signing: 30000, // 30 seconds
  contractCall: 60000, // 1 minute
  contractRead: 15000, // 15 seconds
  gasEstimation: 15000, // 15 seconds
  sessionExpiry: 24 * 60 * 60 * 1000, // 24 hours
  cleanup: 5 * 60 * 1000 // 5 minutes
};

// Timeout error class
export class TimeoutError extends Error {
  constructor(
    message: string,
    public operation: string,
    public timeout: number
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Timeout manager for handling timeouts in wallet interactions
export class TimeoutManager {
  private timeouts: TimeoutConfig;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(customTimeouts?: Partial<TimeoutConfig>) {
    this.timeouts = { ...DEFAULT_TIMEOUTS, ...customTimeouts };
  }

  // Create a timeout promise
  createTimeout<T>(
    operation: string,
    promise: Promise<T>,
    timeoutType: keyof TimeoutConfig
  ): Promise<T> {
    const timeout = this.timeouts[timeoutType];
    
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          reject(new TimeoutError(
            `${operation} timed out after ${timeout}ms`,
            operation,
            timeout
          ));
        }, timeout);
        
        this.timers.set(operation, timer);
      })
    ]).finally(() => {
      const timer = this.timers.get(operation);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(operation);
      }
    });
  }

  // Wait for user interaction with timeout
  async waitForUserInteraction<T>(
    operation: string,
    promise: Promise<T>,
    timeoutType: keyof TimeoutConfig = 'connection'
  ): Promise<T> {
    return this.createTimeout(operation, promise, timeoutType);
  }

  // Wait for connection with timeout
  async waitForConnection<T>(
    operation: string,
    promise: Promise<T>
  ): Promise<T> {
    return this.waitForUserInteraction(operation, promise, 'connection');
  }

  // Wait for transaction with timeout
  async waitForTransaction<T>(
    operation: string,
    promise: Promise<T>
  ): Promise<T> {
    return this.waitForUserInteraction(operation, promise, 'transaction');
  }

  // Wait for signing with timeout
  async waitForSigning<T>(
    operation: string,
    promise: Promise<T>
  ): Promise<T> {
    return this.waitForUserInteraction(operation, promise, 'signing');
  }

  // Wait for contract call with timeout
  async waitForContractCall<T>(
    operation: string,
    promise: Promise<T>
  ): Promise<T> {
    return this.waitForUserInteraction(operation, promise, 'contractCall');
  }

  // Wait for contract read with timeout
  async waitForContractRead<T>(
    operation: string,
    promise: Promise<T>
  ): Promise<T> {
    return this.waitForUserInteraction(operation, promise, 'contractRead');
  }

  // Wait for gas estimation with timeout
  async waitForGasEstimation<T>(
    operation: string,
    promise: Promise<T>
  ): Promise<T> {
    return this.waitForUserInteraction(operation, promise, 'gasEstimation');
  }

  // Clear all timers
  clearAllTimers(): void {
    for (const [operation, timer] of this.timers.entries()) {
      clearTimeout(timer);
      this.timers.delete(operation);
    }
  }

  // Clear specific timer
  clearTimer(operation: string): void {
    const timer = this.timers.get(operation);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(operation);
    }
  }

  // Get timeout configuration
  getTimeouts(): TimeoutConfig {
    return { ...this.timeouts };
  }

  // Update timeout configuration
  updateTimeouts(newTimeouts: Partial<TimeoutConfig>): void {
    this.timeouts = { ...this.timeouts, ...newTimeouts };
  }

  // Get specific timeout value
  getTimeout(type: keyof TimeoutConfig): number {
    return this.timeouts[type];
  }

  // Check if operation is timed out
  isTimedOut(operation: string): boolean {
    return this.timers.has(operation);
  }

  // Get remaining time for an operation
  getRemainingTime(operation: string): number {
    // This is a simplified implementation
    // In a real implementation, you'd track the start time
    return this.timeouts.connection;
  }

  // Format timeout duration for display
  formatTimeout(duration: number): string {
    if (duration < 1000) {
      return `${duration}ms`;
    } else if (duration < 60000) {
      return `${Math.round(duration / 1000)}s`;
    } else {
      return `${Math.round(duration / 60000)}m`;
    }
  }

  // Get estimated time for operation
  getEstimatedTime(operation: string): string {
    const timeouts: Record<string, number> = {
      'connection': this.timeouts.connection,
      'transaction': this.timeouts.transaction,
      'signing': this.timeouts.signing,
      'contractCall': this.timeouts.contractCall,
      'contractRead': this.timeouts.contractRead,
      'gasEstimation': this.timeouts.gasEstimation
    };

    const timeout = timeouts[operation] || this.timeouts.connection;
    return this.formatTimeout(timeout);
  }

  // Create a progress tracker for long operations
  createProgressTracker(operation: string, timeout: number) {
    const startTime = Date.now();
    const endTime = startTime + timeout;

    return {
      getProgress: () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min((elapsed / timeout) * 100, 100);
        return Math.round(progress);
      },
      getRemaining: () => {
        const now = Date.now();
        const remaining = Math.max(endTime - now, 0);
        return remaining;
      },
      isExpired: () => {
        return Date.now() >= endTime;
      }
    };
  }
}

// Utility functions for common timeout operations
export const TimeoutUtils = {
  // Sleep for a specified duration
  sleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Retry operation with timeout
  retryWithTimeout: async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    timeout: number = 30000,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const timeoutManager = new TimeoutManager({ connection: timeout });
        return await timeoutManager.waitForUserInteraction(
          `retry-${i}`,
          operation(),
          'connection'
        );
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await TimeoutUtils.sleep(delay);
        }
      }
    }

    throw lastError!;
  },

  // Debounce function with timeout
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Throttle function with timeout
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }
}; 