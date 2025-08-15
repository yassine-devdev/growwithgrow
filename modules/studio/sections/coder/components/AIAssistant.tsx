import React, { useState, useRef, useEffect } from 'react';
import * as Icons from './Icons';
import { generateText } from '../../../../../services/geminiService';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: 'Hello! I am your AI pair programmer. How can I help you with your code today? Try asking me to explain a function, write a test, or fix a bug.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const prompt = `You are an expert pair programmer AI assistant integrated into a VSCode-like IDE. The user is asking for help with their code. Provide a concise and helpful response, using markdown for code blocks where appropriate. User's question: "${currentInput}"`;
            const aiResponse = await generateText(prompt);
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-full bg-vsc-sidebar flex flex-col text-vsc-text text-sm">
            {/* Header */}
            <div className="flex items-center p-2 border-b border-vsc-border flex-shrink-0">
                <Icons.CopilotIcon className="w-5 h-5 mr-2" />
                <span className="font-semibold text-white">AI Assistant</span>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-2 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                         {msg.sender === 'ai' && <Icons.CopilotIcon className="w-5 h-5 mt-1 flex-shrink-0" />}
                        <div className={`p-3 rounded-lg max-w-xs break-words ${msg.sender === 'user' ? 'bg-vsc-accent/50' : 'bg-vsc-bg/50'}`}>
                            {/* Simple markdown parsing for code blocks */}
                            {msg.text.split('```').map((part, i) => 
                                i % 2 === 1 ? (
                                    <pre key={i} className="bg-black/30 p-2 rounded-md my-2 text-xs overflow-x-auto"><code>{part.trim()}</code></pre>
                                ) : (
                                    <p key={i} className="whitespace-pre-wrap">{part}</p>
                                )
                            )}
                        </div>
                         {msg.sender === 'user' && <img src="https://picsum.photos/id/1005/24/24" alt="User Avatar" className="w-6 h-6 rounded-full" />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <Icons.CopilotIcon className="w-5 h-5 mt-1 flex-shrink-0" />
                        <div className="p-3 rounded-lg bg-vsc-bg/50">
                            <div className="flex items-center gap-2">
                               <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                               <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></span>
                               <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></span>
                           </div>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
            
            {/* Input Form */}
            <div className="p-2 border-t border-vsc-border flex-shrink-0">
                <form onSubmit={handleSendMessage} className="relative">
                    <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Ask the AI Assistant..."
                        rows={2}
                        className="w-full bg-vsc-bg border border-vsc-border rounded-md p-2 pr-10 resize-none focus:outline-none focus:ring-1 focus:ring-vsc-accent"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 bottom-2 p-1 rounded-md text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed">
                        <Icons.SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistant;
