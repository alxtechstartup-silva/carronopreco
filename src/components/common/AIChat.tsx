import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Olá! Sou o assistente do Carro no Preço. Como posso ajudar você a encontrar o melhor valor no seu carro hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Use the generic recommendation endpoint for simplicity in the demo
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          preferences: userMsg,
          budget: 'Indefinido',
          useCase: 'Carro no Preço SDR AI' 
        })
      });
      const data = await res.json();
      
      // Intelligent SDR response logic
      const aiResponse = data.recommendations?.[0]?.reason 
        ? `${data.recommendations[0].reason} Inclusive, notei que você gosta de performance. Já conhece o Porsche 911 que acabamos de receber?`
        : 'Entendi seu interesse. Gostaria de agendar um test-drive em uma de nossas unidades VIP?';
      
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Desculpe, tive um problema na conexão. Pode tentar novamente?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[400px] bg-surface border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Chat Header */}
            <div className="bg-accent p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Preço Certo AI</h4>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Online Agora</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                 <X size={24} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex",
                  m.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm",
                    m.role === 'user' ? "bg-accent text-white" : "bg-white/5 text-white/80"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="bg-white/5 p-4 rounded-2xl flex gap-2">
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce delay-100" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce delay-200" />
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5">
              <div className="relative">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Pergunte sobre carros, preços ou marcas..."
                  className="w-full bg-surface border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-xs outline-none focus:border-accent"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:bg-accent/10 rounded-xl transition-all">
                   <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white shadow-2xl shadow-accent/20 hover:scale-110 transition-all hover:bg-accent/90"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
}
