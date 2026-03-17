import { useState, useCallback } from 'react';
import type { ChatMessage, TokenAnalysis, SignalType } from '@/types';

// Mock token database
const TOKEN_DATABASE: Record<string, { name: string; symbol: string; description: string }> = {
  'BTC': { name: 'Bitcoin', symbol: 'BTC', description: 'The first and largest cryptocurrency by market cap.' },
  'ETH': { name: 'Ethereum', symbol: 'ETH', description: 'A decentralized platform for smart contracts and dApps.' },
  'SOL': { name: 'Solana', symbol: 'SOL', description: 'High-performance blockchain with fast transactions.' },
  'BNB': { name: 'Binance Coin', symbol: 'BNB', description: 'Native token of the Binance ecosystem.' },
  'XRP': { name: 'Ripple', symbol: 'XRP', description: 'Digital payment protocol for fast transactions.' },
  'ADA': { name: 'Cardano', symbol: 'ADA', description: 'Proof-of-stake blockchain platform.' },
  'DOGE': { name: 'Dogecoin', symbol: 'DOGE', description: 'Meme-inspired cryptocurrency with strong community.' },
  'DOT': { name: 'Polkadot', symbol: 'DOT', description: 'Multi-chain protocol connecting blockchains.' },
  'MATIC': { name: 'Polygon', symbol: 'MATIC', description: 'Layer 2 scaling solution for Ethereum.' },
  'LINK': { name: 'Chainlink', symbol: 'LINK', description: 'Decentralized oracle network.' },
};

// Generate mock token analysis
function generateTokenAnalysis(symbol: string): TokenAnalysis {
  const basePrice = {
    'BTC': 65000, 'ETH': 3500, 'SOL': 150, 'BNB': 600, 'XRP': 0.6,
    'ADA': 0.45, 'DOGE': 0.15, 'DOT': 7, 'MATIC': 0.7, 'LINK': 15,
  }[symbol] || 100;
  
  const price = basePrice * (1 + (Math.random() - 0.5) * 0.1);
  const change24h = (Math.random() - 0.5) * 10;
  const high24h = price * (1 + Math.random() * 0.05);
  const low24h = price * (1 - Math.random() * 0.05);
  
  // Generate support and resistance
  const support = [
    price * 0.95,
    price * 0.90,
    price * 0.85,
  ];
  
  const resistance = [
    price * 1.05,
    price * 1.10,
    price * 1.15,
  ];
  
  // Random pattern
  const patterns = ['Ascending Triangle', 'Bull Flag', 'Double Bottom', 'Cup and Handle', 'Falling Wedge'];
  const pattern = Math.random() > 0.5 ? patterns[Math.floor(Math.random() * patterns.length)] : undefined;
  
  // Generate signal
  const signals: SignalType[] = ['BUY', 'SELL', 'HOLD'];
  const signal = signals[Math.floor(Math.random() * signals.length)];
  
  const atr = price * 0.03;
  const entryPrice = signal === 'BUY' ? price : signal === 'SELL' ? price : price * 0.98;
  const stopLoss = signal === 'BUY' ? entryPrice - atr * 2 : signal === 'SELL' ? entryPrice + atr * 2 : entryPrice - atr;
  const takeProfit = signal === 'BUY' ? entryPrice + atr * 3 : signal === 'SELL' ? entryPrice - atr * 3 : entryPrice + atr * 2;
  
  return {
    symbol,
    price,
    change24h,
    high24h,
    low24h,
    support,
    resistance,
    pattern,
    signal,
    entryPrice,
    stopLoss,
    takeProfit,
  };
}

