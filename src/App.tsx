import type { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Signals } from '@/pages/Signals';
import { PaperTrading } from '@/pages/PaperTrading';
import { Agents } from '@/pages/Agents';
import { MarketAnalysis } from '@/pages/MarketAnalysis';
import { WhaleTracking } from '@/pages/WhaleTracking';
import { RiskManagement } from '@/pages/RiskManagement';
import { Backtesting } from '@/pages/Backtesting';
import { LiveTrading } from '@/pages/LiveTrading';
import { AdminPanel } from '@/pages/AdminPanel';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';

import { useAuth } from '@/hooks/useAuth';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { useAISignals } from '@/hooks/useAISignals';
import { usePaperTrading } from '@/hooks/usePaperTrading';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useWhaleTracking } from '@/hooks/useWhaleTracking';
import { useMarketAnalysis } from '@/hooks/useMarketAnalysis';

import type { RiskSettings, BacktestResult } from '@/types';
import './App.css';

// Default risk settings
const defaultRiskSettings: RiskSettings = {
  stopLossEnabled: true,
  takeProfitEnabled: true,
  trailingStopEnabled: false,
  maxLeverage: 20,
  maxPositionSize: 50,
  maxDailyLoss: 10,
  riskPerTrade: 2,
  autoHedgeEnabled: false,
};

// Mock backtest results
const mockBacktestResults: BacktestResult[] = [
  {
    id: '1',
    strategyName: 'AI_ML',
    symbol: 'BTCUSDT',
    timeframe: '1h',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    totalTrades: 156,
    winningTrades: 98,
    losingTrades: 58,
    winRate: 62.8,
    profitFactor: 1.85,
    maxDrawdown: 12.5,
    sharpeRatio: 1.92,
    totalReturn: 145.6,
    equityCurve: Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(2024, 0, 1 + i * 3),
      equity: 10000 * (1 + (i / 100) * 1.456 + Math.sin(i / 10) * 0.1),
    })),
  },
];

