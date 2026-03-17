import { useState } from 'react';
import { Play, BarChart3, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BacktestResult } from '@/types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface BacktestingProps {
  results: BacktestResult[];
  onRunBacktest: (params: {
    symbol: string;
    strategy: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
  }) => void;
}

// Generate mock trades for a backtest
function generateMockTrades(count: number, winRate: number) {
  const trades = [];
  const sides: ('BUY' | 'SELL')[] = ['BUY', 'SELL'];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
  
  for (let i = 0; i < count; i++) {
    const isWin = Math.random() * 100 < winRate;
    const side = sides[Math.floor(Math.random() * sides.length)];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const entryPrice = 10000 + Math.random() * 50000;
    const priceChange = isWin 
      ? Math.random() * 0.05 + 0.01  // 1-6% profit
      : -(Math.random() * 0.03 + 0.01); // 1-4% loss
    const exitPrice = entryPrice * (1 + priceChange);
    const pnl = (exitPrice - entryPrice) * 0.1; // 0.1 quantity
    
    trades.push({
      id: `trade-${i}`,
      symbol,
      side,
      entryPrice,
      exitPrice,
      pnl,
      pnlPercent: priceChange * 100,
      openedAt: new Date(Date.now() - (count - i) * 86400000),
      closedAt: new Date(Date.now() - (count - i - 1) * 86400000),
    });
  }
  
  return trades.sort((a, b) => b.closedAt.getTime() - a.closedAt.getTime());
}

export function Backtesting({ results, onRunBacktest }: BacktestingProps) {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [strategy, setStrategy] = useState('AI_ML');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [initialCapital, setInitialCapital] = useState(10000);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedResult, setSelectedResult] = useState<BacktestResult | null>(results[0] || null);
  const [tradeFilter, setTradeFilter] = useState<'all' | 'win' | 'loss'>('all');

  const handleRunBacktest = () => {
    setIsRunning(true);
    onRunBacktest({ symbol, strategy, startDate, endDate, initialCapital });
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  // Generate mock trades for display
  const mockTrades = selectedResult 
    ? generateMockTrades(selectedResult.totalTrades, selectedResult.winRate)
    : [];

  const filteredTrades = mockTrades.filter(trade => {
    if (tradeFilter === 'win') return trade.pnl > 0;
    if (tradeFilter === 'loss') return trade.pnl < 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Backtesting Engine</h1>
        <p className="text-gray-400">Test strategies against historical data</p>
      </div>

      {/* Configuration */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#ffdf8d]" />
            Backtest Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label className="text-gray-400">Symbol</Label>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/20">
                  <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                  <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                  <SelectItem value="SOLUSDT">SOL/USDT</SelectItem>
                  <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
                  <SelectItem value="XRPUSDT">XRP/USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-400">Strategy</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/20">
                  <SelectItem value="AI_ML">AI/ML Strategy</SelectItem>
                  <SelectItem value="EMA_CROSS">EMA Crossover</SelectItem>
                  <SelectItem value="RSI">RSI Strategy</SelectItem>
                  <SelectItem value="MACD">MACD Strategy</SelectItem>
                  <SelectItem value="BB">Bollinger Bands</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-400">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-black/30 border-white/20 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-400">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-black/30 border-white/20 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-400">Initial Capital ($)</Label>
              <Input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
                className="bg-black/30 border-white/20 text-white mt-1"
              />
            </div>
          </div>

          <Button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="mt-4 bg-[#ffdf8d] text-black hover:bg-[#ffdf8d]/90"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Backtest
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-[#1a1a1a] border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="equity">Equity Curve</TabsTrigger>
            <TabsTrigger value="trades">
              Trades ({selectedResult?.totalTrades || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Results Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => setSelectedResult(result)}
                  className={`px-4 py-2 rounded-lg border whitespace-nowrap ${
                    selectedResult?.id === result.id
                      ? 'bg-[#ffdf8d]/20 border-[#ffdf8d] text-[#ffdf8d]'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {result.strategyName} - {result.symbol.replace('USDT', '')}
                </button>
              ))}
            </div>

            {selectedResult && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-[#1a1a1a] border-white/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-400">Total Return</p>
                      <p className={`text-2xl font-bold ${selectedResult.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedResult.totalReturn >= 0 ? '+' : ''}{selectedResult.totalReturn.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a1a] border-white/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedResult.winRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedResult.winningTrades}W / {selectedResult.losingTrades}L
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a1a] border-white/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-400">Profit Factor</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedResult.profitFactor.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a1a] border-white/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-400">Max Drawdown</p>
                      <p className="text-2xl font-bold text-red-400">
                        -{selectedResult.maxDrawdown.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card className="bg-[#1a1a1a] border-white/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-400">Total Trades</p>
                      <p className="text-xl font-bold text-white">{selectedResult.totalTrades}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a1a] border-white/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-400">Sharpe Ratio</p>
                      <p className="text-xl font-bold text-white">{selectedResult.sharpeRatio.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a1a] border-white/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-400">Test Period</p>
                      <p className="text-sm text-white">
                        {new Date(selectedResult.startDate).toLocaleDateString()} - {new Date(selectedResult.endDate).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="equity" className="mt-4">
            {selectedResult && (
              <Card className="bg-[#1a1a1a] border-white/10">
                <CardContent className="p-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedResult.equityCurve}>
                        <defs>
                          <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffdf8d" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ffdf8d" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="#666"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="equity" 
                          stroke="#ffdf8d" 
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorEquity)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trades" className="mt-4">
            <Card className="bg-[#1a1a1a] border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#ffdf8d]" />
                    Trade History
                  </CardTitle>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTradeFilter('all')}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        tradeFilter === 'all' 
                          ? 'bg-[#ffdf8d] text-black' 
                          : 'bg-black/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTradeFilter('win')}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        tradeFilter === 'win' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-black/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      Wins
                    </button>
                    <button
                      onClick={() => setTradeFilter('loss')}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        tradeFilter === 'loss' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-black/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      Losses
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredTrades.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No trades found</p>
                  ) : (
                    filteredTrades.map((trade) => (
                      <div
                        key={trade.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          trade.pnl > 0 
                            ? 'bg-green-500/5 border-green-500/20' 
                            : 'bg-red-500/5 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Badge className={trade.side === 'BUY' ? 'bg-green-500' : 'bg-red-500'}>
                            {trade.side}
                          </Badge>
                          <div>
                            <p className="font-bold text-white">{trade.symbol.replace('USDT', '')}</p>
                            <p className="text-xs text-gray-500">
                              {trade.openedAt.toLocaleDateString()} - {trade.closedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Entry → Exit</p>
                            <p className="text-white text-sm">
                              ${trade.entryPrice.toFixed(2)} → ${trade.exitPrice.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className={`text-right ${trade.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <p className="text-lg font-bold">
                              {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                            </p>
                            <p className="text-sm">
                              {trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {results.length === 0 && (
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No backtest results yet</p>
            <p className="text-sm text-gray-600 mt-2">
              Configure parameters and run your first backtest
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Backtesting;