// Generate AI response
function generateAIResponse(userMessage: string): { content: string; tokenAnalysis?: TokenAnalysis } {
  const lowerMsg = userMessage.toLowerCase();
  
  // Check for token mentions
  let mentionedToken: string | undefined;
  for (const symbol of Object.keys(TOKEN_DATABASE)) {
    if (lowerMsg.includes(symbol.toLowerCase()) || 
        lowerMsg.includes(TOKEN_DATABASE[symbol].name.toLowerCase())) {
      mentionedToken = symbol;
      break;
    }
  }
  
  // Greeting
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return {
      content: "Hello! I'm your Silver Lion AI trading assistant. I can help you with:\n\n" +
        "• Real-time token analysis and price data\n" +
        "• Technical analysis and pattern detection\n" +
        "• Support and resistance levels\n" +
        "• Trading signals with entry/exit points\n" +
        "• Market sentiment analysis\n\n" +
        "Just ask me about any crypto token like 'What's the analysis for BTC?' or 'Show me SOL support levels'",
    };
  }
  
  // Help
  if (lowerMsg.includes('help') || lowerMsg.includes('what can you do')) {
    return {
      content: "I can assist you with:\n\n" +
        "**Token Analysis**: Price, 24h change, high/low, market data\n" +
        "**Technical Analysis**: Pattern detection, trend analysis\n" +
        "**Support/Resistance**: Key levels for any token\n" +
        "**Trading Signals**: Entry price, stop-loss, take-profit recommendations\n" +
        "**Market Sentiment**: Bullish/bearish indicators\n\n" +
        "Try asking: 'Analyze Bitcoin', 'What's the pattern on ETH?', or 'Give me SOL trading levels'",
    };
  }
  
  // Token analysis request
  if (mentionedToken) {
    const analysis = generateTokenAnalysis(mentionedToken);
    const token = TOKEN_DATABASE[mentionedToken];
    
    let response = `**${token.name} (${token.symbol}) Analysis**\n\n`;
    response += `**Price**: $${analysis.price.toFixed(analysis.price < 1 ? 4 : 2)}\n`;
    response += `**24h Change**: ${analysis.change24h >= 0 ? '+' : ''}${analysis.change24h.toFixed(2)}%\n`;
    response += `**24h High**: $${analysis.high24h.toFixed(analysis.high24h < 1 ? 4 : 2)}\n`;
    response += `**24h Low**: $${analysis.low24h.toFixed(analysis.low24h < 1 ? 4 : 2)}\n\n`;
    
    if (analysis.pattern) {
      response += `**Pattern Detected**: ${analysis.pattern}\n\n`;
    }
    
    response += `**Support Levels**: ${analysis.support.map(s => `$${s.toFixed(s < 1 ? 4 : 2)}`).join(', ')}\n`;
    response += `**Resistance Levels**: ${analysis.resistance.map(r => `$${r.toFixed(r < 1 ? 4 : 2)}`).join(', ')}\n\n`;
    
    if (analysis.signal && analysis.signal !== 'HOLD') {
      response += `**Signal**: ${analysis.signal === 'BUY' ? '🟢 BUY' : '🔴 SELL'}\n`;
      response += `**Entry Price**: $${analysis.entryPrice?.toFixed(analysis.entryPrice < 1 ? 4 : 2)}\n`;
      response += `**Stop Loss**: $${analysis.stopLoss?.toFixed(analysis.stopLoss < 1 ? 4 : 2)}\n`;
      response += `**Take Profit**: $${analysis.takeProfit?.toFixed(analysis.takeProfit < 1 ? 4 : 2)}\n\n`;
    }
    
    response += `*${token.description}*\n\n`;
    response += `⚠️ This is for educational purposes only. Always DYOR before trading.`;
    
    return { content: response, tokenAnalysis: analysis };
  }
  
  // Pattern detection request
  if (lowerMsg.includes('pattern') || lowerMsg.includes('chart')) {
    return {
      content: "I can detect various chart patterns including:\n\n" +
        "• **Head and Shoulders** - Reversal pattern\n" +
        "• **Double Top/Bottom** - Trend reversal signals\n" +
        "• **Triangles** - Continuation patterns (ascending, descending, symmetrical)\n" +
        "• **Flags and Pennants** - Short-term continuation\n" +
        "• **Cup and Handle** - Bullish continuation\n\n" +
        "Which token would you like me to analyze for patterns?",
    };
  }
  
  // Support/Resistance request
  if (lowerMsg.includes('support') || lowerMsg.includes('resistance')) {
    return {
      content: "Support and resistance levels are key price points where an asset tends to stop and reverse.\n\n" +
        "I calculate these based on:\n" +
        "• Historical price data\n" +
        "• Volume profile\n" +
        "• Pivot points\n" +
        "• Fibonacci retracements\n\n" +
        "Which token's S/R levels would you like to see?",
    };
  }
  
  // Signal request
  if (lowerMsg.includes('signal') || lowerMsg.includes('trade') || lowerMsg.includes('entry')) {
    return {
      content: "I generate trading signals based on multiple technical indicators:\n\n" +
        "• RSI (Relative Strength Index)\n" +
        "• MACD (Moving Average Convergence Divergence)\n" +
        "• EMA crossovers (20/50/200)\n" +
        "• Bollinger Bands\n" +
        "• Volume analysis\n" +
        "• Pattern recognition\n\n" +
        "Which token would you like a signal for?",
    };
  }
  
  // Default response
  return {
    content: "I'm not sure I understand. I can help you with:\n\n" +
      "• Token price and market data\n" +
      "• Technical analysis and patterns\n" +
      "• Support and resistance levels\n" +
      "• Trading signals\n\n" +
      "Try asking about a specific cryptocurrency like 'Analyze BTC' or 'What's the pattern on SOL?'",
  };
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to Silver Lion AI! 🦁\n\nI'm your intelligent trading assistant. I can provide:\n" +
        "• Real-time token analysis\n" +
        "• Technical analysis & patterns\n" +
        "• Support/resistance levels\n" +
        "• Trading signals with SL/TP\n\n" +
        "What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Generate AI response
    const aiResponse = generateAIResponse(content);
    
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      tokenAnalysis: aiResponse.tokenAnalysis,
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Chat cleared. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat,
  };
}

export default useAIChat;
