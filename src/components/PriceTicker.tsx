import { ArrowUp, ArrowDown } from 'lucide-react';
import type { CryptoPair } from '@/types';

interface PriceTickerProps {
  prices: Map<string, CryptoPair>;
}

export function PriceTicker({ prices }: PriceTickerProps) {
  const priceArray = Array.from(prices.values());

  if (priceArray.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-[#1a1a1a] border-y border-white/10 py-3">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-[#ffdf8d] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Connecting to market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-[#1a1a1a] border-y border-white/10">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...priceArray, ...priceArray].map((pair, index) => (
          <div
            key={`${pair.symbol}-${index}`}
            className="flex items-center gap-4 px-6 py-3 border-r border-white/5"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{pair.baseAsset}</span>
              <span className="text-gray-500 text-sm">/USDT</span>
            </div>
            
            <span className="font-mono text-white">
              ${pair.price.toLocaleString(undefined, { 
                minimumFractionDigits: pair.price < 1 ? 4 : 2,
                maximumFractionDigits: pair.price < 1 ? 4 : 2 
              })}
            </span>
            
            <div className={`flex items-center gap-1 ${
              pair.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {pair.priceChangePercent24h >= 0 ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(pair.priceChangePercent24h).toFixed(2)}%
              </span>
            </div>
            
            <div className="text-gray-500 text-sm">
              Vol: ${(pair.volume24h * pair.price / 1e6).toFixed(2)}M
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PriceTicker;
