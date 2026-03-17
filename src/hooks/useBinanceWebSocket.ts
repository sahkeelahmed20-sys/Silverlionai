import { useEffect, useRef, useState, useCallback } from 'react';
import type { CryptoPair, KlineData } from '@/types';

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
  const [klineData, setKlineData] = useState<Map<string, KlineData[]>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const connectingRef = useRef(false);
  
  // Use refs for prices to avoid re-renders on every tick
  const pricesRef = useRef<Map<string, CryptoPair>>(new Map());
  const pendingUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Batch price updates - only update React state every 1 second max
  const batchPriceUpdate = useCallback(() => {
    if (pendingUpdateRef.current) return;
    
    pendingUpdateRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setPrices(new Map(pricesRef.current));
      }
      pendingUpdateRef.current = null;
    }, 1000); // Throttle to 1 update per second
  }, []);

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
      
      pricesRef.current = newPrices;
      setPrices(newPrices);
    } catch (error) {
      console.error('Failed to fetch 24h tickers:', error);
    }
  }, []);

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

  const connect = useCallback(() => {
    // Prevent multiple concurrent connections
    if (connectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) return;
    if (!isMountedRef.current) return;
    
    connectingRef.current = true;
    
    // Clear any existing socket
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    const streams = CRYPTO_PAIRS.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`${BINANCE_WS_URL}/${streams}`);
    
    ws.onopen = () => {
      console.log('Binance WebSocket connected');
      if (isMountedRef.current) {
        setIsConnected(true);
      }
      connectingRef.current = false;
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      
      const data = JSON.parse(event.data);
      
      if (data.stream && data.data) {
        const ticker = data.data;
        const symbol = ticker.s;
        
        // Update ref immediately (no re-render)
        pricesRef.current.set(symbol, {
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
        
        // Batch React state updates (prevents flickering)
        batchPriceUpdate();
      }
    };

    ws.onclose = () => {
      console.log('Binance WebSocket disconnected');
      if (isMountedRef.current) {
        setIsConnected(false);
      }
      connectingRef.current = false;
      
      // Only reconnect if still mounted
      if (isMountedRef.current && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          if (isMountedRef.current) {
            connect();
          }
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    wsRef.current = ws;
  }, [batchPriceUpdate]);

  useEffect(() => {
    isMountedRef.current = true;
    
    fetch24hTickers();
    connect();
    CRYPTO_PAIRS.forEach(symbol => fetchKlines(symbol));

    return () => {
      isMountedRef.current = false;
      
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on manual close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [fetch24hTickers, connect, fetchKlines]);

  return {
    prices,
    klineData,
    isConnected,
    fetchKlines,
    // Export ref for accessing latest prices without re-render
    pricesRef,
  };
}

export default useBinanceWebSocket;
