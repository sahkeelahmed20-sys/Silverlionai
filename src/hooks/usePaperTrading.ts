import { useState, useCallback, useEffect } from 'react';
import type { PaperTrade, PaperTradingAccount, DemoTradingSettings } from '@/types';

const STORAGE_KEY = 'silver_lion_paper_trading';
const SETTINGS_KEY = 'silver_lion_demo_settings';

const DEFAULT_ACCOUNT: PaperTradingAccount = {
  balance: 10000,
  initialBalance: 10000,
  totalPnl: 0,
  totalPnlPercent: 0,
  openPositions: [],
  tradeHistory: [],
};

const DEFAULT_SETTINGS: DemoTradingSettings = {
  initialBalance: 10000,
  defaultLeverage: 100,
  tradeAmount: 100,
  minSignalAccuracy: 80,
};

export function usePaperTrading() {
  const [account, setAccount] = useState<PaperTradingAccount>(DEFAULT_ACCOUNT);
  const [settings, setSettings] = useState<DemoTradingSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Update account when initial balance setting changes
  useEffect(() => {
    setAccount(prev => ({
      ...prev,
      balance: settings.initialBalance,
      initialBalance: settings.initialBalance,
    }));
  }, [settings.initialBalance]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAccount({
          ...parsed,
          openPositions: parsed.openPositions.map((p: any) => ({
            ...p,
            openedAt: new Date(p.openedAt),
            closedAt: p.closedAt ? new Date(p.closedAt) : undefined,
          })),
          tradeHistory: parsed.tradeHistory.map((t: any) => ({
            ...t,
            openedAt: new Date(t.openedAt),
            closedAt: t.closedAt ? new Date(t.closedAt) : undefined,
          })),
        });
      } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNT));
      }
    }
  }, []);

  // Save to localStorage whenever account changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  }, [account]);

  const openPosition = useCallback((
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    entryPrice: number,
    leverage: number = 1,
    stopLoss?: number,
    takeProfit?: number
  ): boolean => {
    const marginRequired = (quantity * entryPrice) / leverage;
    
    if (marginRequired > account.balance) {
      return false;
    }

    const newTrade: PaperTrade = {
      id: Date.now().toString(),
      symbol,
      side,
      quantity,
      entryPrice,
      stopLoss,
      takeProfit,
      leverage,
      status: 'OPEN',
      openedAt: new Date(),
    };

    setAccount(prev => ({
      ...prev,
      balance: prev.balance - marginRequired,
      openPositions: [...prev.openPositions, newTrade],
    }));

    return true;
  }, [account.balance]);

  const closePosition = useCallback((tradeId: string, exitPrice: number) => {
    setAccount(prev => {
      const position = prev.openPositions.find(p => p.id === tradeId);
      if (!position) return prev;

      const margin = (position.quantity * position.entryPrice) / position.leverage;
      
      // Calculate PnL
      let pnl = 0;
      if (position.side === 'BUY') {
        pnl = (exitPrice - position.entryPrice) * position.quantity;
      } else {
        pnl = (position.entryPrice - exitPrice) * position.quantity;
      }
      
      // Apply leverage
      pnl *= position.leverage;
      const pnlPercent = (pnl / margin) * 100;

      const closedTrade: PaperTrade = {
        ...position,
        exitPrice,
        pnl,
        pnlPercent,
        status: 'CLOSED',
        closedAt: new Date(),
      };

      const newBalance = prev.balance + margin + pnl;
      const totalPnl = prev.totalPnl + pnl;
      const totalPnlPercent = (totalPnl / prev.initialBalance) * 100;

      return {
        ...prev,
        balance: newBalance,
        totalPnl,
        totalPnlPercent,
        openPositions: prev.openPositions.filter(p => p.id !== tradeId),
        tradeHistory: [closedTrade, ...prev.tradeHistory],
      };
    });
  }, []);

  const updatePositions = useCallback((currentPrices: Map<string, number>) => {
    setAccount(prev => {
      const updatedPositions = prev.openPositions.map(position => {
        const currentPrice = currentPrices.get(position.symbol);
        if (!currentPrice) return position;

        let unrealizedPnl = 0;
        if (position.side === 'BUY') {
          unrealizedPnl = (currentPrice - position.entryPrice) * position.quantity;
        } else {
          unrealizedPnl = (position.entryPrice - currentPrice) * position.quantity;
        }
        unrealizedPnl *= position.leverage;

        // Check stop loss
        if (position.stopLoss) {
          if (position.side === 'BUY' && currentPrice <= position.stopLoss) {
            return { ...position, shouldClose: true, closePrice: position.stopLoss };
          }
          if (position.side === 'SELL' && currentPrice >= position.stopLoss) {
            return { ...position, shouldClose: true, closePrice: position.stopLoss };
          }
        }

        // Check take profit
        if (position.takeProfit) {
          if (position.side === 'BUY' && currentPrice >= position.takeProfit) {
            return { ...position, shouldClose: true, closePrice: position.takeProfit };
          }
          if (position.side === 'SELL' && currentPrice <= position.takeProfit) {
            return { ...position, shouldClose: true, closePrice: position.takeProfit };
          }
        }

        return { ...position, unrealizedPnl };
      });

      // Auto-close triggered positions
      const positionsToClose = updatedPositions.filter((p: any) => p.shouldClose);
      const remainingPositions = updatedPositions.filter((p: any) => !p.shouldClose);

      let newBalance = prev.balance;
      let newTotalPnl = prev.totalPnl;
      const newTradeHistory = [...prev.tradeHistory];

      positionsToClose.forEach((position: any) => {
        const margin = (position.quantity * position.entryPrice) / position.leverage;
        const realizedPnl = position.unrealizedPnl || 0;
        
        const closedTrade: PaperTrade = {
          ...position,
          exitPrice: position.closePrice,
          pnl: realizedPnl,
          pnlPercent: (realizedPnl / margin) * 100,
          status: 'CLOSED',
          closedAt: new Date(),
        };

        newBalance += margin + realizedPnl;
        newTotalPnl += realizedPnl;
        newTradeHistory.unshift(closedTrade);
      });

      return {
        ...prev,
        balance: newBalance,
        totalPnl: newTotalPnl,
        totalPnlPercent: (newTotalPnl / prev.initialBalance) * 100,
        openPositions: remainingPositions,
        tradeHistory: newTradeHistory,
      };
    });
  }, []);

  const resetAccount = useCallback(() => {
    setAccount({
      ...DEFAULT_ACCOUNT,
      balance: settings.initialBalance,
      initialBalance: settings.initialBalance,
    });
  }, [settings.initialBalance]);

  const updateSettings = useCallback((newSettings: Partial<DemoTradingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getUnrealizedPnl = useCallback(() => {
    return account.openPositions.reduce((total, position: any) => {
      return total + (position.unrealizedPnl || 0);
    }, 0);
  }, [account.openPositions]);

  return {
    account,
    settings,
    openPosition,
    closePosition,
    updatePositions,
    resetAccount,
    getUnrealizedPnl,
    updateSettings,
  };
}

export default usePaperTrading;
