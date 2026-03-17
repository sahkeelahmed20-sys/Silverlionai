import { useEffect, useRef, useState, useCallback } from 'react';
import type { CryptoPair, KlineData } from '@/types';
// OrderBook type reserved for future order book implementation

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
const BINANCE_API_URL = 'https://api.binance.com/api/v3';

export const CRYPTO_PAIRS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'DOTUSDT',
  'MATICUSDT',
  'LINKUSDT',
];

export function useBinanceWebSocket() {
  const [prices, setPrices] = useState<Map<string, CryptoPair>>(new Map());
  // Order books state - reserved for future implementation
  // const [orderBooks, setOrderBooks] = useState<Map<string, OrderBook>>(new Map());
  const [klineData, setKlineData] = useState<Map<string, KlineData[]>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch initial 24h ticker data
  const fetch24hTickers = useCallback(async () => {
    try {
      const response = await fetch(`${BINANCE_API_URL}/ticker/24hr?symbols=${JSON.stringify(CRYPTO_PAIRS)}`);
      const data = await response.json();
      
      const newPrices = new Map<string, CryptoPair>();
      data.forEach((ticker: any) => {
        newPrices.set(ticker.symbol, {
          symbol: ticker.symbol,
          baseAsset: ticker.symbol.replace('USDT', ''),
          quoteAsset: 'USDT',
          price: parseFloat(ticker.lastPrice),
          priceChange24h: parseFloat(ticker.priceChange),
          priceChangePercent24h: parseFloat(ticker.priceChangePercent),
          volume24h: parseFloat(ticker.volume),
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice),
          lastUpdate: ticker.closeTime,
        });
      });
      setPrices(newPrices);
    } catch (error) {
      console.error('Failed to fetch 24h tickers:', error);
    }
  }, []);

  // Fetch historical klines
  const fetchKlines = useCallback(async (symbol: string, interval: string = '1h', limit: number = 100) => {
    try {
      const response = await fetch(`${BINANCE_API_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
      const data = await response.json();
      
      const klines: KlineData[] = data.map((k: any[]) => ({
        openTime: k[0],
        open: k[1],
        high: k[2],
        low: k[3],
        close: k[4],
        volume: k[5],
        closeTime: k[6],
      }));

      setKlineData(prev => {
        const newMap = new Map(prev);
        newMap.set(symbol, klines);
        return newMap;
      });
    } catch (error) {
      console.error(`Failed to fetch klines for ${symbol}:`, error);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Create combined stream for all pairs
    const streams = CRYPTO_PAIRS.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`${BINANCE_WS_URL}/${streams}`);
    
    ws.onopen = () => {
      console.log('Binance WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.stream && data.data) {
        const ticker = data.data;
        const symbol = ticker.s;
        
        setPrices(prev => {
          const newMap = new Map(prev);
          
          newMap.set(symbol, {
            symbol: symbol,
            baseAsset: symbol.replace('USDT', ''),
            quoteAsset: 'USDT',
            price: parseFloat(ticker.c),
            priceChange24h: parseFloat(ticker.p),
            priceChangePercent24h: parseFloat(ticker.P),
            volume24h: parseFloat(ticker.v),
            high24h: parseFloat(ticker.h),
            low24h: parseFloat(ticker.l),
            lastUpdate: ticker.E,
          });
          
          return newMap;
        });
      }
    };

    ws.onclose = () => {
      console.log('Binance WebSocket disconnected');
      setIsConnected(false);
      
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  // Subscribe to order book depth
  const subscribeToOrderBook = useCallback((_symbol: string) => {
    // const streamName = `${symbol.toLowerCase()}@depth20@100ms`;
    // Note: For combined streams, we'd need to reconnect with new streams
    // This is simplified for demo purposes
  }, []);

  useEffect(() => {
    fetch24hTickers();
    connect();

    // Fetch initial klines for all pairs
    CRYPTO_PAIRS.forEach(symbol => fetchKlines(symbol));

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [fetch24hTickers, connect, fetchKlines]);

  return {
    prices,
    klineData,
    isConnected,
    fetchKlines,
    subscribeToOrderBook,
  };
}

export default useBinanceWebSocket;
