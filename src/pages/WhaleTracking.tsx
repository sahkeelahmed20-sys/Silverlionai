import { WhaleAlert } from '@/components/WhaleAlert';
import type { WhaleTransaction } from '@/types';

interface WhaleTrackingProps {
  transactions: WhaleTransaction[];
  stats: {
    totalInflow: number;
    totalOutflow: number;
    netFlow: number;
    transactionCount: number;
  };
}

export function WhaleTracking({ transactions, stats }: WhaleTrackingProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Whale Tracking</h1>
        <p className="text-gray-400">Monitor large Bitcoin transactions and whale movements</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-white/10">
          <h3 className="text-sm text-gray-400 mb-2">What is Whale Tracking?</h3>
          <p className="text-sm text-gray-500">
            Whale tracking monitors large cryptocurrency transactions (typically over $1M) 
            that can indicate significant market movements by major holders.
          </p>
        </div>
        
        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-white/10">
          <h3 className="text-sm text-gray-400 mb-2">Why It Matters</h3>
          <p className="text-sm text-gray-500">
            Large transactions often precede major price movements. Inflows to exchanges 
            may indicate selling pressure, while outflows suggest accumulation.
          </p>
        </div>
        
        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-white/10">
          <h3 className="text-sm text-gray-400 mb-2">How to Use</h3>
          <p className="text-sm text-gray-500">
            Watch for patterns in whale behavior. Sustained inflows may signal a potential 
            dump, while consistent outflows could indicate bullish accumulation.
          </p>
        </div>
      </div>

      {/* Whale Alert Component */}
      <WhaleAlert transactions={transactions} stats={stats} />
    </div>
  );
}

export default WhaleTracking;
