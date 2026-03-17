import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Settings, 
  Target,
  Play,
  Pause,
  Power,
  Zap,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PaperTradingAccount, PaperTrade, CryptoPair, DemoTradingSettings, TradingSignal } from '@/types';

interface PaperTradingProps {
  account: PaperTradingAccount;
  settings: DemoTradingSettings;
  prices: Map<string, CryptoPair>;
  signals: TradingSignal[];
  onOpenPosition: (
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    entryPrice: number,
    leverage: number,
    stopLoss?: number,
    takeProfit?: number
  ) => boolean;
  onClosePosition: (tradeId: string, exitPrice: number) => void;
  onReset: () => void;
  onUpdateSettings: (settings: Partial<DemoTradingSettings>) => void;
  unrealizedPnl: number;
}

export function PaperTrading({
  account,
  settings,
  prices,
  signals,
  onOpenPosition,
  onClosePosition,
  onReset,
  onUpdateSettings,
  unrealizedPnl,
}: PaperTradingProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDemoTradingActive, setIsDemoTradingActive] = useState(false);
  
  const [localSettings, setLocalSettings] = useState(settings);
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  const highAccuracySignals = signals.filter(s => s.confidence >= settings.minSignalAccuracy);
  
  const currentPrice = prices.get(selectedSymbol)?.price || 0;
  const tradeQuantity = currentPrice > 0 ? settings.tradeAmount / currentPrice : 0;

  const handleOpenPosition = () => {
    const qty = tradeQuantity;
    const lev = settings.defaultLeverage;
    const marginRequired = (qty * currentPrice) / lev;
    
    if (marginRequired > account.balance) {
      alert('Insufficient balance for this trade!');
      return;
    }
    
    const success = onOpenPosition(
      selectedSymbol,
      side,
      qty,
      currentPrice,
      lev,
      stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit ? parseFloat(takeProfit) : undefined
    );
    
    if (success) {
      setIsTradeDialogOpen(false);
    }
  };
  
  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    setIsSettingsOpen(false);
  };

  const handleClosePosition = (trade: PaperTrade) => {
    const exitPrice = prices.get(trade.symbol)?.price || trade.entryPrice;
    onClosePosition(trade.id, exitPrice);
  };

  const toggleDemoTrading = () => {
    setIsDemoTradingActive(prev => !prev);
  };

  // Calculate win rate
  const winRate = useCallback(() => {
    if (account.tradeHistory.length === 0) return 0;
    const wins = account.tradeHistory.filter(t => (t.pnl || 0) > 0).length;
    return (wins / account.tradeHistory.length) * 100;
  }, [account.tradeHistory]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#c8e745]" />
            Paper Trading
          </h1>
          <p className="text-gray-400 text-sm">Practice trading with virtual funds</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Demo Trading Toggle */}
          <Button
            onClick={toggleDemoTrading}
            className={`transition-all duration-300 ${
              isDemoTradingActive 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <Power className="w-4 h-4 mr-2" />
            Auto-Trade: {isDemoTradingActive ? 'ON' : 'OFF'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsSettingsOpen(true)} 
            className="border-white/20 text-gray-400 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="border-white/20 text-gray-400 hover:text-red-400"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Demo Trading Status Banner */}
      <div className={`p-4 rounded-xl border transition-all duration-300 ${
        isDemoTradingActive 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-gray-800/50 border-white/10'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDemoTradingActive ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              {isDemoTradingActive ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
            </div>
            <div>
              <p className="text-white font-bold">
                {isDemoTradingActive ? 'Demo Trading Active' : 'Demo Trading Paused'}
              </p>
              <p className="text-gray-400 text-sm">
                {isDemoTradingActive 
                  ? `AI auto-executing ${settings.minSignalAccuracy}%+ signals` 
                  : 'Manual trading only - signals displayed but not executed'}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500">Min Accuracy</p>
            <p className="text-green-400 font-bold">{settings.minSignalAccuracy}%+</p>
          </div>
        </div>
      </div>
      
      {/* Settings Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="card">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500 mb-1">Initial Balance</p>
            <p className="text-lg font-bold text-white">${settings.initialBalance.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500 mb-1">Default Leverage</p>
            <p className="text-lg font-bold text-[#c8e745]">{settings.defaultLeverage}x</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500 mb-1">Trade Amount</p>
            <p className="text-lg font-bold text-white">${settings.tradeAmount}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500 mb-1">Min Accuracy</p>
            <p className="text-lg font-bold text-green-400">{settings.minSignalAccuracy}%+</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Balance</CardTitle>
            <Wallet className="w-4 h-4 text-[#c8e745]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">
              ${account.balance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              Initial: ${account.initialBalance.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total P&L</CardTitle>
            <TrendingUp className="w-4 h-4 text-[#c8e745]" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${account.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {account.totalPnl >= 0 ? '+' : ''}${account.totalPnl.toFixed(2)}
            </div>
            <p className={`text-xs ${account.totalPnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {account.totalPnlPercent >= 0 ? '+' : ''}{account.totalPnlPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Unrealized P&L</CardTitle>
            <TrendingUp className="w-4 h-4 text-[#c8e745]" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              From {account.openPositions.length} open
            </p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Win Rate</CardTitle>
            <Award className="w-4 h-4 text-[#c8e745]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {winRate().toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">
              {account.tradeHistory.length} trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* High Accuracy Signals */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
            <Target className="w-5 h-5 text-[#c8e745]" />
            High Accuracy Signals ({settings.minSignalAccuracy}%+)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {highAccuracySignals.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <div className="relative w-10 h-10 mx-auto mb-3">
                <div className="w-10 h-10 border-2 border-[#c8e745]/30 border-t-[#c8e745] rounded-full animate-spin" />
              </div>
              <p>No signals with {settings.minSignalAccuracy}%+ accuracy available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {highAccuracySignals.slice(0, 6).map((signal) => (
                <div 
                  key={signal.id} 
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedSymbol === signal.symbol 
                      ? 'border-[#c8e745] bg-[#c8e745]/10' 
                      : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                  onClick={() => {
                    setSelectedSymbol(signal.symbol);
                    setSide(signal.type === 'BUY' ? 'BUY' : 'SELL');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{signal.symbol.replace('USDT', '')}</span>
                    <Badge className={
                      signal.type === 'BUY' ? 'badge-green' : 
                      signal.type === 'SELL' ? 'badge-red' : 
                      'badge-yellow'
                    }>
                      {signal.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-green-400 font-bold">{signal.confidence.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Entry:</span>
                    <span className="text-white">${signal.entryPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Trade Button */}
      <Button 
        onClick={() => setIsTradeDialogOpen(true)}
        className="btn-primary"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Trade (${settings.tradeAmount} @ {settings.defaultLeverage}x)
      </Button>

      {/* Positions & History Tabs */}
      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="bg-[#141414] border border-white/10 w-full sm:w-auto">
          <TabsTrigger value="positions" className="flex-1 sm:flex-none">
            Open Positions ({account.openPositions.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 sm:flex-none">
            Trade History ({account.tradeHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="mt-4">
          {account.openPositions.length === 0 ? (
            <Card className="card">
              <CardContent className="p-8 sm:p-12 text-center">
                <p className="text-gray-500">No open positions</p>
                <p className="text-sm text-gray-600 mt-2">
                  Click "New Trade" to open your first position
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {account.openPositions.map((trade) => {
                const currentPrice = prices.get(trade.symbol)?.price || trade.entryPrice;
                let tradeUnrealizedPnl = 0;
                if (trade.side === 'BUY') {
                  tradeUnrealizedPnl = (currentPrice - trade.entryPrice) * trade.quantity * trade.leverage;
                } else {
                  tradeUnrealizedPnl = (trade.entryPrice - currentPrice) * trade.quantity * trade.leverage;
                }
                const pnlPercent = (tradeUnrealizedPnl / ((trade.quantity * trade.entryPrice) / trade.leverage)) * 100;

                return (
                  <Card key={trade.id} className="card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={trade.side === 'BUY' ? 'bg-green-500' : 'bg-red-500'}>
                            {trade.side}
                          </Badge>
                          <span className="font-bold text-white">{trade.symbol.replace('USDT', '')}</span>
                        </div>
                        <span className="text-sm text-gray-400">{trade.leverage}x</span>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Trade Value:</span>
                          <span className="text-white">${(trade.quantity * trade.entryPrice).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Entry:</span>
                          <span className="text-white">${trade.entryPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Current:</span>
                          <span className="text-white">${currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Quantity:</span>
                          <span className="text-white">{trade.quantity.toFixed(6)}</span>
                        </div>
                        {trade.stopLoss && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">SL:</span>
                            <span className="text-red-400">${trade.stopLoss.toFixed(2)}</span>
                          </div>
                        )}
                        {trade.takeProfit && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">TP:</span>
                            <span className="text-green-400">${trade.takeProfit.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div className={`text-lg font-bold mb-3 ${tradeUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tradeUnrealizedPnl >= 0 ? '+' : ''}${tradeUnrealizedPnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                      </div>

                      <Button
                        onClick={() => handleClosePosition(trade)}
                        variant="outline"
                        className="w-full border-white/20 text-gray-400 hover:text-white"
                      >
                        Close Position
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {account.tradeHistory.length === 0 ? (
            <Card className="card">
              <CardContent className="p-8 sm:p-12 text-center">
                <p className="text-gray-500">No trade history yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {account.tradeHistory.map((trade) => (
                <Card key={trade.id} className="card">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Badge className={trade.side === 'BUY' ? 'bg-green-500' : 'bg-red-500'}>
                          {trade.side}
                        </Badge>
                        <div>
                          <span className="font-bold text-white">{trade.symbol.replace('USDT', '')}</span>
                          <span className="text-gray-500 ml-2">{trade.leverage}x</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Trade Value</p>
                          <p className="text-white text-sm">
                            ${((trade.quantity * trade.entryPrice)).toFixed(2)} @ {trade.leverage}x
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Entry → Exit</p>
                          <p className="text-white text-sm">
                            ${trade.entryPrice.toFixed(2)} → ${trade.exitPrice?.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className={`text-right ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          <p className="text-base sm:text-lg font-bold">
                            {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                          </p>
                          <p className="text-xs">
                            {(trade.pnlPercent || 0) >= 0 ? '+' : ''}{(trade.pnlPercent || 0).toFixed(2)}%
                          </p>
                        </div>
                        
                        <div className="text-right text-gray-500 text-xs sm:text-sm">
                          {trade.closedAt?.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-[#141414] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Demo Trading Settings</h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <AlertTriangle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Initial Balance */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-gray-400">Initial Balance ($)</Label>
                    <span className="text-white font-bold">${localSettings.initialBalance.toLocaleString()}</span>
                  </div>
                  <Input
                    type="number"
                    value={localSettings.initialBalance}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, initialBalance: parseFloat(e.target.value) || 10000 }))}
                    min={1000}
                    step={1000}
                    className="bg-black/30 border-white/20 text-white"
                  />
                </div>
                
                {/* Default Leverage */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-gray-400">Default Leverage</Label>
                    <span className="text-white font-bold">{localSettings.defaultLeverage}x</span>
                  </div>
                  <Slider
                    value={[localSettings.defaultLeverage]}
                    onValueChange={(v) => setLocalSettings(prev => ({ ...prev, defaultLeverage: v[0] }))}
                    min={1}
                    max={125}
                    step={1}
                  />
                </div>
                
                {/* Trade Amount */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-gray-400">Trade Amount ($)</Label>
                    <span className="text-white font-bold">${localSettings.tradeAmount}</span>
                  </div>
                  <Input
                    type="number"
                    value={localSettings.tradeAmount}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, tradeAmount: parseFloat(e.target.value) || 100 }))}
                    min={10}
                    step={10}
                    className="bg-black/30 border-white/20 text-white"
                  />
                </div>
                
                {/* Min Signal Accuracy */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-gray-400">Min Signal Accuracy (%)</Label>
                    <span className="text-white font-bold">{localSettings.minSignalAccuracy}%</span>
                  </div>
                  <Slider
                    value={[localSettings.minSignalAccuracy]}
                    onValueChange={(v) => setLocalSettings(prev => ({ ...prev, minSignalAccuracy: v[0] }))}
                    min={50}
                    max={95}
                    step={5}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setIsSettingsOpen(false)}
                    variant="outline"
                    className="flex-1 border-white/20 text-gray-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveSettings}
                    className="flex-1 btn-primary"
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trade Dialog Modal */}
      {isTradeDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-[#141414] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Open New Position</h2>
                <button 
                  onClick={() => setIsTradeDialogOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Trade Summary */}
                <div className="p-3 bg-[#c8e745]/10 border border-[#c8e745]/30 rounded-lg">
                  <p className="text-sm text-[#c8e745] font-medium">Trade Configuration</p>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <p className="text-white font-bold">${settings.tradeAmount}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Leverage:</span>
                      <p className="text-white font-bold">{settings.defaultLeverage}x</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <p className="text-white font-bold">{tradeQuantity.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Symbol Selection */}
                <div>
                  <Label className="text-gray-400 mb-2 block">Symbol</Label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    {Array.from(prices.keys()).map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol.replace('USDT', '')}/USDT - ${prices.get(symbol)?.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Side Selection */}
                <div>
                  <Label className="text-gray-400 mb-2 block">Side</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={side === 'BUY' ? 'default' : 'outline'}
                      onClick={() => setSide('BUY')}
                      className={`flex-1 ${side === 'BUY' ? 'bg-green-500 text-white' : 'border-white/20 text-gray-400'}`}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      BUY
                    </Button>
                    <Button
                      type="button"
                      variant={side === 'SELL' ? 'default' : 'outline'}
                      onClick={() => setSide('SELL')}
                      className={`flex-1 ${side === 'SELL' ? 'bg-red-500 text-white' : 'border-white/20 text-gray-400'}`}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      SELL
                    </Button>
                  </div>
                </div>

                {/* Stop Loss */}
                <div>
                  <Label className="text-gray-400 mb-2 block">Stop Loss (optional)</Label>
                  <Input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder={`Current: $${currentPrice.toFixed(2)}`}
                    className="bg-black/30 border-white/20 text-white"
                  />
                </div>

                {/* Take Profit */}
                <div>
                  <Label className="text-gray-400 mb-2 block">Take Profit (optional)</Label>
                  <Input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder={`Current: $${currentPrice.toFixed(2)}`}
                    className="bg-black/30 border-white/20 text-white"
                  />
                </div>

                {/* Margin Info */}
                <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Trade Value:</span>
                    <span className="text-white">${settings.tradeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Margin Required:</span>
                    <span className="text-white">${(settings.tradeAmount / settings.defaultLeverage).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Available:</span>
                    <span className="text-white">${account.balance.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setIsTradeDialogOpen(false)}
                    variant="outline"
                    className="flex-1 border-white/20 text-gray-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleOpenPosition}
                    disabled={(settings.tradeAmount / settings.defaultLeverage) > account.balance}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    Open Position
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaperTrading;
