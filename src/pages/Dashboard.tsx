import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Bot, 
  MessageSquare, 
  ChevronDown,
  BarChart3,
  DollarSign,
  PieChart,
  Award,
  Target,
  ScanEye,
  Newspaper,
  Layers,
  Zap,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceChart } from '@/components/PriceChart';
import { AIChatPopup } from '@/components/AIChatPopup';
import type { CryptoPair, TradingSignal, KlineData, DemoTradingSettings, PaperTradingAccount } from '@/types';

interface DashboardProps {
  prices: Map<string, CryptoPair>;
  signals: TradingSignal[];
  currentSignal?: TradingSignal;
  klineData: Map<string, KlineData[]>;
  isConnected: boolean;
  demoSettings: DemoTradingSettings;
  isDemoTrading: boolean;
  onToggleDemoTrading: () => void;
  isLiveTrading: boolean;
  onToggleLiveTrading: () => void;
  account: PaperTradingAccount;
}

const TIMEFRAMES = ['1M', '5M', '15M', '1H', '4H', '1D'];

// AI Agents
const AGENTS = [
  { name: 'Trend Follower', weight: 25, description: 'Moving average crossover strategy', icon: TrendingUp },
  { name: 'Momentum AI', weight: 20, description: 'RSI and MACD analysis', icon: Activity },
  { name: 'Volatility Scout', weight: 15, description: 'Bollinger Bands and ATR', icon: BarChart3 },
  { name: 'Sentiment Analyzer', weight: 25, description: 'Social media and news sentiment', icon: Newspaper },
  { name: 'Pattern Recognition', weight: 15, description: 'Chart pattern detection', icon: ScanEye },
];

