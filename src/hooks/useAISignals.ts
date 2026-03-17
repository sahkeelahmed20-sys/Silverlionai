import { useState, useEffect, useCallback, useRef } from 'react';
import type { TradingSignal, SignalType, SignalStrength, CryptoPair } from '@/types';
import { CRYPTO_PAIRS } from './useBinanceWebSocket';

// Technical Analysis Functions
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  // Simplified signal line (9-period EMA of MACD)
  const signal = macd * 0.2; // Approximation
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  if (prices.length < period) {
    const lastPrice = prices[prices.length - 1];
    return { upper: lastPrice * 1.02, middle: lastPrice, lower: lastPrice * 0.98 };
  }
  
  const slice = prices.slice(-period);
  const sma = slice.reduce((a, b) => a + b) / period;
  
  const squaredDiffs = slice.map(p => Math.pow(p - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: sma + (std * stdDev),
    middle: sma,
    lower: sma - (std * stdDev),
  };
}

// Pattern Detection
function detectPattern(prices: number[]): string | undefined {
  if (prices.length < 20) return undefined;
  
  const recent = prices.slice(-20);
  const max = Math.max(...recent);
  const min = Math.min(...recent);
  const range = max - min;
  
  // Double Top
  const peaks: number[] = [];
  for (let i = 2; i < recent.length - 2; i++) {
    if (recent[i] > recent[i-1] && recent[i] > recent[i-2] && 
        recent[i] > recent[i+1] && recent[i] > recent[i+2]) {
      peaks.push(i);
    }
  }
  
  if (peaks.length >= 2) {
    const lastTwoPeaks = peaks.slice(-2);
    const peak1 = recent[lastTwoPeaks[0]];
    const peak2 = recent[lastTwoPeaks[1]];
    
    if (Math.abs(peak1 - peak2) / range < 0.05) {
      return 'DOUBLE_TOP';
    }
  }
  
  // Double Bottom
  const troughs: number[] = [];
  for (let i = 2; i < recent.length - 2; i++) {
    if (recent[i] < recent[i-1] && recent[i] < recent[i-2] && 
        recent[i] < recent[i+1] && recent[i] < recent[i+2]) {
      troughs.push(i);
    }
  }
  
  if (troughs.length >= 2) {
    const lastTwoTroughs = troughs.slice(-2);
    const trough1 = recent[lastTwoTroughs[0]];
    const trough2 = recent[lastTwoTroughs[1]];
    
    if (Math.abs(trough1 - trough2) / range < 0.05) {
      return 'DOUBLE_BOTTOM';
    }
  }
  
  // Triangle
  const firstHalf = recent.slice(0, 10);
  const secondHalf = recent.slice(10);
  const firstHigh = Math.max(...firstHalf);
  const secondHigh = Math.max(...secondHalf);
  const firstLow = Math.min(...firstHalf);
  const secondLow = Math.min(...secondHalf);
  
  if (firstHigh > secondHigh && firstLow < secondLow) {
    return 'TRIANGLE';
  }
  
  return undefined;
}

