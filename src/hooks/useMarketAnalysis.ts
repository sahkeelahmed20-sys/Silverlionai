import { useState, useEffect, useCallback } from 'react';
import type { MarketAnalysis, MarketRegime, PatternType } from '@/types';
import { CRYPTO_PAIRS } from './useBinanceWebSocket';

// Calculate trend strength using ADX-like calculation
function calculateTrendStrength(prices: number[]): number {
  if (prices.length < 14) return 50;
  
  const highs: number[] = [];
  const lows: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    highs.push(Math.max(prices[i] - prices[i-1], 0));
    lows.push(Math.max(prices[i-1] - prices[i], 0));
  }
  
  const avgHigh = highs.slice(-14).reduce((a, b) => a + b) / 14;
  const avgLow = lows.slice(-14).reduce((a, b) => a + b) / 14;
  
  if (avgLow === 0) return 100;
  
  const dx = Math.abs(avgHigh - avgLow) / (avgHigh + avgLow) * 100;
  return Math.min(100, dx);
}

// Calculate volatility
function calculateVolatility(prices: number[]): number {
  if (prices.length < 20) return 0.5;
  
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }
  
  const mean = returns.reduce((a, b) => a + b) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Annualized volatility (approximate)
  return stdDev * Math.sqrt(365) * 100;
}

// Detect market regime
function detectRegime(prices: number[], trendStrength: number, volatility: number): MarketRegime {
  if (prices.length < 20) return 'RANGING';
  
  const sma20 = prices.slice(-20).reduce((a, b) => a + b) / 20;
  const currentPrice = prices[prices.length - 1];
  
  // High volatility = choppy
  if (volatility > 80) return 'VOLATILE';
  
  // Low trend strength = ranging
  if (trendStrength < 25) return 'RANGING';
  
  // Medium trend strength with moderate volatility = choppy
  if (trendStrength < 40 && volatility > 50) return 'CHOPPY';
  
  // Strong trend
  if (trendStrength > 50) {
    return currentPrice > sma20 ? 'TRENDING_UP' : 'TRENDING_DOWN';
  }
  
  return 'RANGING';
}

// Find support and resistance levels
function findSupportResistance(prices: number[]): { support: number[]; resistance: number[] } {
  if (prices.length < 30) {
    const lastPrice = prices[prices.length - 1];
    return {
      support: [lastPrice * 0.95, lastPrice * 0.90],
      resistance: [lastPrice * 1.05, lastPrice * 1.10],
    };
  }
  
  // Find local minima and maxima
  const minima: number[] = [];
  const maxima: number[] = [];
  
  for (let i = 2; i < prices.length - 2; i++) {
    // Local minimum
    if (prices[i] < prices[i-1] && prices[i] < prices[i-2] &&
        prices[i] < prices[i+1] && prices[i] < prices[i+2]) {
      minima.push(prices[i]);
    }
    // Local maximum
    if (prices[i] > prices[i-1] && prices[i] > prices[i-2] &&
        prices[i] > prices[i+1] && prices[i] > prices[i+2]) {
      maxima.push(prices[i]);
    }
  }
  
  // Cluster levels
  const cluster = (levels: number[], tolerance: number = 0.02): number[] => {
    if (levels.length === 0) return [];
    
    const sorted = [...levels].sort((a, b) => a - b);
    const clusters: number[][] = [[sorted[0]]];
    
    for (let i = 1; i < sorted.length; i++) {
      const lastCluster = clusters[clusters.length - 1];
      const lastAvg = lastCluster.reduce((a, b) => a + b) / lastCluster.length;
      
      if (Math.abs(sorted[i] - lastAvg) / lastAvg < tolerance) {
        lastCluster.push(sorted[i]);
      } else {
        clusters.push([sorted[i]]);
      }
    }
    
    return clusters
      .map(c => c.reduce((a, b) => a + b, 0) / c.length)
      .sort((a, b) => a - b);
  };
  
  const currentPrice = prices[prices.length - 1];
  const supportLevels = cluster(minima).filter(l => l < currentPrice).slice(-3);
  const resistanceLevels = cluster(maxima).filter(l => l > currentPrice).slice(0, 3);
  
  return {
    support: supportLevels.length > 0 ? supportLevels : [currentPrice * 0.95, currentPrice * 0.90],
    resistance: resistanceLevels.length > 0 ? resistanceLevels : [currentPrice * 1.05, currentPrice * 1.10],
  };
}

