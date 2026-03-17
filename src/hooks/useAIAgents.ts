import { useState, useEffect, useCallback } from 'react';
import type { AIAgent, AgentMessage, AgentType, AgentStatus } from '@/types';

const INITIAL_AGENTS: AIAgent[] = [
  {
    id: 'risk-manager',
    name: 'RiskManager',
    type: 'RiskManager',
    status: 'idle',
    confidence: 92,
    lastAction: 'Portfolio risk assessment complete',
    lastActionTime: new Date(),
    performance: 94,
    messageCount: 1247,
  },
  {
    id: 'strategist',
    name: 'Strategist',
    type: 'Strategist',
    status: 'analyzing',
    confidence: 88,
    lastAction: 'Analyzing BTC trend patterns',
    lastActionTime: new Date(),
    performance: 89,
    messageCount: 2156,
  },
  {
    id: 'analyst',
    name: 'Analyst',
    type: 'Analyst',
    status: 'analyzing',
    confidence: 95,
    lastAction: 'Processing market sentiment data',
    lastActionTime: new Date(),
    performance: 91,
    messageCount: 3421,
  },
  {
    id: 'executor',
    name: 'Executor',
    type: 'Executor',
    status: 'idle',
    confidence: 98,
    lastAction: 'Order execution verified',
    lastActionTime: new Date(),
    performance: 97,
    messageCount: 876,
  },
  {
    id: 'learner',
    name: 'Learner',
    type: 'Learner',
    status: 'learning',
    confidence: 85,
    lastAction: 'Training on new market data',
    lastActionTime: new Date(),
    performance: 87,
    messageCount: 5623,
  },
];

const AGENT_ACTIONS: Record<AgentType, string[]> = {
  RiskManager: [
    'Portfolio risk assessment complete',
    'Stop-loss parameters optimized',
    'Position sizing calculated',
    'Drawdown analysis updated',
    'Risk metrics recalibrated',
  ],
  Strategist: [
    'Analyzing BTC trend patterns',
    'Strategy backtest completed',
    'Entry points identified',
    'Market regime detected',
    'Correlation analysis done',
  ],
  Analyst: [
    'Processing market sentiment data',
    'Technical indicators updated',
    'Pattern recognition complete',
    'Volume analysis finished',
    'Support/resistance levels calculated',
  ],
  Executor: [
    'Order execution verified',
    'Trade confirmation received',
    'Position opened successfully',
    'SL/TP orders placed',
    'Order book scanned',
  ],
  Learner: [
    'Training on new market data',
    'Model weights updated',
    'Prediction accuracy improved',
    'New pattern learned',
    'Algorithm optimized',
  ],
};

export function useAIAgents() {
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [consensusActive, setConsensusActive] = useState(false);

  // Simulate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => {
        const updated = [...prev];
        const randomAgent = updated[Math.floor(Math.random() * updated.length)];
        
        // Update status
        const statuses: AgentStatus[] = ['idle', 'analyzing', 'executing', 'learning'];
        randomAgent.status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Update action
        const actions = AGENT_ACTIONS[randomAgent.type];
        randomAgent.lastAction = actions[Math.floor(Math.random() * actions.length)];
        randomAgent.lastActionTime = new Date();
        randomAgent.messageCount += Math.floor(Math.random() * 5) + 1;
        
        // Slightly vary confidence
        randomAgent.confidence = Math.min(100, Math.max(70, 
          randomAgent.confidence + (Math.random() - 0.5) * 2
        ));
        
        return updated;
      });

      // Add inter-agent message
      if (Math.random() > 0.7) {
        const fromAgent = agents[Math.floor(Math.random() * agents.length)];
        const toAgent = agents[Math.floor(Math.random() * agents.length)];
        
        if (fromAgent.id !== toAgent.id) {
          const messageTypes = ['analysis', 'signal', 'risk', 'execution'] as const;
          const newMessage: AgentMessage = {
            id: Date.now().toString(),
            fromAgent: fromAgent.name,
            toAgent: toAgent.name,
            message: generateAgentMessage(fromAgent.type, toAgent.type),
            timestamp: new Date(),
            type: messageTypes[Math.floor(Math.random() * messageTypes.length)],
          };
          
          setMessages(prev => [newMessage, ...prev].slice(0, 50));
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [agents]);

  // Simulate consensus mechanism
  const triggerConsensus = useCallback(() => {
    setConsensusActive(true);
    
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'consensus' as AgentStatus,
    })));

    // Generate consensus messages
    const consensusMessages: AgentMessage[] = [];
    for (let i = 0; i < 5; i++) {
      const fromAgent = agents[i];
      consensusMessages.push({
        id: `consensus-${Date.now()}-${i}`,
        fromAgent: fromAgent.name,
        toAgent: 'Consensus Bus',
        message: `Voting on trade decision - Confidence: ${fromAgent.confidence.toFixed(1)}%`,
        timestamp: new Date(Date.now() - i * 500),
        type: 'consensus',
      });
    }
    
    setMessages(prev => [...consensusMessages, ...prev].slice(0, 50));

    setTimeout(() => {
      setConsensusActive(false);
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'idle' as AgentStatus,
      })));
    }, 5000);
  }, [agents]);

  // Genetic algorithm evolution simulation
  const evolveStrategy = useCallback(() => {
    setAgents(prev => prev.map(agent => {
      if (agent.type === 'Learner' || agent.type === 'Strategist') {
        return {
          ...agent,
          status: 'learning',
          performance: Math.min(100, agent.performance + Math.random() * 2),
        };
      }
      return agent;
    }));

    setTimeout(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'idle' as AgentStatus,
      })));
    }, 3000);
  }, []);

  return {
    agents,
    messages,
    consensusActive,
    triggerConsensus,
    evolveStrategy,
  };
}

function generateAgentMessage(fromType: AgentType, toType: AgentType): string {
  const messages: Record<string, string[]> = {
    'RiskManager-Strategist': ['Risk level acceptable for strategy execution', 'Position size approved'],
    'Strategist-Analyst': ['Requesting pattern analysis', 'Confirm trend direction'],
    'Analyst-Executor': ['Signal validated, ready for execution', 'Target price confirmed'],
    'Executor-RiskManager': ['Order filled, update risk metrics', 'Position opened successfully'],
    'Learner-Strategist': ['New pattern detected in historical data', 'Model prediction updated'],
    'default': ['Data sync complete', 'Analysis updated', 'Requesting confirmation'],
  };
  
  const key = `${fromType}-${toType}`;
  const msgs = messages[key] || messages['default'];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export default useAIAgents;
