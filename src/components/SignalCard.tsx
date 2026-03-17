import { TrendingUp, TrendingDown, Minus, Clock, Target, Shield } from 'lucide-react';
import type { TradingSignal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SignalCardProps {
  signal: TradingSignal;
  isActive?: boolean;
}

export function SignalCard({ signal, isActive = false }: SignalCardProps) {
  const getSignalColor = () => {
    switch (signal.type) {
      case 'BUY':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'SELL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStrengthColor = () => {
    switch (signal.strength) {
      case 'STRONG':
        return 'text-green-400';
      case 'MODERATE':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSignalIcon = () => {
    switch (signal.type) {
      case 'BUY':
        return <TrendingUp className="w-6 h-6" />;
      case 'SELL':
        return <TrendingDown className="w-6 h-6" />;
      default:
        return <Minus className="w-6 h-6" />;
    }
  };

  return (
    <Card className={`bg-[#1a1a1a] border-white/10 overflow-hidden transition-all duration-300 ${
      isActive ? 'ring-2 ring-[#ffdf8d] shadow-lg shadow-[#ffdf8d]/10' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${getSignalColor()}`}>
              {getSignalIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{signal.symbol.replace('USDT', '')}</h3>
              <p className="text-sm text-gray-400">{signal.timeframe} Timeframe</p>
            </div>
          </div>
          <Badge className={`${getSignalColor()} border`}>
            {signal.type}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/30 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Entry Price</p>
            <p className="text-lg font-mono font-bold text-white">
              ${signal.entryPrice.toLocaleString(undefined, { 
                minimumFractionDigits: signal.entryPrice < 1 ? 4 : 2,
                maximumFractionDigits: signal.entryPrice < 1 ? 4 : 2 
              })}
            </p>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Confidence</p>
            <p className={`text-lg font-bold ${getStrengthColor()}`}>
              {signal.confidence.toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            <Shield className="w-4 h-4 text-red-400" />
            <div>
              <p className="text-xs text-gray-500">Stop Loss</p>
              <p className="font-mono font-medium text-red-400">
                ${signal.stopLoss.toLocaleString(undefined, { 
                  minimumFractionDigits: signal.stopLoss < 1 ? 4 : 2,
                  maximumFractionDigits: signal.stopLoss < 1 ? 4 : 2 
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-3 border border-green-500/20">
            <Target className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-xs text-gray-500">Take Profit</p>
              <p className="font-mono font-medium text-green-400">
                ${signal.takeProfit.toLocaleString(undefined, { 
                  minimumFractionDigits: signal.takeProfit < 1 ? 4 : 2,
                  maximumFractionDigits: signal.takeProfit < 1 ? 4 : 2 
                })}
              </p>
            </div>
          </div>
        </div>

        {signal.indicators && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {signal.indicators.rsi && (
              <div className="text-center bg-black/20 rounded p-2">
                <p className="text-xs text-gray-500">RSI</p>
                <p className={`font-mono font-medium ${
                  signal.indicators.rsi > 70 ? 'text-red-400' : 
                  signal.indicators.rsi < 30 ? 'text-green-400' : 'text-white'
                }`}>
                  {signal.indicators.rsi.toFixed(1)}
                </p>
              </div>
            )}
            {signal.indicators.macd && (
              <div className="text-center bg-black/20 rounded p-2">
                <p className="text-xs text-gray-500">MACD</p>
                <p className={`font-mono font-medium ${
                  signal.indicators.macd > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {signal.indicators.macd > 0 ? '+' : ''}{signal.indicators.macd.toFixed(3)}
                </p>
              </div>
            )}
            {signal.indicators.ema20 && (
              <div className="text-center bg-black/20 rounded p-2">
                <p className="text-xs text-gray-500">EMA20</p>
                <p className="font-mono font-medium text-white">
                  {signal.indicators.ema20 > signal.entryPrice ? '↑' : '↓'}
                </p>
              </div>
            )}
            {signal.indicators.ema50 && (
              <div className="text-center bg-black/20 rounded p-2">
                <p className="text-xs text-gray-500">EMA50</p>
                <p className="font-mono font-medium text-white">
                  {signal.indicators.ema50 > signal.entryPrice ? '↑' : '↓'}
                </p>
              </div>
            )}
          </div>
        )}

        {signal.pattern && (
          <div className="mb-3">
            <Badge variant="outline" className="border-[#ffdf8d]/30 text-[#ffdf8d]">
              Pattern: {signal.pattern.replace(/_/g, ' ')}
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>{signal.timestamp.toLocaleTimeString()}</span>
        </div>

        <p className="mt-3 text-sm text-gray-400 line-clamp-2">{signal.reasoning}</p>
      </CardContent>
    </Card>
  );
}

export default SignalCard;
