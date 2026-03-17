import { Brain, Shield, TrendingUp, Zap, Database, MessageSquare } from 'lucide-react';
import type { AIAgent, AgentMessage } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface AgentNetworkProps {
  agents: AIAgent[];
  messages: AgentMessage[];
  consensusActive: boolean;
}

const agentIcons: Record<string, React.ElementType> = {
  RiskManager: Shield,
  Strategist: TrendingUp,
  Analyst: Brain,
  Executor: Zap,
  Learner: Database,
};

const agentColors: Record<string, string> = {
  RiskManager: 'from-red-500/20 to-red-600/20 border-red-500/30',
  Strategist: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  Analyst: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  Executor: 'from-green-500/20 to-green-600/20 border-green-500/30',
  Learner: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
};

const statusColors: Record<string, string> = {
  idle: 'bg-gray-500',
  analyzing: 'bg-blue-500 animate-pulse',
  executing: 'bg-green-500 animate-pulse',
  learning: 'bg-amber-500 animate-pulse',
  consensus: 'bg-[#ffdf8d] animate-pulse',
};

export function AgentNetwork({ agents, messages, consensusActive }: AgentNetworkProps) {
  return (
    <div className="space-y-6">
      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {agents.map((agent) => {
          const Icon = agentIcons[agent.name] || Brain;
          return (
            <Card
              key={agent.id}
              className={`bg-gradient-to-br ${agentColors[agent.name]} border backdrop-blur-sm transition-all duration-300 ${
                agent.status === 'analyzing' || agent.status === 'executing' || agent.status === 'learning'
                  ? 'scale-105 shadow-lg'
                  : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-black/30`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
                </div>
                
                <h4 className="font-bold text-white mb-1">{agent.name}</h4>
                <p className="text-xs text-gray-400 mb-3 capitalize">{agent.status}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Confidence</span>
                    <span className="text-white font-mono">{agent.confidence.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-[#ffdf8d] to-amber-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${agent.confidence}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Performance</span>
                    <span className="text-green-400 font-mono">{agent.performance.toFixed(0)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Messages: {agent.messageCount.toLocaleString()}</span>
                  </div>
                </div>
                
                <p className="mt-3 text-xs text-gray-400 line-clamp-2">
                  {agent.lastAction}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Consensus Indicator */}
      {consensusActive && (
        <div className="flex items-center justify-center gap-3 p-4 bg-[#ffdf8d]/10 rounded-lg border border-[#ffdf8d]/30 animate-pulse">
          <div className="w-3 h-3 bg-[#ffdf8d] rounded-full animate-bounce" />
          <span className="text-[#ffdf8d] font-medium">Consensus Algorithm Active - Agents Voting...</span>
        </div>
      )}

      {/* Agent Communication Log */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[#ffdf8d]" />
            <h4 className="font-bold text-white">Agent Communication Bus</h4>
          </div>
          
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet...</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-black/30 text-sm"
                  >
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[#ffdf8d] font-medium">{msg.fromAgent}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-blue-400">{msg.toAgent}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300">{msg.message}</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-white/20 text-gray-500">
                      {msg.type}
                    </Badge>
                    <span className="text-xs text-gray-600">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
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

export default AgentNetwork;
