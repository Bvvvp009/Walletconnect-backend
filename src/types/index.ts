// import { SignClient } from '@walletconnect/sign-client';
import { SessionTypes } from '@walletconnect/types';
import { Address, Hex } from 'viem';

// Core SDK Types
export interface WalletConnectSDKConfig {
  projectId: string;
  relayUrl?: string;
  metadata?: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  storage?: StorageAdapter;
  logger?: Logger;
}

export interface StorageAdapter {
  getItem<T = string>(key: string): Promise<T | undefined>;
  setItem<T = string>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  getKeys(): Promise<string[]>;
  getEntries<T = string>(): Promise<[string, T][]>;
}

export interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

// Session Management Types
export interface UserSession {
  userId: string;
  wcClient: any; // SignClient type
  topic?: string;
  address?: Address;
  sessionData?: SessionTypes.Struct;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}

export interface SessionInfo {
  userId: string;
  topic: string;
  address: Address;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
  chainId: number;
  namespace: string;
}

// Connection Types
export interface ConnectionRequest {
  userId: string;
  chainId?: number;
  namespace?: string;
  methods?: string[];
  events?: string[];
  optionalMethods?: string[];
  optionalEvents?: string[];
}

export interface ConnectionResponse {
  success: boolean;
  uri?: string;
  qrCode?: string;
  topic?: string;
  error?: string;
  deepLinks?: WalletDeepLink[];
  timeout?: number;
  estimatedTime?: number;
}

// Transaction Types
export interface TransactionRequest {
  userId: string;
  to: Address;
  data?: Hex;
  value?: bigint;
  gas?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  chainId?: number;
}

export interface TransactionResponse {
  success: boolean;
  hash?: Hex;
  error?: string;
  receipt?: any;
}

// Signing Types
export interface SignMessageRequest {
  userId: string;
  message: string;
  address?: Address;
}

export interface SignTypedDataRequest {
  userId: string;
  domain: any;
  types: any;
  value: any;
  primaryType: string;
  address?: Address;
}

export interface SignResponse {
  success: boolean;
  signature?: string;
  error?: string;
}

// Event Types
export interface WalletConnectEvent {
  type: 'session_connect' | 'session_disconnect' | 'session_update' | 'session_expire' | 'session_ping' | 'session_event' | 'transaction_response' | 'sign_response' | 'info' | 'error';
  topic?: string;
  userId?: string;
  sessionId?: string;
  error?: Error;
  data?: any;
  timestamp: Date;
}

// Database Types
export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'memory';
  connectionString?: string;
  options?: Record<string, any>;
}

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  saveSession(session: UserSession): Promise<void>;
  getSession(userId: string): Promise<UserSession | null>;
  getAllSessions(): Promise<UserSession[]>;
  updateSession(userId: string, updates: Partial<UserSession>): Promise<void>;
  deleteSession(userId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
  isConnected(): boolean;
}

// Chain and Network Types
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface NetworkConfig {
  chains: ChainConfig[];
  defaultChainId: number;
}

// Error Types
export class WalletConnectSDKError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'WalletConnectSDKError';
  }
}

export enum ErrorCodes {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SIGNATURE_FAILED = 'SIGNATURE_FAILED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Method Types
export interface WalletConnectMethods {
  // Connection
  connect(request: ConnectionRequest): Promise<ConnectionResponse>;
  disconnect(userId: string): Promise<boolean>;
  isConnected(userId: string): Promise<boolean>;
  
  // Session Management
  getSession(userId: string): Promise<UserSession | null>;
  getAllSessions(): Promise<UserSession[]>;
  refreshSession(userId: string): Promise<boolean>;
  cleanupSessions(): Promise<void>;
  
  // Transactions
  sendTransaction(request: TransactionRequest): Promise<TransactionResponse>;
  signMessage(request: SignMessageRequest): Promise<SignResponse>;
  signTypedData(request: SignTypedDataRequest): Promise<SignResponse>;
  
  // Account Info
  getAccounts(userId: string): Promise<Address[]>;
  getBalance(userId: string, address?: Address): Promise<bigint>;
  
  // Events
  on(event: string, callback: (event: WalletConnectEvent) => void): void;
  off(event: string, callback: (event: WalletConnectEvent) => void): void;
  
  // Utilities
  generateQRCode(uri: string): Promise<string>;
  validateSession(session: UserSession): boolean;
}

// Configuration Types
export interface SDKOptions {
  projectId: string;
  relayUrl?: string;
  metadata?: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  storage?: StorageAdapter;
  database?: DatabaseConfig;
  logger?: Logger;
  network?: NetworkConfig;
  sessionTimeout?: number;
  cleanupInterval?: number;
  maxSessions?: number;
  timeouts?: Partial<TimeoutConfig>;
  supportedWallets?: string[];
  defaultWallet?: string;
}

// Export all types
// Note: These modules are defined in separate files but may not exist yet
// export * from './database';
// export * from './storage';
// export * from './events'; 

// Contract Interaction Types
export interface ContractConfig {
  address: Address;
  abi: any[];
  chainId?: number;
}

export interface ContractCallRequest {
  userId: string;
  contract: ContractConfig;
  functionName: string;
  args?: any[];
  value?: bigint;
  gas?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
}

export interface ContractCallResponse {
  success: boolean;
  data?: any;
  hash?: Hex;
  error?: string;
  receipt?: any;
}

export interface ContractReadRequest {
  userId: string;
  contract: ContractConfig;
  functionName: string;
  args?: any[];
  blockNumber?: bigint;
}

export interface ContractReadResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface FunctionEncodeRequest {
  contract: ContractConfig;
  functionName: string;
  args?: any[];
}

export interface FunctionEncodeResponse {
  success: boolean;
  data?: Hex;
  error?: string;
}

export interface FunctionDecodeRequest {
  contract: ContractConfig;
  functionName: string;
  data: Hex;
}

export interface FunctionDecodeResponse {
  success: boolean;
  args?: any[];
  error?: string;
} 

// Wallet Deep Links and Metadata
export interface WalletMetadata {
  name: string;
  shortName: string;
  description: string;
  url: string;
  icons: string[];
  deepLinks: {
    universal?: string;
    native?: string;
    web?: string;
  };
  chains: string[];
  features: string[];
  supportedMethods: string[];
  supportedEvents: string[];
}

export interface WalletDeepLink {
  wallet: string;
  universal: string;
  native: string;
  web: string;
  qrCode?: string;
}

// Timeout Configuration
export interface TimeoutConfig {
  connection: number; // Connection timeout in milliseconds
  transaction: number; // Transaction timeout in milliseconds
  signing: number; // Signing timeout in milliseconds
  contractCall: number; // Contract call timeout in milliseconds
  contractRead: number; // Contract read timeout in milliseconds
  gasEstimation: number; // Gas estimation timeout in milliseconds
  sessionExpiry: number; // Session expiry timeout in milliseconds
  cleanup: number; // Cleanup interval in milliseconds
} 