// Generate AI Signal
function generateSignal(
  symbol: string,
  currentPrice: number,
  priceHistory: number[]
): TradingSignal {
  const rsi = calculateRSI(priceHistory);
  const ema20 = calculateEMA(priceHistory, 20);
  const ema50 = calculateEMA(priceHistory, 50);
  const macd = calculateMACD(priceHistory);
  const bb = calculateBollingerBands(priceHistory);
  const pattern = detectPattern(priceHistory);
  
  // Determine signal type
  let type: SignalType = 'HOLD';
  let strength: SignalStrength = 'WEAK';
  let confidence = 50;
  
  const signals: { type: SignalType; weight: number }[] = [];
  
  // RSI signals
  if (rsi < 30) signals.push({ type: 'BUY', weight: 25 });
  else if (rsi > 70) signals.push({ type: 'SELL', weight: 25 });
  
  // EMA signals
  if (ema20 > ema50) signals.push({ type: 'BUY', weight: 20 });
  else if (ema20 < ema50) signals.push({ type: 'SELL', weight: 20 });
  
  // MACD signals
  if (macd.histogram > 0 && macd.macd > 0) signals.push({ type: 'BUY', weight: 20 });
  else if (macd.histogram < 0 && macd.macd < 0) signals.push({ type: 'SELL', weight: 20 });
  
  // Bollinger Bands signals
  if (currentPrice < bb.lower) signals.push({ type: 'BUY', weight: 15 });
  else if (currentPrice > bb.upper) signals.push({ type: 'SELL', weight: 15 });
  
  // Pattern signals
  if (pattern === 'DOUBLE_BOTTOM') signals.push({ type: 'BUY', weight: 20 });
  else if (pattern === 'DOUBLE_TOP') signals.push({ type: 'SELL', weight: 20 });
  
  // Calculate weighted signal
  const buyWeight = signals.filter(s => s.type === 'BUY').reduce((a, s) => a + s.weight, 0);
  const sellWeight = signals.filter(s => s.type === 'SELL').reduce((a, s) => a + s.weight, 0);
  
  if (buyWeight > sellWeight + 10) {
    type = 'BUY';
    confidence = Math.min(95, 50 + buyWeight - sellWeight);
  } else if (sellWeight > buyWeight + 10) {
    type = 'SELL';
    confidence = Math.min(95, 50 + sellWeight - buyWeight);
  }
  
  // Determine strength
  if (confidence >= 80) strength = 'STRONG';
  else if (confidence >= 60) strength = 'MODERATE';
  
  // Calculate entry, SL, TP
  const atr = (bb.upper - bb.lower) / 4; // Approximation
  let entryPrice = currentPrice;
  let stopLoss = type === 'BUY' ? currentPrice - (atr * 2) : currentPrice + (atr * 2);
  let takeProfit = type === 'BUY' ? currentPrice + (atr * 3) : currentPrice - (atr * 3);
  
  return {
    id: `${symbol}-${Date.now()}`,
    symbol,
    type,
    strength,
    entryPrice,
    stopLoss,
    takeProfit,
    confidence,
    timestamp: new Date(),
    timeframe: '1H',
    indicators: {
      rsi,
      macd: macd.macd,
      ema20,
      ema50,
      bbUpper: bb.upper,
      bbLower: bb.lower,
    },
    pattern,
    reasoning: `Based on RSI(${rsi.toFixed(1)}), EMA crossover, MACD histogram(${macd.histogram.toFixed(4)}), and ${pattern || 'price action'}`,
  };
}

export function useAISignals(
  prices: Map<string, CryptoPair>, 
  _klineData: Map<string, any[]>,
  minAccuracy: number = 80
) {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const currentIndexRef = useRef(0);
  const priceHistoryRef = useRef<Map<string, number[]>>(new Map());

  // Update price history
  useEffect(() => {
    prices.forEach((pair, symbol) => {
      const history = priceHistoryRef.current.get(symbol) || [];
      history.push(pair.price);
      
      // Keep last 100 prices
      if (history.length > 100) {
        history.shift();
      }
      
      priceHistoryRef.current.set(symbol, history);
    });
  }, [prices]);

  // Generate signals for all pairs
  useEffect(() => {
    const interval = setInterval(() => {
      const newSignals: TradingSignal[] = [];
      
      CRYPTO_PAIRS.forEach(symbol => {
        const pair = prices.get(symbol);
        const history = priceHistoryRef.current.get(symbol);
        
        if (pair && history && history.length >= 30) {
          const signal = generateSignal(symbol, pair.price, history);
          newSignals.push(signal);
        }
      });
      
      setSignals(newSignals);
    }, 30000); // Generate signals every 30 seconds

    return () => clearInterval(interval);
  }, [prices]);

  // Auto-rotate through signals - disabled to prevent UI flicker
  // Users can manually select coins to see signals
  useEffect(() => {
    // Keep current index stable - no auto-rotation
    // This prevents the UI from constantly refreshing
  }, []);

  // Filter signals by minimum accuracy (80%+)
  const highAccuracySignals = signals.filter(s => s.confidence >= minAccuracy);
  
  const currentSignal = highAccuracySignals[currentIndexRef.current % (highAccuracySignals.length || 1)];
  const activeSignals = highAccuracySignals.filter(s => s.type !== 'HOLD');

  const refreshSignal = useCallback((symbol: string) => {
    const pair = prices.get(symbol);
    const history = priceHistoryRef.current.get(symbol);
    
    if (pair && history && history.length >= 30) {
      const newSignal = generateSignal(symbol, pair.price, history);
      setSignals(prev => {
        const filtered = prev.filter(s => s.symbol !== symbol);
        return [...filtered, newSignal];
      });
    }
  }, [prices]);

  return {
    signals,
    currentSignal,
    activeSignals,
    refreshSignal,
  };
}

export default useAISignals;
