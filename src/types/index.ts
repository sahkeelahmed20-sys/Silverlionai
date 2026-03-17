// User & Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  isSubscribed: boolean;
  subscriptionTier?: 'starter' | 'pro' | 'enterprise';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Crypto Market Data Types
export interface CryptoPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdate: number;
}

export interface OrderBook {
  symbol: string;
  bids: [string, string][]; // [price, quantity]
  asks: [string, string][];
  lastUpdateId: number;
}

export interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

// AI Trading Signal Types
export type SignalType = 'BUY' | 'SELL' | 'HOLD';
export type SignalStrength = 'STRONG' | 'MODERATE' | 'WEAK';

export interface TradingSignal {
  id: string;
  symbol: string;
  type: SignalType;
  strength: SignalStrength;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  timestamp: Date;
  timeframe: string;
  indicators: {
    rsi?: number;
    macd?: number;
    ema20?: number;
    ema50?: number;
    bbUpper?: number;
    bbLower?: number;
  };
  pattern?: string;
  reasoning: string;
}

// Paper Trading Types
export interface PaperTrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: number;
  pnl?: number;
  pnlPercent?: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: Date;
  closedAt?: Date;
}

export interface PaperTradingAccount {
  balance: number;
  initialBalance: number;
  totalPnl: number;
  totalPnlPercent: number;
  openPositions: PaperTrade[];
  tradeHistory: PaperTrade[];
}

// AI Agent Types
export type AgentType = 'RiskManager' | 'Strategist' | 'Analyst' | 'Executor' | 'Learner';
export type AgentStatus = 'idle' | 'analyzing' | 'executing' | 'learning' | 'consensus';

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  confidence: number;
  lastAction: string;
  lastActionTime: Date;
  performance: number;
  messageCount: number;
}

export interface AgentMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  message: string;
  timestamp: Date;
  type: 'analysis' | 'signal' | 'risk' | 'execution' | 'consensus';
}

// Risk Management Types
export interface RiskSettings {
  stopLossEnabled: boolean;
  takeProfitEnabled: boolean;
  trailingStopEnabled: boolean;
  maxLeverage: number;
  maxPositionSize: number;
  maxDailyLoss: number;
  riskPerTrade: number;
  autoHedgeEnabled: boolean;
}

// Whale Tracking Types
export interface WhaleTransaction {
  id: string;
  symbol: string;
  from: string;
  to: string;
  amount: number;
  valueUSD: number;
  timestamp: Date;
  txHash: string;
  type: 'inflow' | 'outflow' | 'internal';
}

// Market Analysis Types
export type MarketRegime = 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'CHOPPY' | 'VOLATILE';
export type PatternType = 'HEAD_AND_SHOULDERS' | 'DOUBLE_TOP' | 'DOUBLE_BOTTOM' | 'TRIANGLE' | 'WEDGE' | 'FLAG' | 'CUP_AND_HANDLE' | 'NONE';

export interface MarketAnalysis {
  symbol: string;
  regime: MarketRegime;
  trendStrength: number;
  volatility: number;
  supportLevels: number[];
  resistanceLevels: number[];
  detectedPattern?: PatternType;
  patternConfidence?: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  timestamp: Date;
}

// Backtesting Types
export interface BacktestResult {
  id: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalReturn: number;
  equityCurve: { timestamp: Date; equity: number }[];
}

// AI Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokenAnalysis?: TokenAnalysis;
}

export interface TokenAnalysis {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  support: number[];
  resistance: number[];
  pattern?: string;
  signal?: SignalType;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
}

// Notification Types
export interface NotificationSettings {
  whatsappEnabled: boolean;
  whatsappNumber?: string;
  emailEnabled: boolean;
  email?: string;
  signalNotifications: boolean;
  priceAlerts: boolean;
  whaleAlerts: boolean;
  riskAlerts: boolean;
}

// Dashboard Types
export interface DashboardStats {
  activeSignals: number;
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  aiAccuracy: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
}

// Demo Trading Settings
export interface DemoTradingSettings {
  initialBalance: number;
  defaultLeverage: number;
  tradeAmount: number;
  minSignalAccuracy: number; // Minimum confidence % to execute trade (e.g., 80)
}
