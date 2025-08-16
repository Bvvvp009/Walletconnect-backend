import { SignClient } from '@walletconnect/sign-client';
import { 
  createPublicClient, 
  http, 
  Address, 
  Hex,
  encodeFunctionData,
  decodeFunctionData
} from 'viem';
import { mainnet } from 'viem/chains';
import * as qrcode from 'qrcode';

import {
  WalletConnectSDKConfig,
  UserSession,
  ConnectionRequest,
  ConnectionResponse,
  TransactionRequest,
  TransactionResponse,
  SignMessageRequest,
  SignTypedDataRequest,
  SignResponse,
  WalletConnectEvent,
  Logger,
  StorageAdapter,
  DatabaseAdapter,
  WalletConnectSDKError,
  ErrorCodes,
  SDKOptions,
  ContractCallRequest,
  ContractCallResponse,
  ContractReadRequest,
  ContractReadResponse,
  FunctionEncodeRequest,
  FunctionEncodeResponse,
  FunctionDecodeRequest,
  FunctionDecodeResponse,
  TimeoutConfig,
  WalletDeepLink,
  WalletMetadata
} from '../types';
import { WalletRegistry } from '../utils/WalletRegistry';
import { TimeoutManager, TimeoutError } from '../utils/TimeoutManager';

// Simple Event Bus Implementation
class EventBus {
  private handlers: Map<string, ((event: WalletConnectEvent) => void)[]> = new Map();

  on(event: string, handler: (event: WalletConnectEvent) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: (event: WalletConnectEvent) => void): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: WalletConnectEvent): void {
    const handlers = this.handlers.get(event.type) || [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }
  }
}