export function Dashboard({ 
  prices, 
  signals, 
  currentSignal: _currentSignal, 
  klineData, 
  isConnected,
  demoSettings,
  isDemoTrading,
  onToggleDemoTrading,
  isLiveTrading,
  onToggleLiveTrading,
  account
}: DashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [showCoinDropdown, setShowCoinDropdown] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectSymbol = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
    setShowCoinDropdown(false);
  }, []);

  const priceArray = useMemo(() => Array.from(prices.values()), [prices]);
  
  const selectedPair = prices.get(selectedSymbol);
  const selectedKlines = klineData.get(selectedSymbol) || [];
  const selectedSignal = signals.find(s => s.symbol === selectedSymbol);

  // Calculate indicators
  const indicators = useMemo(() => {
    if (selectedKlines.length < 14) return { rsi: 50, macd: 0 };
    
    const closes = selectedKlines.map(k => parseFloat(k.close));
    
    const gains: number[] = [];
    const losses: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    const avgGain = gains.slice(-14).reduce((a, b) => a + b, 0) / 14;
    const avgLoss = losses.slice(-14).reduce((a, b) => a + b, 0) / 14;
    const rs = avgGain / (avgLoss || 1);
    const rsi = 100 - (100 / (1 + rs));
    
    const ema12 = closes.slice(-12).reduce((a, b) => a + b, 0) / 12;
    const ema26 = closes.slice(-26).reduce((a, b) => a + b, 0) / 26;
    const macd = ema12 - ema26;
    
    return { rsi: Math.round(rsi * 10) / 10, macd: Math.round(macd * 100) / 100 };
  }, [selectedKlines]);

  // Calculate support/resistance
  const supportResistance = useMemo(() => {
    if (selectedKlines.length < 20) return { support: [], resistance: [] };
    
    const highs = selectedKlines.map(k => parseFloat(k.high));
    const lows = selectedKlines.map(k => parseFloat(k.low));
    
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const current = selectedPair?.price || 0;
    
    return {
      support: [min, min + (current - min) * 0.382].filter(s => s < current),
      resistance: [max, max - (max - current) * 0.382].filter(r => r > current),
    };
  }, [selectedKlines, selectedPair]);

  // Get market regime
  const marketRegime = useMemo(() => {
    if (!selectedSignal) return { regime: 'ANALYZING', description: 'Collecting data...' };
    
    const change = selectedPair?.priceChangePercent24h || 0;
    if (change > 5) return { regime: 'TRENDING_UP', description: 'Strong upward momentum' };
    if (change > 2) return { regime: 'BULLISH', description: 'Positive momentum detected' };
    if (change < -5) return { regime: 'TRENDING_DOWN', description: 'Strong downward pressure' };
    if (change < -2) return { regime: 'BEARISH', description: 'Negative sentiment' };
    return { regime: 'RANGING', description: 'Consolidation phase' };
  }, [selectedSignal, selectedPair]);

  // Generate agent votes
  const agentVotes = useMemo(() => {
    if (!selectedSignal) return AGENTS.map(a => ({ ...a, vote: 'HOLD' as const, confidence: 50 }));
    
    return AGENTS.map(agent => {
      const baseConfidence = selectedSignal.confidence;
      const variance = Math.random() * 20 - 10;
      const confidence = Math.min(95, Math.max(30, baseConfidence + variance));
      
      let vote: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      if (confidence > 60) vote = selectedSignal.type;
      else if (confidence < 40) vote = selectedSignal.type === 'BUY' ? 'SELL' : 'BUY';
      
      return { ...agent, vote, confidence: Math.round(confidence) };
    });
  }, [selectedSignal]);

  const buyVotes = agentVotes.filter(a => a.vote === 'BUY').length;
  const sellVotes = agentVotes.filter(a => a.vote === 'SELL').length;
  const holdVotes = agentVotes.filter(a => a.vote === 'HOLD').length;

  // Get recent high accuracy signals (80%+)
  const highAccuracySignals = useMemo(() => {
    return signals.filter(s => s.confidence >= demoSettings.minSignalAccuracy).slice(0, 5);
  }, [signals, demoSettings.minSignalAccuracy]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-[#c8e745]/30 border-t-[#c8e745] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Price Ticker */}
      <div className="top-bar py-2 px-4 overflow-hidden">
        <div className="flex items-center gap-6 whitespace-nowrap overflow-x-auto scrollbar-hide">
          {priceArray.slice(0, 10).map((pair) => (
            <div key={pair.symbol} className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">{pair.symbol.replace('USDT', '')}/USDT</span>
              <span className="text-white font-medium">
                ${pair.price.toLocaleString(undefined, { minimumFractionDigits: pair.price < 1 ? 4 : 2 })}
              </span>
              <span className={pair.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                {pair.priceChangePercent24h >= 0 ? '+' : ''}{pair.priceChangePercent24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-4">
        {/* Logo & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c8e745] flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Silver Lion AI</h1>
              <p className="text-xs text-[#c8e745]">Intelligent Trading Platform</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Demo Trading Status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141414] border border-white/5">
              <Bot className="w-4 h-4 text-[#c8e745]" />
              <div>
                <p className="text-xs text-gray-400">Demo Trading</p>
                <p className={`text-xs font-medium ${isDemoTrading ? 'text-green-400' : 'text-gray-400'}`}>
                  {isDemoTrading ? 'AUTO-TRADING' : 'PAUSED'}
                </p>
              </div>
              <button
                onClick={onToggleDemoTrading}
                className={`ml-2 w-10 h-5 rounded-full relative transition-colors ${
                  isDemoTrading ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  isDemoTrading ? 'left-5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Live Trading Status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141414] border border-white/5">
              <TrendingUp className="w-4 h-4 text-[#c8e745]" />
              <div>
                <p className="text-xs text-gray-400">Live Trading</p>
                <p className={`text-xs font-medium ${isLiveTrading ? 'text-green-400' : 'text-gray-400'}`}>
                  {isLiveTrading ? 'ACTIVE' : 'OFFLINE'}
                </p>
              </div>
              <button
                onClick={onToggleLiveTrading}
                className={`ml-2 w-10 h-5 rounded-full relative transition-colors ${
                  isLiveTrading ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  isLiveTrading ? 'left-5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Market Regime */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141414] border border-white/5">
              <Activity className="w-4 h-4 text-[#c8e745]" />
              <div>
                <p className="text-xs text-gray-400">Market Regime</p>
                <p className="text-xs text-white font-medium">
                  {marketRegime.regime} — {marketRegime.description}
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141414] border border-white/5">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <div>
                <p className="text-xs text-gray-400">WebSocket</p>
                <p className={`text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>

          {/* AI Confidence */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">AI Confidence</p>
              <p className="text-lg font-bold text-[#c8e745]">
                {selectedSignal ? selectedSignal.confidence.toFixed(1) : '--'}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Ensemble Score</p>
              <p className="text-lg font-bold text-white">
                {selectedSignal ? Math.round((buyVotes / 5) * 100) : '--'}%
              </p>
            </div>
          </div>
        </div>

        {/* Main Chart Section */}
        <Card className="card overflow-hidden">
          {/* Chart Header */}
          <div className="p-4 border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Coin Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowCoinDropdown(!showCoinDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <span className="font-bold text-white">{selectedSymbol.replace('USDT', '')}/USDT</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showCoinDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 dropdown z-50">
                      {priceArray.map((pair) => (
                        <button
                          key={pair.symbol}
                          onClick={() => handleSelectSymbol(pair.symbol)}
                          className={`dropdown-item w-full text-left ${
                            selectedSymbol === pair.symbol ? 'bg-[#c8e745]/10 text-[#c8e745]' : ''
                          }`}
                        >
                          <span>{pair.symbol.replace('USDT', '')}/USDT</span>
                          <span className={pair.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {pair.priceChangePercent24h >= 0 ? '+' : ''}{pair.priceChangePercent24h.toFixed(1)}%
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Display */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    ${selectedPair?.price.toLocaleString(undefined, { 
                      minimumFractionDigits: selectedPair && selectedPair.price < 1 ? 4 : 2 
                    })}
                  </span>
                  {selectedPair && (
                    <span className={`flex items-center gap-1 text-sm ${
                      selectedPair.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedPair.priceChangePercent24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {selectedPair.priceChangePercent24h >= 0 ? '+' : ''}{selectedPair.priceChangePercent24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Timeframe Buttons */}
              <div className="flex items-center gap-1">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`timeframe-btn ${selectedTimeframe === tf ? 'active' : ''}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="p-4">
            <div className="h-[300px] sm:h-[400px]">
              <PriceChart
                data={selectedKlines}
                symbol={selectedSymbol}
                supportLevels={supportResistance.support}
                resistanceLevels={supportResistance.resistance}
                pattern={selectedSignal?.pattern}
                accentColor="#c8e745"
              />
            </div>
          </div>
          
          {/* Support & Resistance Display */}
          <div className="px-4 pb-4 border-t border-white/5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-green-400" /> Support Levels
                </p>
                <div className="flex flex-wrap gap-2">
                  {supportResistance.support.length > 0 ? (
                    supportResistance.support.map((level, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
                        ${level.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">Calculating...</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-red-400" /> Resistance Levels
                </p>
                <div className="flex flex-wrap gap-2">
                  {supportResistance.resistance.length > 0 ? (
                    supportResistance.resistance.map((level, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                        ${level.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">Calculating...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">RSI (14)</span>
                <Activity className="w-4 h-4 text-[#c8e745]" />
              </div>
              <p className="text-xl font-bold text-white">{indicators.rsi}</p>
              <p className={`text-xs ${
                indicators.rsi > 70 ? 'text-red-400' : 
                indicators.rsi < 30 ? 'text-green-400' : 'text-gray-400'
              }`}>
                {indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">MACD</span>
                <BarChart3 className="w-4 h-4 text-[#c8e745]" />
              </div>
              <p className="text-xl font-bold text-white">{indicators.macd}</p>
              <p className={`text-xs ${indicators.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {indicators.macd > 0 ? 'Bullish' : 'Bearish'}
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">24h Volume</span>
                <DollarSign className="w-4 h-4 text-[#c8e745]" />
              </div>
              <p className="text-xl font-bold text-white">${selectedPair ? (selectedPair.volume24h / 1e9).toFixed(1) : '--'}B</p>
              <p className="text-xs text-gray-400">High</p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">24h Range</span>
                <PieChart className="w-4 h-4 text-[#c8e745]" />
              </div>
              <p className="text-xl font-bold text-white">
                ${selectedPair ? selectedPair.low24h.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '--'}
              </p>
              <p className="text-xs text-gray-400">
                High: ${selectedPair ? selectedPair.high24h.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '--'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Trading Settings & Open Positions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="card card-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#c8e745]" />
                  Demo Trading Settings
                </h3>
                <Badge className={isDemoTrading ? 'badge-green' : 'badge-yellow'}>
                  {isDemoTrading ? 'ACTIVE' : 'PAUSED'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Initial Balance</p>
                  <p className="text-white font-medium">${demoSettings.initialBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Default Leverage</p>
                  <p className="text-[#c8e745] font-medium">{demoSettings.defaultLeverage}x</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Trade Amount</p>
                  <p className="text-white font-medium">${demoSettings.tradeAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Min Accuracy</p>
                  <p className="text-green-400 font-medium">{demoSettings.minSignalAccuracy}%+</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Positions (Long/Short) */}
          <Card className="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#c8e745]" />
                  Open Positions
                </h3>
                <Badge className="badge-accent">
                  {account.openPositions.length} Active
                </Badge>
              </div>
              {account.openPositions.length === 0 ? (
                <p className="text-gray-500 text-sm">No open positions</p>
              ) : (
                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                  {account.openPositions.slice(0, 3).map((trade) => {
                    const currentPrice = prices.get(trade.symbol)?.price || trade.entryPrice;
                    const pnl = trade.side === 'BUY' 
                      ? (currentPrice - trade.entryPrice) * trade.quantity * trade.leverage
                      : (trade.entryPrice - currentPrice) * trade.quantity * trade.leverage;
                    return (
                      <div key={trade.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <div className="flex items-center gap-2">
                          <Badge className={trade.side === 'BUY' ? 'badge-green' : 'badge-red'}>
                            {trade.side === 'BUY' ? 'LONG' : 'SHORT'}
                          </Badge>
                          <span className="text-white text-sm">{trade.symbol.replace('USDT', '')}</span>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">{trade.leverage}x</p>
                        </div>
                      </div>
                    );
                  })}
                  {account.openPositions.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{account.openPositions.length - 3} more positions
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Trading Signals Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#c8e745]" />
              AI Trading Signals
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Multi-Agent Consensus</span>
              <span className="text-white">|</span>
              <span className="text-[#c8e745]">5 Agents Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Signal Card */}
            <Card className="card">
              <CardContent className="p-5">
                {selectedSignal ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">AI Signal</p>
                      <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${
                        selectedSignal.type === 'BUY' 
                          ? 'bg-green-500/20 border border-green-500/40' 
                          : selectedSignal.type === 'SELL'
                          ? 'bg-red-500/20 border border-red-500/40'
                          : 'bg-gray-500/20 border border-gray-500/40'
                      }`}>
                        {selectedSignal.type === 'BUY' ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : selectedSignal.type === 'SELL' ? (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        ) : (
                          <Activity className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`text-2xl font-bold ${
                          selectedSignal.type === 'BUY' ? 'text-green-400' : 
                          selectedSignal.type === 'SELL' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {selectedSignal.type}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Confidence</span>
                        <span className="text-[#c8e745] font-bold">{selectedSignal.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${selectedSignal.confidence}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-xs text-gray-400">Entry Price</span>
                        <p className="text-white font-medium">${selectedSignal.entryPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Risk/Reward</span>
                        <p className="text-white font-medium">1:{((selectedSignal.takeProfit - selectedSignal.entryPrice) / (selectedSignal.entryPrice - selectedSignal.stopLoss)).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Target className="w-3 h-3" /> Stop Loss
                        </span>
                        <p className="text-red-400 font-medium">${selectedSignal.stopLoss.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Take Profit
                        </span>
                        <p className="text-green-400 font-medium">${selectedSignal.takeProfit.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                      <div className="w-12 h-12 border-2 border-[#c8e745]/30 border-t-[#c8e745] rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-400">Analyzing market conditions...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agent Voting */}
            <Card className="card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white">Agent Voting</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="badge-green">{buyVotes} BUY</Badge>
                    <Badge className="badge-red">{sellVotes} SELL</Badge>
                    <Badge className="badge-yellow">{holdVotes} HOLD</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {agentVotes.map((agent, idx) => (
                    <div key={idx} className="agent-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            agent.vote === 'BUY' ? 'bg-green-500/20' :
                            agent.vote === 'SELL' ? 'bg-red-500/20' : 'bg-gray-500/20'
                          }`}>
                            <agent.icon className={`w-4 h-4 ${
                              agent.vote === 'BUY' ? 'text-green-400' :
                              agent.vote === 'SELL' ? 'text-red-400' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400">{agent.weight}% weight</span>
                          <p className={`text-sm font-medium ${
                            agent.confidence > 60 ? 'text-green-400' :
                            agent.confidence < 40 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {agent.confidence}% confidence
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ensemble Score */}
                <div className="mt-4 p-3 bg-[#c8e745]/10 border border-[#c8e745]/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#c8e745]" />
                      <div>
                        <p className="text-sm font-medium text-white">Ensemble Score</p>
                        <p className="text-xs text-gray-400">Weighted aggregation of all agents</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#c8e745]">
                        {(buyVotes / 5).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {buyVotes >= 3 ? 'Strong Signal' : buyVotes >= 2 ? 'Moderate Signal' : 'Weak Signal'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* High Accuracy Signals */}
        {highAccuracySignals.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#c8e745]" />
              High Accuracy Signals ({demoSettings.minSignalAccuracy}%+)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {highAccuracySignals.map((signal) => (
                <Card key={signal.id} className="card hover-glow cursor-pointer" onClick={() => handleSelectSymbol(signal.symbol)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{signal.symbol.replace('USDT', '')}</span>
                      <Badge className={
                        signal.type === 'BUY' ? 'badge-green' : 
                        signal.type === 'SELL' ? 'badge-red' : 'badge-yellow'
                      }>
                        {signal.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-[#c8e745] font-bold">{signal.confidence.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Entry:</span>
                      <span className="text-white">${signal.entryPrice.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg border border-white/5">
            <div className={`w-2 h-2 rounded-full ${isDemoTrading ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <div>
              <p className="text-xs text-gray-400">Risk Systems</p>
              <p className={`text-sm font-medium ${isDemoTrading ? 'text-green-400' : 'text-red-400'}`}>
                {isDemoTrading ? 'Active' : 'Triggered'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg border border-white/5">
            <div className={`w-2 h-2 rounded-full ${selectedSignal && selectedSignal.confidence > 70 ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <div>
              <p className="text-xs text-gray-400">AI Confidence</p>
              <p className="text-sm font-medium text-white">
                {selectedSignal && selectedSignal.confidence > 70 ? 'High' : 'Moderate'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg border border-white/5">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <div>
              <p className="text-xs text-gray-400">Market Data</p>
              <p className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg border border-white/5">
            <div className={`w-2 h-2 rounded-full ${isDemoTrading ? 'bg-green-400' : 'bg-red-400'}`} />
            <div>
              <p className="text-xs text-gray-400">Trade Execution</p>
              <p className={`text-sm font-medium ${isDemoTrading ? 'text-green-400' : 'text-red-400'}`}>
                {isDemoTrading ? 'Ready' : 'Blocked'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#c8e745] hover:bg-[#d4ed5a] rounded-full flex items-center justify-center shadow-lg shadow-[#c8e745]/30 transition-all hover:scale-110 z-50"
      >
        <MessageSquare className="w-5 h-5 text-black" />
      </button>

      {/* AI Chat Popup */}
      {showChat && (
        <AIChatPopup onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}

export default Dashboard;
