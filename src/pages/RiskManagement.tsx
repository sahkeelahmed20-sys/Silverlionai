import { useState } from 'react';
import { Shield, AlertTriangle, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { RiskSettings } from '@/types';

interface RiskManagementProps {
  settings: RiskSettings;
  onUpdateSettings: (settings: Partial<RiskSettings>) => void;
}

export function RiskManagement({ settings, onUpdateSettings }: RiskManagementProps) {
  const [localSettings, setLocalSettings] = useState<RiskSettings>(settings);

  const handleSave = () => {
    onUpdateSettings(localSettings);
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Risk Management</h1>
        <p className="text-gray-400">Configure your trading risk parameters</p>
      </div>

      {/* Risk Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-400">Risk Warning</h4>
          <p className="text-sm text-amber-400/80">
            Trading cryptocurrencies carries significant risk. These settings help manage risk 
            but cannot eliminate it entirely. Never trade with more than you can afford to lose.
          </p>
        </div>
      </div>

      {/* Risk Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stop Loss */}
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-[#ffdf8d]" />
              Stop Loss
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="stop-loss" className="text-gray-400">Enable Stop Loss</Label>
              <Switch
                id="stop-loss"
                checked={localSettings.stopLossEnabled}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, stopLossEnabled: checked }))
                }
              />
            </div>
            <p className="text-sm text-gray-500">
              Automatically close positions when price reaches your stop loss level.
            </p>
          </CardContent>
        </Card>

        {/* Take Profit */}
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Check className="w-5 h-5 text-green-400" />
              Take Profit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="take-profit" className="text-gray-400">Enable Take Profit</Label>
              <Switch
                id="take-profit"
                checked={localSettings.takeProfitEnabled}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, takeProfitEnabled: checked }))
                }
              />
            </div>
            <p className="text-sm text-gray-500">
              Automatically close positions when price reaches your take profit target.
            </p>
          </CardContent>
        </Card>

        {/* Trailing Stop */}
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-blue-400" />
              Trailing Stop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="trailing-stop" className="text-gray-400">Enable Trailing Stop</Label>
              <Switch
                id="trailing-stop"
                checked={localSettings.trailingStopEnabled}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, trailingStopEnabled: checked }))
                }
              />
            </div>
            <p className="text-sm text-gray-500">
              Stop loss that moves with price to lock in profits as the trade goes in your favor.
            </p>
          </CardContent>
        </Card>

        {/* Auto Hedge */}
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-purple-400" />
              Auto Hedge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-hedge" className="text-gray-400">Enable Auto Hedge</Label>
              <Switch
                id="auto-hedge"
                checked={localSettings.autoHedgeEnabled}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, autoHedgeEnabled: checked }))
                }
              />
            </div>
            <p className="text-sm text-gray-500">
              Automatically open opposing positions to reduce portfolio risk during high volatility.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leverage Settings */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Leverage Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-gray-400">Maximum Leverage</Label>
              <span className="text-white font-bold">{localSettings.maxLeverage}x</span>
            </div>
            <Slider
              value={[localSettings.maxLeverage]}
              onValueChange={(v) => setLocalSettings(prev => ({ ...prev, maxLeverage: v[0] }))}
              min={1}
              max={125}
              step={1}
            />
            <p className="text-sm text-gray-500 mt-2">
              Maximum leverage allowed for any single position.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Position Sizing */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Position Sizing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-gray-400">Maximum Position Size (% of balance)</Label>
              <span className="text-white font-bold">{localSettings.maxPositionSize}%</span>
            </div>
            <Slider
              value={[localSettings.maxPositionSize]}
              onValueChange={(v) => setLocalSettings(prev => ({ ...prev, maxPositionSize: v[0] }))}
              min={1}
              max={100}
              step={1}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-gray-400">Risk Per Trade (% of balance)</Label>
              <span className="text-white font-bold">{localSettings.riskPerTrade}%</span>
            </div>
            <Slider
              value={[localSettings.riskPerTrade]}
              onValueChange={(v) => setLocalSettings(prev => ({ ...prev, riskPerTrade: v[0] }))}
              min={0.1}
              max={10}
              step={0.1}
            />
            <p className="text-sm text-gray-500 mt-2">
              Maximum amount to risk on any single trade.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Loss Limit */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Daily Loss Limit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-gray-400">Maximum Daily Loss (% of balance)</Label>
              <span className="text-white font-bold">{localSettings.maxDailyLoss}%</span>
            </div>
            <Slider
              value={[localSettings.maxDailyLoss]}
              onValueChange={(v) => setLocalSettings(prev => ({ ...prev, maxDailyLoss: v[0] }))}
              min={1}
              max={50}
              step={1}
            />
            <p className="text-sm text-gray-500 mt-2">
              Trading will be halted if daily losses exceed this limit.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSave} className="bg-[#ffdf8d] text-black hover:bg-[#ffdf8d]/90">
          <Check className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
        <Button onClick={handleReset} variant="outline" className="border-white/20 text-gray-400">
          Reset Changes
        </Button>
      </div>
    </div>
  );
}

export default RiskManagement;
