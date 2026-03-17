import { useState } from 'react';
import { RefreshCw, Filter, Bell, BellOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SignalCard } from '@/components/SignalCard';
import type { TradingSignal, SignalType } from '@/types';

interface SignalsProps {
  signals: TradingSignal[];
  onRefresh: (symbol: string) => void;
}

export function Signals({ signals, onRefresh }: SignalsProps) {
  const [filter, setFilter] = useState<SignalType | 'ALL'>('ALL');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  const filteredSignals = filter === 'ALL' ? signals : signals.filter(s => s.type === filter);

  const signalCounts = {
    ALL: signals.length,
    BUY: signals.filter(s => s.type === 'BUY').length,
    SELL: signals.filter(s => s.type === 'SELL').length,
    HOLD: signals.filter(s => s.type === 'HOLD').length,
  };

  const handleWhatsAppToggle = (enabled: boolean) => {
    setWhatsappEnabled(enabled);
    if (enabled) {
      // In a real app, this would integrate with WhatsApp Business API
      alert('WhatsApp notifications enabled! In production, this would connect to the WhatsApp Business API to send you real-time trading signals.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Trading Signals</h1>
          <p className="text-gray-400">Real-time AI-generated trading recommendations</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <Label htmlFor="notifications" className="text-gray-400">
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="whatsapp"
              checked={whatsappEnabled}
              onCheckedChange={handleWhatsAppToggle}
            />
            <Label htmlFor="whatsapp" className="text-gray-400 text-sm">
              WhatsApp
            </Label>
          </div>
        </div>
      </div>

      {/* Notification Info */}
      {whatsappEnabled && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <p className="text-green-400 text-sm">
              WhatsApp notifications are active! You will receive trading signals directly to your phone.
              To configure your WhatsApp number, go to Settings.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'BUY', 'SELL', 'HOLD'] as const).map((type) => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'outline'}
            onClick={() => setFilter(type)}
            className={`${
              filter === type
                ? 'bg-[#ffdf8d] text-black hover:bg-[#ffdf8d]/90'
                : 'border-white/20 text-gray-400 hover:text-white hover:border-white/40'
            }`}
          >
            {type === 'ALL' && <Filter className="w-4 h-4 mr-2" />}
            {type}
            <Badge variant="secondary" className="ml-2 bg-black/30">
              {signalCounts[type]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSignals.map((signal) => (
          <div key={signal.id} className="relative group">
            <SignalCard signal={signal} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefresh(signal.symbol)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {filteredSignals.length === 0 && (
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 border-2 border-[#ffdf8d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Generating AI signals...</p>
            <p className="text-sm text-gray-600 mt-2">
              Our AI is analyzing market data across all trading pairs
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Signals;