function App() {
  // Auth
  const { user, isAuthenticated, isLoading, login, register, logout, getAllUsers } = useAuth();

  // WebSocket
  const { prices, klineData, isConnected } = useBinanceWebSocket();

  // Price history for analysis (convert Map values to arrays)
  const priceHistoryMap = (() => {
    const map = new Map<string, number[]>();
    prices.forEach((pair, symbol) => {
      const existing = map.get(symbol) || [];
      existing.push(pair.price);
      if (existing.length > 100) existing.shift();
      map.set(symbol, existing);
    });
    return map;
  })();

  // Paper Trading (must be before AI Signals to get settings)
  const { 
    account, 
    settings: demoSettings,
    openPosition, 
    closePosition, 
    updatePositions, 
    resetAccount, 
    getUnrealizedPnl,
    updateSettings
  } = usePaperTrading();

  // AI Signals - only show 80%+ accuracy signals
  const { signals, currentSignal, refreshSignal } = useAISignals(
    prices, 
    klineData,
    demoSettings.minSignalAccuracy
  );

  // Update positions with current prices
  useEffect(() => {
    const priceMap = new Map<string, number>();
    prices.forEach((pair, symbol) => {
      priceMap.set(symbol, pair.price);
    });
    updatePositions(priceMap);
  }, [prices, updatePositions]);

  // AI Agents
  const { agents, messages, consensusActive, triggerConsensus, evolveStrategy } = useAIAgents();

  // Whale Tracking
  const { transactions, stats } = useWhaleTracking();

  // Market Analysis
  const { analysis } = useMarketAnalysis(priceHistoryMap);

  // Risk Settings
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(defaultRiskSettings);

  // Backtest Results
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>(mockBacktestResults);
  
  // Demo Trading Toggle - persist in localStorage (independent of login)
  const [isDemoTrading, setIsDemoTrading] = useState(() => {
    const saved = localStorage.getItem('silverlion_demo_trading_active');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Live Trading Toggle - persist in localStorage (independent of login)
  const [isLiveTrading, setIsLiveTrading] = useState(() => {
    const saved = localStorage.getItem('silverlion_live_trading_active');
    return saved ? JSON.parse(saved) : false;
  });
  
  const toggleDemoTrading = useCallback(() => {
    setIsDemoTrading((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('silverlion_demo_trading_active', JSON.stringify(newValue));
      return newValue;
    });
  }, []);
  
  const toggleLiveTrading = useCallback(() => {
    setIsLiveTrading((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('silverlion_live_trading_active', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // Auto-trading: Execute trades when demo trading is enabled (runs even when logged out)
  useEffect(() => {
    if (!isDemoTrading) return;
    
    // Check for high-accuracy signals and auto-execute trades
    const interval = setInterval(() => {
      const highAccuracySignals = signals.filter(s => 
        s.confidence >= demoSettings.minSignalAccuracy && 
        s.type !== 'HOLD'
      );
      
      highAccuracySignals.forEach(signal => {
        // Check if we already have a position for this symbol
        const existingPosition = account.openPositions.find(p => p.symbol === signal.symbol);
        if (existingPosition) return;
        
        // Check if we have enough balance
        const pair = prices.get(signal.symbol);
        if (!pair) return;
        
        const tradeValue = demoSettings.tradeAmount;
        const marginRequired = tradeValue / demoSettings.defaultLeverage;
        
        if (account.balance >= marginRequired) {
          const quantity = tradeValue / pair.price;
          openPosition(
            signal.symbol,
            signal.type as 'BUY' | 'SELL',
            quantity,
            pair.price,
            demoSettings.defaultLeverage,
            signal.stopLoss,
            signal.takeProfit
          );
        }
      });
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [isDemoTrading, signals, demoSettings, account.balance, account.openPositions, prices, openPosition]);

  const handleRunBacktest = useCallback((params: {
    symbol: string;
    strategy: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
  }) => {
    // Simulate backtest
    const newResult: BacktestResult = {
      id: Date.now().toString(),
      strategyName: params.strategy,
      symbol: params.symbol,
      timeframe: '1h',
      startDate: new Date(params.startDate),
      endDate: new Date(params.endDate),
      totalTrades: Math.floor(Math.random() * 200) + 50,
      winningTrades: Math.floor(Math.random() * 100) + 30,
      losingTrades: Math.floor(Math.random() * 50) + 10,
      winRate: Math.random() * 30 + 50,
      profitFactor: Math.random() * 1 + 1,
      maxDrawdown: Math.random() * 20 + 5,
      sharpeRatio: Math.random() * 2 + 0.5,
      totalReturn: Math.random() * 200 - 50,
      equityCurve: Array.from({ length: 100 }, (_, i) => ({
        timestamp: new Date(params.startDate),
        equity: params.initialCapital * (1 + (i / 100) * (Math.random() * 2 - 0.5)),
      })),
    };
    
    newResult.losingTrades = newResult.totalTrades - newResult.winningTrades;
    
    setBacktestResults(prev => [newResult, ...prev]);
  }, []);

  // Protected Route wrapper
  const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#151515] flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[#ffdf8d] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return <Layout user={user} onLogout={logout}>{children}</Layout>;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={login} />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Register onRegister={register} />
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard
              prices={prices}
              signals={signals}
              currentSignal={currentSignal}
              klineData={klineData}
              isConnected={isConnected}
              demoSettings={demoSettings}
              isDemoTrading={isDemoTrading}
              onToggleDemoTrading={toggleDemoTrading}
              isLiveTrading={isLiveTrading}
              onToggleLiveTrading={toggleLiveTrading}
              account={account}
            />
          </ProtectedRoute>
        } />

        <Route path="/signals" element={
          <ProtectedRoute>
            <Signals signals={signals} onRefresh={refreshSignal} />
          </ProtectedRoute>
        } />

        <Route path="/paper-trading" element={
          <ProtectedRoute>
            <PaperTrading
              account={account}
              settings={demoSettings}
              prices={prices}
              signals={signals}
              onOpenPosition={openPosition}
              onClosePosition={closePosition}
              onReset={resetAccount}
              onUpdateSettings={updateSettings}
              unrealizedPnl={getUnrealizedPnl()}
            />
          </ProtectedRoute>
        } />

        <Route path="/agents" element={
          <ProtectedRoute>
            <Agents
              agents={agents}
              messages={messages}
              consensusActive={consensusActive}
              onTriggerConsensus={triggerConsensus}
              onEvolveStrategy={evolveStrategy}
            />
          </ProtectedRoute>
        } />

        <Route path="/market" element={
          <ProtectedRoute>
            <MarketAnalysis
              analysis={analysis}
              klineData={klineData}
              prices={prices}
            />
          </ProtectedRoute>
        } />

        <Route path="/whales" element={
          <ProtectedRoute>
            <WhaleTracking transactions={transactions} stats={stats} />
          </ProtectedRoute>
        } />

        <Route path="/risk" element={
          <ProtectedRoute>
            <RiskManagement
              settings={riskSettings}
              onUpdateSettings={(newSettings) => setRiskSettings(prev => ({ ...prev, ...newSettings }))}
            />
          </ProtectedRoute>
        } />

        <Route path="/backtest" element={
          <ProtectedRoute>
            <Backtesting
              results={backtestResults}
              onRunBacktest={handleRunBacktest}
            />
          </ProtectedRoute>
        } />

        <Route path="/live-trading" element={
          <ProtectedRoute>
            <LiveTrading />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPanel users={getAllUsers()} currentUser={user} />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
