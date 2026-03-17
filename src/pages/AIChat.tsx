import { useRef, useEffect, useState } from 'react';
import { Send, Trash2, Bot, User, TrendingUp, Target, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { ChatMessage } from '@/types';

interface AIChatProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
}

export function AIChat({ messages, isTyping, onSendMessage, onClearChat }: AIChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const quickQuestions = [
    'Analyze BTC',
    'What\'s the pattern on ETH?',
    'SOL support levels',
    'Give me LINK signal',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Trading Assistant</h1>
          <p className="text-gray-400">Ask me anything about crypto trading</p>
        </div>
        <Button
          variant="outline"
          onClick={onClearChat}
          className="border-white/20 text-gray-400 hover:text-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      {/* Quick Questions */}
      <div className="flex flex-wrap gap-2">
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => onSendMessage(q)}
            className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/30 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]" ref={scrollRef}>
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-[#ffdf8d] text-black' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-[#ffdf8d] text-black'
                        : 'bg-black/30 text-white'
                    }`}>
                      <div className="whitespace-pre-line text-sm">{message.content}</div>
                      
                      {/* Token Analysis Card */}
                      {message.tokenAnalysis && (
                        <div className="mt-4 p-3 bg-black/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-[#ffdf8d]">{message.tokenAnalysis.symbol}</span>
                            {message.tokenAnalysis.signal && (
                              <Badge className={
                                message.tokenAnalysis.signal === 'BUY' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : message.tokenAnalysis.signal === 'SELL'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }>
                                {message.tokenAnalysis.signal}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-400">24h:</span>
                              <span className={message.tokenAnalysis.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {message.tokenAnalysis.change24h >= 0 ? '+' : ''}{message.tokenAnalysis.change24h.toFixed(2)}%
                              </span>
                            </div>
                            
                            {message.tokenAnalysis.pattern && (
                              <div className="flex items-center gap-1">
                                <Bot className="w-3 h-3 text-gray-500" />
                                <span className="text-[#ffdf8d]">{message.tokenAnalysis.pattern}</span>
                              </div>
                            )}
                            
                            {message.tokenAnalysis.entryPrice && (
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-400">Entry:</span>
                                <span className="text-white">${message.tokenAnalysis.entryPrice.toFixed(2)}</span>
                              </div>
                            )}
                            
                            {message.tokenAnalysis.stopLoss && (
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-400">SL:</span>
                                <span className="text-red-400">${message.tokenAnalysis.stopLoss.toFixed(2)}</span>
                              </div>
                            )}
                            
                            {message.tokenAnalysis.takeProfit && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-400">TP:</span>
                                <span className="text-green-400">${message.tokenAnalysis.takeProfit.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about any crypto token..."
                className="flex-1 bg-black/30 border-white/20 text-white"
              />
              <Button 
                type="submit" 
                disabled={isTyping || !input.trim()}
                className="bg-[#ffdf8d] text-black hover:bg-[#ffdf8d]/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIChat;