// Detect chart patterns
function detectPattern(prices: number[]): { pattern: PatternType; confidence: number } {
  if (prices.length < 30) return { pattern: 'NONE', confidence: 0 };
  
  const recent = prices.slice(-30);
  const max = Math.max(...recent);
  const min = Math.min(...recent);
  const range = max - min;
  
  // Find peaks and troughs
  const peaks: number[] = [];
  const troughs: number[] = [];
  
  for (let i = 3; i < recent.length - 3; i++) {
    const isPeak = recent[i] > recent[i-1] && recent[i] > recent[i-2] && recent[i] > recent[i-3] &&
                   recent[i] > recent[i+1] && recent[i] > recent[i+2] && recent[i] > recent[i+3];
    const isTrough = recent[i] < recent[i-1] && recent[i] < recent[i-2] && recent[i] < recent[i-3] &&
                     recent[i] < recent[i+1] && recent[i] < recent[i+2] && recent[i] < recent[i+3];
    
    if (isPeak) peaks.push(i);
    if (isTrough) troughs.push(i);
  }
  
  // Head and Shoulders
  if (peaks.length >= 3) {
    const last3Peaks = peaks.slice(-3);
    const p1 = recent[last3Peaks[0]];
    const p2 = recent[last3Peaks[1]];
    const p3 = recent[last3Peaks[2]];
    
    // Middle peak (head) should be higher than shoulders
    if (p2 > p1 && p2 > p3 && Math.abs(p1 - p3) / range < 0.1) {
      return { pattern: 'HEAD_AND_SHOULDERS', confidence: 75 };
    }
  }
  
  // Double Top
  if (peaks.length >= 2) {
    const last2Peaks = peaks.slice(-2);
    const p1 = recent[last2Peaks[0]];
    const p2 = recent[last2Peaks[1]];
    
    if (Math.abs(p1 - p2) / range < 0.05) {
      return { pattern: 'DOUBLE_TOP', confidence: 70 };
    }
  }
  
  // Double Bottom
  if (troughs.length >= 2) {
    const last2Troughs = troughs.slice(-2);
    const t1 = recent[last2Troughs[0]];
    const t2 = recent[last2Troughs[1]];
    
    if (Math.abs(t1 - t2) / range < 0.05) {
      return { pattern: 'DOUBLE_BOTTOM', confidence: 70 };
    }
  }
  
  // Triangle
  if (peaks.length >= 3 && troughs.length >= 3) {
    const recentPeaks = peaks.slice(-3);
    const recentTroughs = troughs.slice(-3);
    
    const peakTrend = recent[recentPeaks[2]] < recent[recentPeaks[0]];
    const troughTrend = recent[recentTroughs[2]] > recent[recentTroughs[0]];
    
    if (peakTrend && troughTrend) {
      return { pattern: 'TRIANGLE', confidence: 65 };
    }
  }
  
  // Cup and Handle (simplified)
  if (troughs.length >= 2) {
    const last2Troughs = troughs.slice(-2);
    const gap = last2Troughs[1] - last2Troughs[0];
    
    if (gap > 10 && gap < 20) {
      const t1 = recent[last2Troughs[0]];
      const t2 = recent[last2Troughs[1]];
      
      if (Math.abs(t1 - t2) / range < 0.08) {
        return { pattern: 'CUP_AND_HANDLE', confidence: 60 };
      }
    }
  }
  
  return { pattern: 'NONE', confidence: 0 };
}

// Calculate sentiment
function calculateSentiment(prices: number[], regime: MarketRegime): { sentiment: 'bullish' | 'bearish' | 'neutral'; score: number } {
  if (prices.length < 10) return { sentiment: 'neutral', score: 50 };
  
  const shortTerm = prices.slice(-5);
  const mediumTerm = prices.slice(-20);
  
  const shortSMA = shortTerm.reduce((a, b) => a + b) / shortTerm.length;
  const mediumSMA = mediumTerm.reduce((a, b) => a + b) / mediumTerm.length;
  
  const priceChange = (prices[prices.length - 1] - prices[prices.length - 10]) / prices[prices.length - 10] * 100;
  
  let score = 50;
  
  if (shortSMA > mediumSMA) score += 15;
  else score -= 15;
  
  if (priceChange > 5) score += 20;
  else if (priceChange > 2) score += 10;
  else if (priceChange < -5) score -= 20;
  else if (priceChange < -2) score -= 10;
  
  if (regime === 'TRENDING_UP') score += 10;
  if (regime === 'TRENDING_DOWN') score -= 10;
  
  score = Math.max(0, Math.min(100, score));
  
  if (score > 60) return { sentiment: 'bullish', score };
  if (score < 40) return { sentiment: 'bearish', score };
  return { sentiment: 'neutral', score };
}

export function useMarketAnalysis(prices: Map<string, number[]>) {
  const [analysis, setAnalysis] = useState<Map<string, MarketAnalysis>>(new Map());

  useEffect(() => {
    const interval = setInterval(() => {
      const newAnalysis = new Map<string, MarketAnalysis>();
      
      CRYPTO_PAIRS.forEach(symbol => {
        const priceHistory = prices.get(symbol);
        
        if (priceHistory && priceHistory.length >= 30) {
          const trendStrength = calculateTrendStrength(priceHistory);
          const volatility = calculateVolatility(priceHistory);
          const regime = detectRegime(priceHistory, trendStrength, volatility);
          const levels = findSupportResistance(priceHistory);
          const pattern = detectPattern(priceHistory);
          const sentiment = calculateSentiment(priceHistory, regime);
          
          newAnalysis.set(symbol, {
            symbol,
            regime,
            trendStrength,
            volatility,
            supportLevels: levels.support,
            resistanceLevels: levels.resistance,
            detectedPattern: pattern.pattern !== 'NONE' ? pattern.pattern : undefined,
            patternConfidence: pattern.confidence,
            sentiment: sentiment.sentiment,
            sentimentScore: sentiment.score,
            timestamp: new Date(),
          });
        }
      });
      
      setAnalysis(newAnalysis);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [prices]);

  const getAnalysis = useCallback((symbol: string): MarketAnalysis | undefined => {
    return analysis.get(symbol);
  }, [analysis]);

  const getAllAnalysis = useCallback((): MarketAnalysis[] => {
    return Array.from(analysis.values());
  }, [analysis]);

  return {
    analysis,
    getAnalysis,
    getAllAnalysis,
  };
}

export default useMarketAnalysis;
