import { Play, Brain, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AgentNetwork } from '@/components/AgentNetwork';
import type { AIAgent, AgentMessage } from '@/types';

interface AgentsProps {
  agents: AIAgent[];
  messages: AgentMessage[];
  consensusActive: boolean;
  onTriggerConsensus: () => void;
  onEvolveStrategy: () => void;
}

export function Agents({
  agents,
  messages,
  consensusActive,
  onTriggerConsensus,
  onEvolveStrategy,
}: AgentsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Agent Framework</h1>
          <p className="text-gray-400">Multi-agent orchestration with genetic algorithm evolution</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={onTriggerConsensus}
            disabled={consensusActive}
            className="bg-[#ffdf8d] text-black hover:bg-[#ffdf8d]/90"
          >
            <Play className="w-4 h-4 mr-2" />
            Trigger Consensus
          </Button>
          <Button
            onClick={onEvolveStrategy}
            variant="outline"
            className="border-white/20 text-gray-400 hover:text-white"
          >
            <Brain className="w-4 h-4 mr-2" />
            Evolve Strategy
          </Button>
        </div>
      </div>

      {/* Framework Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-white">ML Prediction Models</h3>
            </div>
            <p className="text-sm text-gray-400">
              Advanced machine learning models trained on historical market data to predict price movements with high accuracy.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <GitBranch className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-white">Genetic Algorithm</h3>
            </div>
            <p className="text-sm text-gray-400">
              Evolutionary approach to strategy optimization, continuously improving trading parameters through selection and mutation.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Play className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-white">Decision Consensus</h3>
            </div>
            <p className="text-sm text-gray-400">
              Multi-agent voting system where specialized agents collaborate to reach optimal trading decisions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Network */}
      <AgentNetwork
        agents={agents}
        messages={messages}
        consensusActive={consensusActive}
      />

      {/* Agent Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="bg-[#1a1a1a] border-white/10">
            <CardContent className="p-4">
              <h4 className="font-bold text-white mb-2">{agent.name}</h4>
              <p className="text-sm text-gray-400">
                {getAgentDescription(agent.type)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getAgentDescription(type: string): string {
  switch (type) {
    case 'RiskManager':
      return 'Monitors portfolio risk, calculates position sizes, and ensures drawdown limits are respected.';
    case 'Strategist':
      return 'Develops trading strategies, identifies entry/exit points, and optimizes parameters.';
    case 'Analyst':
      return 'Performs technical analysis, detects patterns, and calculates support/resistance levels.';
    case 'Executor':
      return 'Handles order execution, manages slippage, and ensures best price fulfillment.';
    case 'Learner':
      return 'Continuously learns from market data, improves models, and adapts to changing conditions.';
    default:
      return 'Specialized AI agent for trading operations.';
  }
}

export default Agents;
