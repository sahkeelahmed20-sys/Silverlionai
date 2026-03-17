import { useState } from 'react';
import { AlertTriangle, Link, Lock, Unlock, Wallet, Key, ExternalLink, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

export function LiveTrading() {
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [testMode, setTestMode] = useState(true);
  const [autoTrade, setAutoTrade] = useState(false);
  const [minConfidence, setMinConfidence] = useState(85);

  const handleConnect = () => {
    if (!apiKey || !apiSecret) {
      alert('Please enter both API Key and Secret');
      return;
    }
    // Simulate connection
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey('');
    setApiSecret('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Live Trading</h1>
        <p className="text-gray-400">Connect your exchange API for automated trading</p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-400">Important Security Notice</h4>
          <p className="text-sm text-amber-400/80">
            Your API keys are stored locally in your browser and never sent to our servers. 
            We recommend using API keys with trading permissions only (not withdrawal). 
            Always enable IP restrictions on your exchange API keys.
          </p>
        </div>
      </div>

      <Tabs defaultValue="connect" className="w-full">
        <TabsList className="bg-[#1a1a1a] border border-white/10">
          <TabsTrigger value="connect">Connect Exchange</TabsTrigger>
          <TabsTrigger value="settings" disabled={!isConnected}>Trading Settings</TabsTrigger>
          <TabsTrigger value="positions" disabled={!isConnected}>Open Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="mt-4 space-y-4">
          {/* Exchange Selection */}
          <Card className="bg-[#1a1a1a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Link className="w-5 h-5 text-[#ffdf8d]" />
                Select Exchange
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'binance', name: 'Binance', logo: 'B' },
                  { id: 'bybit', name: 'Bybit', logo: 'BB' },
                  { id: 'okx', name: 'OKX', logo: 'O' },
                  { id: 'kucoin', name: 'KuCoin', logo: 'K' },
                ].map((exchange) => (
                  <button
                    key={exchange.id}
                    onClick={() => setSelectedExchange(exchange.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedExchange === exchange.id
                        ? 'bg-[#ffdf8d]/20 border-[#ffdf8d]'
                        : 'bg-black/30 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="w-10 h-10 bg-[#ffdf8d] rounded-full flex items-center justify-center text-black font-bold mx-auto mb-2">
                      {exchange.logo}
                    </div>
                    <p className="text-white text-center">{exchange.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Connection */}
          <Card className="bg-[#1a1a1a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {isConnected ? <Unlock className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-[#ffdf8d]" />}
                API Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <>
                  <div>
                    <Label className="text-gray-400">API Key</Label>
                    <div className="relative mt-1">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        type={showKeys ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API Key"
                        className="pl-10 bg-black/30 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-400">API Secret</Label>
                    <div className="relative mt-1">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        type={showKeys ? 'text' : 'password'}
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder="Enter your API Secret"
                        className="pl-10 bg-black/30 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showKeys}
                      onCheckedChange={setShowKeys}
                    />
                    <Label className="text-gray-400 text-sm">Show API Keys</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={testMode}
                      onCheckedChange={setTestMode}
                    />
                    <Label className="text-gray-400 text-sm">Test Mode (Paper Trading)</Label>
                  </div>

                  <Button
                    onClick={handleConnect}
                    className="w-full bg-[#ffdf8d] text-black hover:bg-[#ffdf8d]/90"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Connect Exchange
                  </Button>

                  <a
                    href={`https://www.${selectedExchange}.com/en/support/faq/how-to-create-api-keys-360002502072`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-sm text-[#ffdf8d] hover:underline"
                  >
                    How to create API keys?
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-bold text-lg">Connected to {selectedExchange.charAt(0).toUpperCase() + selectedExchange.slice(1)}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {testMode ? 'Running in test mode (paper trading)' : 'Live trading enabled'}
                  </p>
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Disconnect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card className="bg-[#1a1a1a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Auto Trading Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Auto Execute Signals</p>
                  <p className="text-sm text-gray-500">Automatically execute high-confidence signals</p>
                </div>
                <Switch
                  checked={autoTrade}
                  onCheckedChange={setAutoTrade}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-gray-400">Minimum Signal Confidence</Label>
                  <span className="text-white font-bold">{minConfidence}%</span>
                </div>
                <input
                  type="range"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                  min={50}
                  max={95}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only execute signals with this confidence level or higher
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="text-sm text-gray-500">Trade Amount</p>
                  <p className="text-white font-bold">$100 USDT</p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="text-sm text-gray-500">Max Leverage</p>
                  <p className="text-white font-bold">20x</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="mt-4">
          <Card className="bg-[#1a1a1a] border-white/10">
            <CardContent className="p-8 text-center">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No open positions</p>
              <p className="text-sm text-gray-600 mt-2">
                Connect your exchange and enable auto-trading to see positions
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supported Features */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Supported Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Spot Trading', status: 'available' },
              { name: 'Futures Trading', status: 'available' },
              { name: 'Margin Trading', status: 'coming' },
              { name: 'Stop Loss / Take Profit', status: 'available' },
              { name: 'Trailing Stop', status: 'coming' },
              { name: 'OCO Orders', status: 'available' },
            ].map((feature) => (
              <div key={feature.name} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <span className="text-white">{feature.name}</span>
                <Badge className={
                  feature.status === 'available' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-amber-500/20 text-amber-400'
                }>
                  {feature.status === 'available' ? 'Available' : 'Coming Soon'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LiveTrading;