// Simple Logger Implementation
class DefaultLogger implements Logger {
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  constructor(logLevel?: 'debug' | 'info' | 'warn' | 'error') {
    if (logLevel) {
      this.logLevel = logLevel;
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.logLevel === 'debug') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (['debug', 'info'].includes(this.logLevel)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (['debug', 'info', 'warn'].includes(this.logLevel)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }
}

// Simple Memory Storage Implementation
class MemoryStorage implements StorageAdapter {
  private storage: Map<string, any> = new Map();

  async getItem<T = string>(key: string): Promise<T | undefined> {
    return this.storage.get(key);
  }

  async setItem<T = string>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async getKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async getEntries<T = string>(): Promise<[string, T][]> {
    return Array.from(this.storage.entries());
  }
}

// Simple Database Implementation
class SimpleDatabase implements DatabaseAdapter {
  private sessions: Map<string, UserSession> = new Map();
  private isConnectedFlag = false;

  async connect(): Promise<void> {
    this.isConnectedFlag = true;
  }

  async disconnect(): Promise<void> {
    this.isConnectedFlag = false;
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  async saveSession(session: UserSession): Promise<void> {
    this.sessions.set(session.userId, session);
  }

  async getSession(userId: string): Promise<UserSession | null> {
    return this.sessions.get(userId) || null;
  }

  async getAllSessions(): Promise<UserSession[]> {
    return Array.from(this.sessions.values());
  }

  async updateSession(userId: string, updates: Partial<UserSession>): Promise<void> {
    const session = this.sessions.get(userId);
    if (session) {
      Object.assign(session, updates);
      this.sessions.set(userId, session);
    }
  }

  async deleteSession(userId: string): Promise<void> {
    this.sessions.delete(userId);
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [userId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > maxAge) {
        this.sessions.delete(userId);
      }
    }
  }

  async getHealth(): Promise<any> {
    return {
      isConnected: this.isConnectedFlag,
      totalSessions: this.sessions.size,
      timestamp: new Date()
    };
  }

  on(_event: string, _callback: (event: any) => void): void {}
  off(_event: string, _callback: (event: any) => void): void {}
  backup(): Promise<string> { return Promise.resolve(''); }
  restore(_backup: string): Promise<void> { return Promise.resolve(); }
  migrate(): Promise<void> { return Promise.resolve(); }
}

export class WalletConnectSDK {
  private config: WalletConnectSDKConfig;
  private logger: Logger;
  private storage: StorageAdapter;
  private database: DatabaseAdapter;
  private eventBus: EventBus;
  private userSessions: Map<string, UserSession> = new Map();
  private cleanupInterval?: NodeJS.Timeout;
  private isInitialized = false;
  private timeoutManager: TimeoutManager;
  private walletRegistry: WalletRegistry;

  constructor(options: SDKOptions) {
    this.config = {
      projectId: options.projectId,
      relayUrl: options.relayUrl || 'wss://relay.walletconnect.com',
      metadata: options.metadata || {
        name: 'WalletConnect Backend SDK',
        description: 'A comprehensive WalletConnect SDK for backend implementations',
        url: 'https://walletconnect.com',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      }
    };

    this.logger = options.logger || new DefaultLogger();
    this.storage = options.storage || new MemoryStorage();
    this.eventBus = new EventBus();
    this.database = options.database ? new SimpleDatabase() : new SimpleDatabase();
    this.timeoutManager = new TimeoutManager(options.timeouts);
    this.walletRegistry = new WalletRegistry();

    // Set up cleanup interval
    if (options.cleanupInterval) {
      this.cleanupInterval = setInterval(
        () => this.cleanupSessions(),
        options.cleanupInterval
      );
    }
  }

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.logger.info('Initializing WalletConnect SDK...');
      
      // Initialize database
      await this.database.connect();
      
      // Restore existing sessions
      await this.restoreSessions();
      
      this.isInitialized = true;
      this.logger.info('WalletConnect SDK initialized successfully');
      
      this.eventBus.emit({
        type: 'info',
        timestamp: new Date(),
        data: {
          message: 'WalletConnect SDK initialized successfully',
          context: 'init'
        }
      });
    } catch (error) {
      this.logger.error('Failed to initialize WalletConnect SDK:', error);
      throw new WalletConnectSDKError(
        'Failed to initialize SDK',
        ErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  async connect(request: ConnectionRequest): Promise<ConnectionResponse> {
    try {
      this.logger.info(`Connecting user ${request.userId}...`);
      
      // Check if user already has an active session
      const existingSession = this.userSessions.get(request.userId);
      if (existingSession && this.validateSession(existingSession)) {
        this.logger.info(`User ${request.userId} already has an active session`);
        return {
          success: true,
          topic: existingSession.topic || '',
          uri: '',
          timeout: this.timeoutManager.getTimeout('connection'),
          estimatedTime: this.timeoutManager.getTimeout('connection')
        };
      }

      // Create new WalletConnect client
      const wcClient = await this.createWalletConnectClient(request.userId);
      
      // Create connection URI using WalletConnect v2 API
      const { uri } = await wcClient.connect({
        requiredNamespaces: {
          eip155: {
            methods: request.methods || [
              'eth_sendTransaction',
              'eth_signTransaction',
              'eth_sign',
              'personal_sign',
              'eth_signTypedData'
            ],
            chains: request.chainId ? [`eip155:${request.chainId}`] : ['eip155:1'],
            events: request.events || ['chainChanged', 'accountsChanged']
          }
        }
      });

      // Validate URI before generating QR code
      if (!uri || typeof uri !== 'string' || uri.trim() === '') {
        throw new WalletConnectSDKError(
          'Invalid connection URI received from WalletConnect',
          ErrorCodes.UNKNOWN_ERROR
        );
      }

      this.logger.info(`Generated URI for user ${request.userId}: ${uri.substring(0, 50)}...`);

      // Generate QR code
      const qrCode = await this.generateQRCode(uri);

      // Generate deep links for all supported wallets
      const deepLinks = WalletRegistry.generateDeepLinks(uri);

      // Create user session
      const session: UserSession = {
        userId: request.userId,
        wcClient,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActivity: new Date()
      };

      // Store session
      this.userSessions.set(request.userId, session);
      await this.database.saveSession(session);

      this.logger.info(`Connection request created for user ${request.userId}`);
      
      this.eventBus.emit({
        type: 'session_connect',
        timestamp: new Date(),
        userId: request.userId,
        sessionId: request.userId,
        data: {
          topic: uri,
          address: '',
          chainId: request.chainId || 1,
          namespace: 'eip155',
          deepLinks: deepLinks.length
        }
      });

      return {
        success: true,
        uri,
        qrCode,
        topic: uri,
        deepLinks,
        timeout: this.timeoutManager.getTimeout('connection'),
        estimatedTime: this.timeoutManager.getTimeout('connection')
      };
    } catch (error) {
      this.logger.error(`Failed to connect user ${request.userId}:`, error);
      
      this.eventBus.emit({
        type: 'error',
        timestamp: new Date(),
        userId: request.userId,
        error: error as Error,
        data: {
          context: 'connect'
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async disconnect(userId: string): Promise<boolean> {
    try {
      this.logger.info(`Disconnecting user ${userId}...`);
      
      const session = this.userSessions.get(userId);
      if (!session) {
        this.logger.warn(`No session found for user ${userId}`);
        return false;
      }

      // Disconnect WalletConnect client
      if (session.topic) {
        await session.wcClient.disconnect({
          topic: session.topic,
          reason: {
            code: 6000,
            message: 'User disconnected'
          }
        });
      }

      // Remove session
      this.userSessions.delete(userId);
      await this.database.deleteSession(userId);

      this.logger.info(`User ${userId} disconnected successfully`);
      
      this.eventBus.emit({
        type: 'session_disconnect',
        timestamp: new Date(),
        userId,
        sessionId: userId,
        data: {
          topic: session.topic || '',
          reason: 'User disconnected'
        }
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to disconnect user ${userId}:`, error);
      return false;
    }
  }

  async isConnected(userId: string): Promise<boolean> {
    const session = this.userSessions.get(userId);
    return session ? this.validateSession(session) : false;
  }

  async getSession(userId: string): Promise<UserSession | null> {
    const session = this.userSessions.get(userId);
    return session && this.validateSession(session) ? session : null;
  }

  async getAllSessions(): Promise<UserSession[]> {
    const sessions: UserSession[] = [];
    for (const session of this.userSessions.values()) {
      if (this.validateSession(session)) {
        sessions.push(session);
      }
    }
    return sessions;
  }

  async sendTransaction(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      this.logger.info(`Sending transaction for user ${request.userId}...`);
      
      const session = await this.getSession(request.userId);
      if (!session || !session.topic) {
        throw new WalletConnectSDKError(
          'User not connected',
          ErrorCodes.SESSION_NOT_FOUND
        );
      }

      // Create transaction request
      const transaction: any = {
        to: request.to,
        data: request.data,
        value: request.value,
        gas: request.gas,
        maxFeePerGas: request.maxFeePerGas,
        maxPriorityFeePerGas: request.maxPriorityFeePerGas,
        nonce: request.nonce
      };

      // Send transaction through WalletConnect
      const result = await session.wcClient.request({
        topic: session.topic,
        chainId: `eip155:${request.chainId || 1}`,
        request: {
          method: 'eth_sendTransaction',
          params: [transaction]
        }
      });

      const hash = result as Hex;
      
      this.logger.info(`Transaction sent successfully for user ${request.userId}: ${hash}`);
      
      this.eventBus.emit({
        type: 'transaction_response',
        timestamp: new Date(),
        userId: request.userId,
        data: {
          success: true,
          hash,
          receipt: null
        }
      });

      return {
        success: true,
        hash
      };
    } catch (error) {
      this.logger.error(`Failed to send transaction for user ${request.userId}:`, error);
      
      this.eventBus.emit({
        type: 'transaction_response',
        timestamp: new Date(),
        userId: request.userId,
        data: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async signMessage(request: SignMessageRequest): Promise<SignResponse> {
    try {
      this.logger.info(`Signing message for user ${request.userId}...`);
      
      const session = await this.getSession(request.userId);
      if (!session || !session.topic) {
        throw new WalletConnectSDKError(
          'User not connected',
          ErrorCodes.SESSION_NOT_FOUND
        );
      }

      // Sign message through WalletConnect
      const signature = await session.wcClient.request({
        topic: session.topic,
        chainId: `eip155:1`,
        request: {
          method: 'personal_sign',
          params: [request.message, request.address || session.address]
        }
      });

      this.logger.info(`Message signed successfully for user ${request.userId}`);
      
      this.eventBus.emit({
        type: 'sign_response',
        timestamp: new Date(),
        userId: request.userId,
        data: {
          success: true,
          signature: signature as string
        }
      });

      return {
        success: true,
        signature: signature as string
      };
    } catch (error) {
      this.logger.error(`Failed to sign message for user ${request.userId}:`, error);
      
      this.eventBus.emit({
        type: 'sign_response',
        timestamp: new Date(),
        userId: request.userId,
        data: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async signTypedData(request: SignTypedDataRequest): Promise<SignResponse> {
    try {
      this.logger.info(`Signing typed data for user ${request.userId}...`);
      
      const session = await this.getSession(request.userId);
      if (!session || !session.topic) {
        throw new WalletConnectSDKError(
          'User not connected',
          ErrorCodes.SESSION_NOT_FOUND
        );
      }

      // Sign typed data through WalletConnect
      const signature = await session.wcClient.request({
        topic: session.topic,
        chainId: `eip155:1`,
        request: {
          method: 'eth_signTypedData',
          params: [request.address || session.address, JSON.stringify(request.value)]
        }
      });

      this.logger.info(`Typed data signed successfully for user ${request.userId}`);
      
      this.eventBus.emit({
        type: 'sign_response',
        timestamp: new Date(),
        userId: request.userId,
        data: {
          success: true,
          signature: signature as string
        }
      });

      return {
        success: true,
        signature: signature as string
      };
    } catch (error) {
      this.logger.error(`Failed to sign typed data for user ${request.userId}:`, error);
      
      this.eventBus.emit({
        type: 'sign_response',
        timestamp: new Date(),
        userId: request.userId,
        data: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAccounts(userId: string): Promise<Address[]> {
    try {
      const session = await this.getSession(userId);
      if (!session || !session.topic) {
        return [];
      }

      const accounts = await session.wcClient.request({
        topic: session.topic,
        chainId: `eip155:1`,
        request: {
          method: 'eth_accounts',
          params: []
        }
      });

      return accounts as Address[];
    } catch (error) {
      this.logger.error(`Failed to get accounts for user ${userId}:`, error);
      return [];
    }
  }

  async getBalance(userId: string, address?: Address): Promise<bigint> {
    try {
      const session = await this.getSession(userId);
      if (!session) {
        return 0n;
      }

      const targetAddress = address || session.address;
      if (!targetAddress) {
        return 0n;
      }

      // Create public client for balance checking
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http()
      });

      const balance = await publicClient.getBalance({ address: targetAddress });
      return balance;
    } catch (error) {
      this.logger.error(`Failed to get balance for user ${userId}:`, error);
      return 0n;
    }
  }

  // Contract Interaction Methods
  async callContract(request: ContractCallRequest): Promise<ContractCallResponse> {
    try {
      this.logger.info(`Calling contract function ${request.functionName} for user ${request.userId}...`);
      
      const session = await this.getSession(request.userId);
      if (!session || !session.topic) {
        throw new WalletConnectSDKError(
          'User not connected',
          ErrorCodes.SESSION_NOT_FOUND
        );
      }

      // Encode function data
      const encodedData = encodeFunctionData({
        abi: request.contract.abi,
        functionName: request.functionName,
        args: request.args || []
      });

      // Create transaction request
      const transaction: any = {
        to: request.contract.address,
        data: encodedData,
        value: request.value || 0n,
        gas: request.gas,
        maxFeePerGas: request.maxFeePerGas,
        maxPriorityFeePerGas: request.maxPriorityFeePerGas,
        nonce: request.nonce
      };

      // Send transaction through WalletConnect
      const result = await session.wcClient.request({
        topic: session.topic,
        chainId: `eip155:${request.contract.chainId || 1}`,
        request: {
          method: 'eth_sendTransaction',
          params: [transaction]
        }
      });

      const hash = result as Hex;
      
      this.logger.info(`Contract call successful for user ${request.userId}: ${hash}`);
      
      this.eventBus.emit({
        type: 'transaction_response',
        timestamp: new Date(),
        userId: request.userId,
        data: {
          success: true,
          hash,
          functionName: request.functionName,
          contractAddress: request.contract.address
        }
      });

      return {
        success: true,
        hash
      };
    } catch (error) {
      this.logger.error(`Failed to call contract for user ${request.userId}:`, error);
      
      this.eventBus.emit({
        type: 'transaction_response',
        timestamp: new Date(),
        userId: request.userId,
        data: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          functionName: request.functionName,
          contractAddress: request.contract.address
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async readContract(request: ContractReadRequest): Promise<ContractReadResponse> {
    try {
      this.logger.info(`Reading contract function ${request.functionName} for user ${request.userId}...`);
      
      const session = await this.getSession(request.userId);
      if (!session || !session.topic) {
        throw new WalletConnectSDKError(
          'User not connected',
          ErrorCodes.SESSION_NOT_FOUND
        );
      }

      // Encode function data
      const encodedData = encodeFunctionData({
        abi: request.contract.abi,
        functionName: request.functionName,
        args: request.args || []
      });

      // Call contract through WalletConnect
      const result = await session.wcClient.request({
        topic: session.topic,
        chainId: `eip155:${request.contract.chainId || 1}`,
        request: {
          method: 'eth_call',
          params: [
            {
              to: request.contract.address,
              data: encodedData
            },
            request.blockNumber ? `0x${request.blockNumber.toString(16)}` : 'latest'
          ]
        }
      });

      // Decode the result
      const decodedData = decodeFunctionData({
        abi: request.contract.abi,
        data: result as Hex
      });

      this.logger.info(`Contract read successful for user ${request.userId}`);
      
      return {
        success: true,
        data: decodedData
      };
    } catch (error) {
      this.logger.error(`Failed to read contract for user ${request.userId}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async encodeFunction(request: FunctionEncodeRequest): Promise<FunctionEncodeResponse> {
    try {
      this.logger.info(`Encoding function ${request.functionName}...`);
      
      const encodedData = encodeFunctionData({
        abi: request.contract.abi,
        functionName: request.functionName,
        args: request.args || []
      });

      this.logger.info(`Function encoded successfully: ${encodedData}`);
      
      return {
        success: true,
        data: encodedData
      };
    } catch (error) {
      this.logger.error(`Failed to encode function ${request.functionName}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async decodeFunction(request: FunctionDecodeRequest): Promise<FunctionDecodeResponse> {
    try {
      this.logger.info(`Decoding function ${request.functionName}...`);
      
      const decodedData = decodeFunctionData({
        abi: request.contract.abi,
        data: request.data
      });

      this.logger.info(`Function decoded successfully`);
      
      return {
        success: true,
        args: Array.isArray(decodedData) ? decodedData : [decodedData]
      };
    } catch (error) {
      this.logger.error(`Failed to decode function ${request.functionName}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async estimateGas(request: ContractCallRequest): Promise<{ success: boolean; gas?: bigint; error?: string }> {
    try {
      this.logger.info(`Estimating gas for function ${request.functionName}...`);
      
      const session = await this.getSession(request.userId);
      if (!session || !session.topic) {
        throw new WalletConnectSDKError(
          'User not connected',
          ErrorCodes.SESSION_NOT_FOUND
        );
      }

      // Encode function data
      const encodedData = encodeFunctionData({
        abi: request.contract.abi,
        functionName: request.functionName,
        args: request.args || []
      });

      // Estimate gas through WalletConnect with timeout
      const result = await this.timeoutManager.waitForGasEstimation(
        `gas-estimation-${request.userId}`,
        session.wcClient.request({
          topic: session.topic,
          chainId: `eip155:${request.contract.chainId || 1}`,
          request: {
            method: 'eth_estimateGas',
            params: [
              {
                to: request.contract.address,
                data: encodedData,
                value: request.value || 0n
              }
            ]
          }
        })
      );

      const gas = BigInt(result as string);
      
      this.logger.info(`Gas estimated successfully: ${gas}`);
      
      return {
        success: true,
        gas
      };
    } catch (error) {
      this.logger.error(`Failed to estimate gas for function ${request.functionName}:`, error);
      
      if (error instanceof TimeoutError) {
        return {
          success: false,
          error: `Gas estimation timed out after ${this.timeoutManager.formatTimeout(error.timeout)}`
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Wallet-related methods
  async getSupportedWallets(chain?: string): Promise<WalletMetadata[]> {
    if (chain) {
      return WalletRegistry.getWalletsByChain(chain);
    }
    return WalletRegistry.getAllWallets();
  }

  async getRecommendedWallets(chain: string): Promise<WalletMetadata[]> {
    return WalletRegistry.getRecommendedWallets(chain);
  }

  async getWalletDeepLinks(uri: string): Promise<WalletDeepLink[]> {
    return WalletRegistry.generateDeepLinks(uri);
  }

  async getWalletInfo(walletName: string): Promise<WalletMetadata | undefined> {
    return WalletRegistry.getWallet(walletName);
  }

  async checkWalletSupport(walletName: string, method: string): Promise<boolean> {
    return WalletRegistry.supportsMethod(walletName, method);
  }

  async getTimeoutConfig(): Promise<TimeoutConfig> {
    return this.timeoutManager.getTimeouts();
  }

  async updateTimeoutConfig(newTimeouts: Partial<TimeoutConfig>): Promise<void> {
    this.timeoutManager.updateTimeouts(newTimeouts);
  }

  async getEstimatedTime(operation: string): Promise<string> {
    return this.timeoutManager.getEstimatedTime(operation);
  }

  async createProgressTracker(operation: string, timeout: number) {
    return this.timeoutManager.createProgressTracker(operation, timeout);
  }

  // Clear all timers
  async clearAllTimers(): Promise<void> {
    this.timeoutManager.clearAllTimers();
  }

  // Clear specific timer
  async clearTimer(operation: string): Promise<void> {
    this.timeoutManager.clearTimer(operation);
  }

  async generateQRCode(uri: string): Promise<string> {
    try {
      // Validate URI before generating QR code
      if (!uri || typeof uri !== 'string' || uri.trim() === '') {
        throw new Error('Invalid URI provided for QR code generation');
      }

      // Check if URI starts with 'wc:' (WalletConnect URI format)
      if (!uri.startsWith('wc:')) {
        this.logger.warn(`URI does not start with 'wc:': ${uri.substring(0, 100)}...`);
      }

      this.logger.debug(`Generating QR code for URI: ${uri.substring(0, 50)}...`);
      
      const qrCode = await qrcode.toDataURL(uri);
      
      if (!qrCode || typeof qrCode !== 'string') {
        throw new Error('QR code generation returned invalid result');
      }

      this.logger.debug('QR code generated successfully');
      return qrCode;
    } catch (error) {
      this.logger.error('Failed to generate QR code:', error);
      this.logger.error('URI that failed:', uri ? uri.substring(0, 100) : 'undefined');
      throw new WalletConnectSDKError(
        'Failed to generate QR code',
        ErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  validateSession(session: UserSession): boolean {
    if (!session.isActive) {
      return false;
    }

    // Check if session has a topic (indicates it's been established)
    if (!session.topic) {
      return false;
    }

    // Check if session has expired (24 hours)
    const now = new Date();
    const sessionAge = now.getTime() - session.lastActivity.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
      session.isActive = false;
      return false;
    }

    return true;
  }

  on(event: string, callback: (event: WalletConnectEvent) => void): void {
    this.eventBus.on(event, callback);
  }

  off(event: string, callback: (event: WalletConnectEvent) => void): void {
    this.eventBus.off(event, callback);
  }

  async cleanupSessions(): Promise<void> {
    try {
      this.logger.info('Cleaning up expired sessions...');
      
      const expiredSessions: string[] = [];
      
      for (const [userId, session] of this.userSessions.entries()) {
        if (!this.validateSession(session)) {
          expiredSessions.push(userId);
        }
      }

      for (const userId of expiredSessions) {
        await this.disconnect(userId);
      }

      this.logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
    } catch (error) {
      this.logger.error('Failed to cleanup sessions:', error);
    }
  }

  async destroy(): Promise<void> {
    try {
      this.logger.info('Destroying WalletConnect SDK...');
      
      // Clear cleanup interval
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      // Disconnect all sessions
      for (const [userId] of this.userSessions.entries()) {
        await this.disconnect(userId);
      }

      // Disconnect database
      await this.database.disconnect();

      this.isInitialized = false;
      this.logger.info('WalletConnect SDK destroyed successfully');
    } catch (error) {
      this.logger.error('Failed to destroy SDK:', error);
    }
  }

  // Private methods
  private async createWalletConnectClient(_userId: string): Promise<any> {
    try {
      this.logger.debug('Creating WalletConnect client...');
      
      if (!this.config.projectId) {
        throw new Error('Project ID is required for WalletConnect client initialization');
      }

      const client = await SignClient.init({
        projectId: this.config.projectId,
        relayUrl: this.config.relayUrl || 'wss://relay.walletconnect.com',
        metadata: this.config.metadata!,
        storage: this.storage
      });

      this.logger.debug('WalletConnect client created successfully');

      // Set up event listeners
      client.on('session_connect', (args: any) => {
        this.logger.info(`Session connected for topic ${args.topic}`);
        
        // Find session by checking all sessions since topic might not match initially
        let session: UserSession | undefined;
        for (const [userId, userSession] of this.userSessions.entries()) {
          if (userSession.wcClient === client) {
            session = userSession;
            break;
          }
        }
        
        if (session) {
          // Update session with connection details
          session.topic = args.topic;
          session.isActive = true;
          session.sessionData = args.params as any;
          session.updatedAt = new Date();
          session.lastActivity = new Date();
          
          // Get accounts from the session
          const accounts = args.params?.namespaces?.eip155?.accounts || [];
          if (accounts.length > 0) {
            session.address = accounts[0].split(':')[2] as Address;
          }
          
          this.logger.info(`User ${session.userId} connected successfully with address: ${session.address}`);
          
          // Clear the connection timer since user has connected
          this.clearTimer(`connection-${session.userId}`).catch(err => 
            this.logger.warn(`Failed to clear timer for user ${session.userId}:`, err)
          );
          
          this.eventBus.emit({
            type: 'session_connect',
            timestamp: new Date(),
            userId: session.userId,
            sessionId: session.userId,
            data: {
              topic: args.topic,
              address: session.address || '',
              chainId: 1,
              namespace: 'eip155',
              accounts: accounts
            }
          });
        } else {
          this.logger.warn(`No session found for connected client with topic ${args.topic}`);
        }
      });

      client.on('session_event', (args: any) => {
        this.logger.info(`Session event for topic ${args.topic}:`, args.event);
        
        const session = this.findSessionByTopic(args.topic);
        if (session) {
          this.eventBus.emit({
            type: 'session_event',
            timestamp: new Date(),
            userId: session.userId,
            sessionId: session.userId,
            data: {
              topic: args.topic,
              eventName: args.event?.name,
              eventData: args.event?.data
            }
          });
        }
      });

      client.on('session_update', (args: any) => {
        this.logger.info(`Session updated for topic ${args.topic}`);
        
        const session = this.findSessionByTopic(args.topic);
        if (session) {
          session.sessionData = args.params as any;
          session.updatedAt = new Date();
          session.lastActivity = new Date();
          
          this.eventBus.emit({
            type: 'session_update',
            timestamp: new Date(),
            userId: session.userId,
            sessionId: session.userId,
            data: {
              topic: args.topic,
              updates: { sessionData: args.params }
            }
          });
        }
      });

      client.on('session_delete', (args: any) => {
        this.logger.info(`Session deleted for topic ${args.topic}`);
        
        const session = this.findSessionByTopic(args.topic);
        if (session) {
          this.eventBus.emit({
            type: 'session_disconnect',
            timestamp: new Date(),
            userId: session.userId,
            sessionId: session.userId,
            data: {
              topic: args.topic,
              reason: 'Session deleted'
            }
          });
        }
      });

      return client;
    } catch (error) {
      this.logger.error('Failed to create WalletConnect client:', error);
      throw new WalletConnectSDKError(
        'Failed to create WalletConnect client',
        ErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  private findSessionByTopic(topic: string): UserSession | undefined {
    for (const session of this.userSessions.values()) {
      if (session.topic === topic) {
        return session;
      }
    }
    return undefined;
  }

  private async restoreSessions(): Promise<void> {
    try {
      const sessions = await this.database.getAllSessions();
      
      for (const session of sessions) {
        if (this.validateSession(session)) {
          // Recreate WalletConnect client
          const wcClient = await this.createWalletConnectClient(session.userId);
          session.wcClient = wcClient;
          session.isActive = true;
          
          this.userSessions.set(session.userId, session);
          this.logger.info(`Restored session for user ${session.userId}`);
        }
      }
      
      this.logger.info(`Restored ${sessions.length} sessions`);
    } catch (error) {
      this.logger.error('Failed to restore sessions:', error);
    }
  }
} 