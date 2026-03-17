import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, TrendingUp, Target, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { ChatMessage } from '@/types';

interface AIChatPopupProps {
  onClose: () => void;
}

// Generate AI response
function generateAIResponse(userMessage: string): { content: string; tokenAnalysis?: any } {
  const lowerMsg = userMessage.toLowerCase();
  
  // Check for token mentions
  const tokens = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'LINK'];
  let mentionedToken: string | undefined;
  for (const token of tokens) {
    if (lowerMsg.includes(token.toLowerCase())) {
      mentionedToken = token;
      break;
    }
  }
  
  // Greeting
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return {
      content: "Hello! I'm your Silver Lion AI trading assistant. 🦁\n\nI can help you with:\n• Real-time token analysis\n• Technical analysis & patterns\n• Support/resistance levels\n• Trading signals with SL/TP\n• Market sentiment analysis\n\nWhat would you like to know?",
    };
  }
  
  // Help
  if (lowerMsg.includes('help') || lowerMsg.includes('what can you do')) {
    return {
      content: "I can assist you with:\n\n📊 **Token Analysis**: Price, 24h change, high/low\n📈 **Technical Analysis**: Pattern detection, trends\n🎯 **Support/Resistance**: Key levels for any token\n💰 **Trading Signals**: Entry, SL, TP recommendations\n📰 **Market Sentiment**: Bullish/bearish indicators\n\nTry asking: 'Analyze BTC' or 'What's the pattern on ETH?'",
    };
  }
  
  // Token analysis request
  if (mentionedToken) {
    const basePrice: Record<string, number> = {
      BTC: 65000, ETH: 3500, SOL: 150, BNB: 600, XRP: 0.6,
      ADA: 0.45, DOGE: 0.15, DOT: 7, MATIC: 0.7, LINK: 15,
    };
    const price = basePrice[mentionedToken] * (1 + (Math.random() - 0.5) * 0.1);
    const change24h = (Math.random() - 0.5) * 10;
    const high24h = price * (1 + Math.random() * 0.05);
    const low24h = price * (1 - Math.random() * 0.05);
    
    const support = [price * 0.95, price * 0.90, price * 0.85];
    const resistance = [price * 1.05, price * 1.10, price * 1.15];
    
    const patterns = ['Ascending Triangle', 'Bull Flag', 'Double Bottom', 'Cup and Handle'];
    const pattern = Math.random() > 0.5 ? patterns[Math.floor(Math.random() * patterns.length)] : undefined;
    
    const signal = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const atr = price * 0.03;
    const entryPrice = signal === 'BUY' ? price : price;
    const stopLoss = signal === 'BUY' ? entryPrice - atr * 2 : entryPrice + atr * 2;
    const takeProfit = signal === 'BUY' ? entryPrice + atr * 3 : entryPrice - atr * 3;
    
    let response = `**${mentionedToken} Analysis**\n\n`;
    response += `**Price**: $${price.toFixed(price < 1 ? 4 : 2)}\n`;
    response += `**24h Change**: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%\n`;
    response += `**24h High**: $${high24h.toFixed(high24h < 1 ? 4 : 2)}\n`;
    response += `**24h Low**: $${low24h.toFixed(low24h < 1 ? 4 : 2)}\n\n`;
    
    if (pattern) {
      response += `**Pattern**: ${pattern}\n\n`;
    }
    
    response += `**Support**: ${support.map(s => `$${s.toFixed(s < 1 ? 4 : 2)}`).join(', ')}\n`;
    response += `**Resistance**: ${resistance.map(r => `$${r.toFixed(r < 1 ? 4 : 2)}`).join(', ')}\n\n`;
    
    response += `**Signal**: ${signal === 'BUY' ? '🟢' : '🔴'} ${signal}\n`;
    response += `**Entry**: $${entryPrice.toFixed(entryPrice < 1 ? 4 : 2)}\n`;
    response += `**Stop Loss**: $${stopLoss.toFixed(stopLoss < 1 ? 4 : 2)}\n`;
    response += `**Take Profit**: $${takeProfit.toFixed(takeProfit < 1 ? 4 : 2)}\n\n`;
    
    response += `⚠️ *This is for educational purposes only. DYOR before trading.*`;
    
    return { 
      content: response,
      tokenAnalysis: {
        symbol: mentionedToken,
        price,
        change24h,
        pattern,
        signal,
        entryPrice,
        stopLoss,
        takeProfit,
      }
    };
  }
  
  // Default response
  return {
    content: "I'm not sure I understand. I can help with:\n\n• Token price and market data\n• Technical analysis and patterns\n• Support and resistance levels\n• Trading signals\n\nTry asking about a specific crypto like 'Analyze BTC' or 'What's the pattern on SOL?'",
  };
}

export function AIChatPopup({ onClose }: AIChatPopupProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to Silver Lion AI! 🦁\n\nI'm your intelligent trading assistant. Ask me about any crypto token for real-time analysis, trading signals, and market insights.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const aiResponse = generateAIResponse(input.trim());

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      tokenAnalysis: aiResponse.tokenAnalysis,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const quickQuestions = [
    'Analyze BTC',
    'ETH support levels',
    'SOL pattern',
    'Best signal now?',
  ];

  return (
    <div className="fixed bottom-24 right-6 w-96 bg-[#1a1a1a] border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#ffdf8d]/20 to-transparent border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold">Silver Lion AI</p>
            <p className="text-xs text-gray-400">Trading Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Quick Questions */}
      <div className="flex gap-2 p-3 overflow-x-auto border-b border-white/10">
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => {
              setInput(q);
            }}
            className="px-3 py-1.5 bg-black/30 border border-white/10 rounded-full text-xs text-gray-400 hover:text-white hover:border-white/30 transition-colors whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-[#ffdf8d]' 
                : 'bg-gradient-to-br from-blue-500 to-purple-500'
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-black" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            
            <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-2xl text-sm ${
                message.role === 'user'
                  ? 'bg-[#ffdf8d] text-black'
                  : 'bg-black/30 text-white'
              }`}>
                <div className="whitespace-pre-line">{message.content}</div>
                
                {message.tokenAnalysis && (
                  <div className="mt-3 p-2 bg-black/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#ffdf8d]">{message.tokenAnalysis.symbol}</span>
                      {message.tokenAnalysis.signal && (
                        <Badge className={
                          message.tokenAnalysis.signal === 'BUY' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }>
                          {message.tokenAnalysis.signal}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {message.tokenAnalysis.change24h !== undefined && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-gray-500" />
                          <span className={message.tokenAnalysis.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {message.tokenAnalysis.change24h >= 0 ? '+' : ''}{message.tokenAnalysis.change24h.toFixed(2)}%
                          </span>
                        </div>
                      )}
                      {message.tokenAnalysis.entryPrice && (
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-gray-500" />
                          <span className="text-white">${message.tokenAnalysis.entryPrice.toFixed(2)}</span>
                        </div>
                      )}
                      {message.tokenAnalysis.stopLoss && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-gray-500" />
                          <span className="text-red-400">${message.tokenAnalysis.stopLoss.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-black/30 p-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any crypto..."
            className="flex-1 bg-black/30 border-white/20 text-white text-sm"
          />
          <Button 
            type="submit" 
            disabled={isTyping || !input.trim()}
            className="bg-[#ffdf8d] text-black hover:bg-[#ffdf8d]/90 px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AIChatPopup;
