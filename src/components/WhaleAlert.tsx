import { ArrowDownLeft, ArrowUpRight, Fish } from 'lucide-react';
import type { WhaleTransaction } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface WhaleAlertProps {
  transactions: WhaleTransaction[];
  stats: {
    totalInflow: number;
    totalOutflow: number;
    netFlow: number;
    transactionCount: number;
  };
}

export function WhaleAlert({ transactions, stats }: WhaleAlertProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatValue = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Total Inflow</p>
            <p className="text-2xl font-bold text-green-400">
              {formatValue(stats.totalInflow)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Total Outflow</p>
            <p className="text-2xl font-bold text-red-400">
              {formatValue(stats.totalOutflow)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Net Flow</p>
            <p className={`text-2xl font-bold ${
              stats.netFlow >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats.netFlow >= 0 ? '+' : ''}{formatValue(stats.netFlow)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-white">
              {stats.transactionCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Whale Transactions */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Fish className="w-5 h-5 text-[#ffdf8d]" />
            <h4 className="font-bold text-white">Live Whale Transactions</h4>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No whale transactions detected...</p>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${
                      tx.type === 'inflow'
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${
                      tx.type === 'inflow' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {tx.type === 'inflow' ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">{tx.amount.toFixed(2)} BTC</span>
                        <Badge 
                          variant="outline" 
                          className={tx.type === 'inflow' 
                            ? 'border-green-500/30 text-green-400' 
                            : 'border-red-500/30 text-red-400'
                          }
                        >
                          {tx.type === 'inflow' ? 'Inflow' : 'Outflow'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>From: {formatAddress(tx.from)}</span>
                        <span>To: {formatAddress(tx.to)}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-white">{formatValue(tx.valueUSD)}</p>
                      <p className="text-xs text-gray-500">
                        {tx.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default WhaleAlert;
