import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { getMockData } from '../data/mockData';

const CuteAnimatedBot = () => (
  <div className="relative flex items-center justify-center animate-float-bot w-8 h-8">
    <style>
      {`
        @keyframes wave-hand {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(14deg); }
          20%, 40%, 60%, 80% { transform: rotate(-8deg); }
        }
        .animate-wave-hand {
          animation: wave-hand 2.5s infinite;
          transform-origin: bottom right;
        }
        @keyframes float-bot {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .animate-float-bot {
          animation: float-bot 3s ease-in-out infinite;
        }
      `}
    </style>
    <Bot size={28} className="text-white drop-shadow-md" />
    <div className="absolute -top-3 -right-3 text-xl animate-wave-hand drop-shadow-sm hover:scale-125 transition-transform cursor-pointer">
      👋
    </div>
  </div>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Energy AI assistant. Ask me about block consumption, savings, or hostel usage.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      // Add system context using today's data so it knows about energy
      const todayData = getMockData(new Date().toISOString().split('T')[0]);
      
      const systemContext = `You are a highly intelligent, concise AI Energy Assistant for a college campus dashboard. 
Today's simulated data context: ${JSON.stringify(todayData)}. 
Answer the user's questions about energy consumption, savings, and general campus block details concisely and accurately. Use Markdown for formatting if helpful. Keep answers under 4 sentences.`;

      const aiPrompt = encodeURIComponent(`${systemContext}\n\nUser Question: ${userMsg}\n\nAI Response:`);
      
      const response = await fetch(`https://text.pollinations.ai/${aiPrompt}`, {
         method: 'GET'
      });
      
      if (!response.ok) throw new Error("API failed");
      
      const responseText = await response.text();

      setMessages(prev => [...prev, { text: responseText, sender: 'bot' }]);
    } catch (error) {
      console.error("Chatbot API Error:", error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I encountered a network error connecting to the free AI service. Please try again later.", 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-all transform hover:scale-110 z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <CuteAnimatedBot />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden animate-fade-in max-h-[80vh]">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md z-10 transition-colors">
             <div className="flex items-center gap-2">
                <Bot size={20} />
                <h3 className="font-bold text-sm sm:text-base">Energy Insights AI</h3>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors cursor-pointer">
               <X size={20} />
             </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto h-80 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent bg-slate-50/50 dark:bg-transparent">
             {messages.map((msg, i) => (
               <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                     msg.sender === 'user' 
                       ? 'bg-indigo-600 text-white rounded-tr-none' 
                       : 'bg-[rgb(var(--bg-card))] text-[rgb(var(--text-main))] rounded-tl-none border border-[rgb(var(--border))]'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
               </div>
             ))}
             <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-[rgb(var(--bg-card))] flex items-center gap-2 border-t border-[rgb(var(--border))]">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 bg-[rgb(var(--bg-input))] border border-[rgb(var(--border))] text-[rgb(var(--text-main))] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-[rgb(var(--text-muted))]"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center shrink-0"
            >
               {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
