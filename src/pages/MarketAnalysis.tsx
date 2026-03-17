import { useState, useMemo } from 'react';
import { TrendingUp, Activity, BarChart3, Target, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceChart } from '@/components/PriceChart';
import type { MarketAnalysis as MarketAnalysisType, KlineData, CryptoPair } from '@/types';

interface MarketAnalysisProps {
  analysis: Map<string, MarketAnalysisType>;
  klineData: Map<string, KlineData[]>;
  prices: Map<string, CryptoPair>;
}

export function MarketAnalysis({ analysis, klineData, prices }: MarketAnalysisProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const currentAnalysis = analysis.get(selectedSymbol);
  const currentKlines = klineData.get(selectedSymbol) || [];
  
  const analysisArray = useMemo(() => Array.from(analysis.values()), [analysis]);
  const priceArray = useMemo(() => Array.from(prices.values()), [prices]);

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'TRENDING_UP':
        return 'text-green-400';
      case 'TRENDING_DOWN':
        return 'text-red-400';
      case 'RANGING':
        return 'text-yellow-400';
      case 'CHOPPY':
        return 'text-orange-400';
      case 'VOLATILE':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRegimeBgColor = (regime: string) => {
    switch (regime) {
      case 'TRENDING_UP':
        return 'bg-green-500/20 border-green-500/30';
      case 'TRENDING_DOWN':
        return 'bg-red-500/20 border-red-500/30';
      case 'RANGING':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'CHOPPY':
        return 'bg-orange-500/20 border-orange-500/30';
      case 'VOLATILE':
        return 'bg-purple-500/20 border-purple-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'bearish':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  // Loading state
  if (analysisArray.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text">
            Market Analysis
          </h1>
          <p className="text-gray-400 text-sm">Advanced technical analysis and pattern detection</p>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="w-16 h-16 border-2 border-[#ffdf8d]/30 border-t-[#ffdf8d] rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-[#ffdf8d]/50 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
            </div>
            <p className="text-gray-400">Loading market analysis...</p>
            <p className="text-gray-600 text-sm mt-1">Analyzing price patterns and trends</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text">
          Market Analysis
        </h1>
        <p className="text-gray-400 text-sm">Advanced technical analysis and pattern detection</p>
      </div>

      {/* Symbol Selector */}
      <div className="flex flex-wrap gap-2">
        {priceArray.map((pair) => {
          const anal = analysis.get(pair.symbol);
          return (
            <button
              key={pair.symbol}
              onClick={() => setSelectedSymbol(pair.symbol)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all duration-200 ${
                selectedSymbol === pair.symbol
                  ? 'bg-gradient-to-r from-[#ffdf8d]/20 to-[#ffdf8d]/10 border-[#ffdf8d] text-[#ffdf8d]'
                  : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5'
              }`}
            >
              <span className="font-bold text-sm">{pair.symbol.replace('USDT', '')}</span>
              <span className={`text-xs ${pair.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {pair.priceChangePercent24h >= 0 ? '+' : ''}{pair.priceChangePercent24h.toFixed(2)}%
              </span>
              {anal && (
                <div className={`w-2 h-2 rounded-full ${
                  anal.sentiment === 'bullish' ? 'bg-green-400' : 
                  anal.sentiment === 'bearish' ? 'bg-red-400' : 'bg-gray-400'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Current Analysis Cards */}
      {currentAnalysis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#1f1f1f] border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[#ffdf8d]" />
                <span className="text-xs text-gray-400">Market Regime</span>
              </div>
              <p className={`text-sm sm:text-lg font-bold ${getRegimeColor(currentAnalysis.regime)}`}>
                {currentAnalysis.regime.replace(/_/g, ' ')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#1f1f1f] border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#ffdf8d]" />
                <span className="text-xs text-gray-400">Trend Strength</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-white">
                {currentAnalysis.trendStrength.toFixed(1)}%
              </p>
              <div className="w-full bg-black/30 rounded-full h-1.5 mt-2">
                <div
                  className="bg-gradient-to-r from-[#ffdf8d] to-amber-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${currentAnalysis.trendStrength}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#1f1f1f] border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-[#ffdf8d]" />
                <span className="text-xs text-gray-400">Volatility</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-white">
                {currentAnalysis.volatility.toFixed(2)}%
              </p>
              <div className="w-full bg-black/30 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    currentAnalysis.volatility > 5 ? 'bg-red-500' : 
                    currentAnalysis.volatility > 3 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(currentAnalysis.volatility * 10, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#1f1f1f] border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#ffdf8d]" />
                <span className="text-xs text-gray-400">Sentiment</span>
              </div>
              <Badge className={`${getSentimentColor(currentAnalysis.sentiment)} flex items-center gap-1 w-fit`}>
                {getSentimentIcon(currentAnalysis.sentiment)}
                {currentAnalysis.sentiment.toUpperCase()} ({currentAnalysis.sentimentScore.toFixed(0)}%)
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      {currentKlines.length > 0 && currentAnalysis && (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#1f1f1f] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="w-5 h-5 text-[#ffdf8d]" />
              {selectedSymbol.replace('USDT', '')}/USDT Chart
              {currentAnalysis.detectedPattern && (
                <Badge className="bg-[#ffdf8d]/20 text-[#ffdf8d] border-[#ffdf8d]/30">
                  {currentAnalysis.detectedPattern.replace(/_/g, ' ')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PriceChart
              data={currentKlines}
              symbol={selectedSymbol}
              supportLevels={currentAnalysis.supportLevels}
              resistanceLevels={currentAnalysis.resistanceLevels}
              pattern={currentAnalysis.detectedPattern}
            />
          </CardContent>
        </Card>
      )}

      {/* All Markets Overview */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#ffdf8d]" />
          All Markets Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {analysisArray.map((anal) => {
            const price = prices.get(anal.symbol);
            return (
              <Card 
                key={anal.symbol} 
                className={`bg-gradient-to-br from-[#1a1a1a] to-[#1f1f1f] border-white/10 hover:border-white/20 transition-all cursor-pointer ${
                  selectedSymbol === anal.symbol ? 'border-[#ffdf8d]/50' : ''
                }`}
                onClick={() => setSelectedSymbol(anal.symbol)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white">{anal.symbol.replace('USDT', '')}</h4>
                      {price && (
                        <span className={`text-xs ${price.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {price.priceChangePercent24h >= 0 ? '+' : ''}{price.priceChangePercent24h.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <Badge className={`${getSentimentColor(anal.sentiment)} text-xs`}>
                      {anal.sentiment}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Regime:</span>
                      <Badge className={`${getRegimeBgColor(anal.regime)} text-xs ${getRegimeColor(anal.regime)}`}>
                        {anal.regime.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Trend Strength:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-black/30 rounded-full h-1">
                          <div 
                            className="bg-[#ffdf8d] h-1 rounded-full"
                            style={{ width: `${anal.trendStrength}%` }}
                          />
                        </div>
                        <span className="text-white text-xs">{anal.trendStrength.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Volatility:</span>
                      <span className={`text-xs ${
                        anal.volatility > 5 ? 'text-red-400' : 
                        anal.volatility > 3 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {anal.volatility.toFixed(1)}%
                      </span>
                    </div>
                    {anal.detectedPattern && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Pattern:</span>
                        <span className="text-[#ffdf8d] text-xs">{anal.detectedPattern.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>
                  
                  {price && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Price:</span>
                        <span className="text-white font-mono text-sm">
                          ${price.price.toLocaleString(undefined, { 
                            minimumFractionDigits: price.price < 1 ? 4 : 2,
                            maximumFractionDigits: price.price < 1 ? 4 : 2 
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MarketAnalysis;
