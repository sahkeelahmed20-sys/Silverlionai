import { useState, useEffect, useCallback } from 'react';
import type { WhaleTransaction } from '@/types';

// Whale transaction thresholds (in USD)
// const WHALE_THRESHOLD = 1000000; // $1M - used for filtering large transactions

// Mock whale addresses for demo
const WHALE_ADDRESSES = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0x8ba1f109551bD432803012645Hac136c82C3e8C',
  '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
];

// Generate mock whale transaction
function generateWhaleTransaction(): WhaleTransaction {
  const isInflow = Math.random() > 0.5;
  const amount = (Math.random() * 500 + 50); // 50-550 BTC
  const btcPrice = 65000 + (Math.random() - 0.5) * 10000;
  const valueUSD = amount * btcPrice;
  
  const from = isInflow 
    ? `0x${Math.random().toString(16).substr(2, 40)}`
    : WHALE_ADDRESSES[Math.floor(Math.random() * WHALE_ADDRESSES.length)];
    
  const to = isInflow
    ? WHALE_ADDRESSES[Math.floor(Math.random() * WHALE_ADDRESSES.length)]
    : `0x${Math.random().toString(16).substr(2, 40)}`;

  return {
    id: `whale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    symbol: 'BTC',
    from,
    to,
    amount,
    valueUSD,
    timestamp: new Date(),
    txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    type: isInflow ? 'inflow' : 'outflow',
  };
}

export function useWhaleTracking() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [stats, setStats] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    netFlow: 0,
    transactionCount: 0,
  });

  // Generate initial transactions
  useEffect(() => {
    const initial: WhaleTransaction[] = [];
    for (let i = 0; i < 10; i++) {
      const tx = generateWhaleTransaction();
      tx.timestamp = new Date(Date.now() - i * 60000); // Spread over last 10 minutes
      initial.push(tx);
    }
    setTransactions(initial);
  }, []);

  // Simulate new whale transactions
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance every 5 seconds
        const newTx = generateWhaleTransaction();
        
        setTransactions(prev => [newTx, ...prev].slice(0, 50));
        
        // Update stats
        setStats(prev => {
          const inflow = newTx.type === 'inflow' ? newTx.valueUSD : 0;
          const outflow = newTx.type === 'outflow' ? newTx.valueUSD : 0;
          
          return {
            totalInflow: prev.totalInflow + inflow,
            totalOutflow: prev.totalOutflow + outflow,
            netFlow: prev.netFlow + inflow - outflow,
            transactionCount: prev.transactionCount + 1,
          };
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate stats from current transactions
  useEffect(() => {
    const stats = transactions.reduce((acc, tx) => {
      if (tx.type === 'inflow') {
        acc.totalInflow += tx.valueUSD;
      } else {
        acc.totalOutflow += tx.valueUSD;
      }
      return acc;
    }, { totalInflow: 0, totalOutflow: 0, netFlow: 0, transactionCount: transactions.length });
    
    stats.netFlow = stats.totalInflow - stats.totalOutflow;
    setStats(stats);
  }, [transactions]);

  const getRecentTransactions = useCallback((limit: number = 10) => {
    return transactions.slice(0, limit);
  }, [transactions]);

  const getLargestTransactions = useCallback((limit: number = 5) => {
    return [...transactions]
      .sort((a, b) => b.valueUSD - a.valueUSD)
      .slice(0, limit);
  }, [transactions]);

  return {
    transactions,
    stats,
    getRecentTransactions,
    getLargestTransactions,
  };
}

export default useWhaleTracking;
