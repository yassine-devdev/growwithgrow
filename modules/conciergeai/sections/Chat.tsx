
import React, { useState, useEffect, useRef } from 'react';
import ChatInput from '../components/ChatInput';
import GlassCard from '../../../components/GlassCard';
import { generateText } from '../../../services/geminiService';
import { SpeakerOnIcon, SpeakerOffIcon, PromptIcon, AutomationIcon } from '../components/Icons';
import ConciergeAIL3Sidebar from '../components/ConciergeAIL3Sidebar';
import { ConciergeAIChatSection } from '../types';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

declare global {
    interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

const LoadingDots: React.FC = () => (
    <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></span>
    </div>
);

// --- Component for the main chat (original functionality) ---
const MainChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I am the Concierge AI. How can I assist you today? You can use the microphone to ask questions with your voice.", sender: 'ai'}
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isMuted, setIsMuted] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const isMutedRef = useRef(isMuted);

    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    
    const speak = (text: string) => {
        if (isMutedRef.current) return;
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            }
            if(finalTranscript) setMessage(prev => prev + finalTranscript);
        };
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = (event: any) => { console.error("Speech recognition error", event.error); setIsRecording(false); };
        return () => { recognition.stop(); };
    }, []);

    const toggleRecording = () => { isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start(); };

    const handleSendMessage = async () => {
        const messageText = message.trim();
        if (!messageText) return;

        setMessages(prev => [...prev, { id: Date.now(), text: messageText, sender: 'user' }]);
        setMessage('');
        setIsLoading(true);

        try {
            const systemInstruction = "You are the Concierge AI. You are a helpful assistant for users of this system. Keep your responses concise and helpful.";
            const aiResponse = await generateText(messageText, systemInstruction);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
            speak(aiResponse);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I encountered an error.", sender: 'ai' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <header className="p-4 border-b border-cyber-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">General Assistant</h2>
                 <button onClick={() => setIsMuted(prev => !prev)} title={isMuted ? "Unmute" : "Mute"} className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white">
                    {isMuted ? <SpeakerOffIcon className="w-5 h-5" /> : <SpeakerOnIcon className="w-5 h-5 text-cyber-cyan" />}
                </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                         {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-cyber-purple flex-shrink-0 flex items-center justify-center font-bold text-sm">AI</div>}
                         <div className={`p-3 rounded-lg max-w-xl whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-cyber-purple/80' : 'bg-cyber-surface'}`}><p className="text-gray-200">{msg.text}</p></div>
                    </div>
                ))}
                {isLoading && <div className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-cyber-purple flex-shrink-0 flex items-center justify-center font-bold text-sm animate-pulse">AI</div><div className="p-3 rounded-lg max-w-xl bg-cyber-surface"><LoadingDots/></div></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-cyber-border"><ChatInput message={message} setMessage={setMessage} onSendMessage={handleSendMessage} isLoading={isLoading} isRecording={isRecording} toggleRecording={toggleRecording} /></div>
        </div>
    );
}

const ReportGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('Generate a summary of Q3 deals won and top-performing marketing campaigns.');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setResult('');
        try {
            const systemInstruction = "You are a powerful AI assistant with access to all data across the user's dashboard (CRM, Marketing, etc.). Generate concise and accurate reports based on the user's request. Present data clearly, using markdown for lists, tables, or bold text where appropriate.";
            const response = await generateText(prompt, systemInstruction);
            setResult(response);
        } catch (error) {
            setResult("Sorry, I was unable to generate the report.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-full flex flex-col p-4 gap-4">
            <header>
                <h2 className="text-2xl font-bold text-white">Dashboard Report Generator</h2>
                <p className="text-gray-400 text-sm">Ask for a report across any module, and the AI will generate it for you.</p>
            </header>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="bg-black/40 rounded-lg p-4 h-full overflow-y-auto font-mono text-gray-300 whitespace-pre-wrap">
                    {isLoading ? <span className="animate-pulse">Generating report...</span> : result || 'Your generated report will appear here.'}
                </div>
            </div>
            <div className="flex-shrink-0 flex flex-col gap-2">
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="w-full bg-black/30 border border-cyber-border rounded-lg p-2 text-white placeholder-gray-500 resize-none" placeholder="Enter your report request..."/>
                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-3 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple disabled:bg-gray-600">Generate Report</button>
            </div>
        </div>
    );
}

const DevAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([ { id: 1, text: "Dev Assistant activated. I can help with coding, debugging, and automation tasks. How can I assist you?", sender: 'ai' } ]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleSendMessage = async () => {
        const messageText = message.trim();
        if (!messageText) return;
        setMessages(prev => [...prev, { id: Date.now(), text: messageText, sender: 'user' }]);
        setMessage('');
        setIsLoading(true);
        try {
            const systemInstruction = "You are an expert full-stack developer AI assistant. Your role is to help the user with coding tasks, debugging, architectural decisions, and creating automation scripts. Provide code snippets in markdown format when requested. Be precise and thorough.";
            const aiResponse = await generateText(messageText, systemInstruction);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I encountered an error.", sender: 'ai' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <header className="p-4 border-b border-cyber-border flex items-center gap-3">
                <AutomationIcon className="w-6 h-6 text-cyber-cyan" />
                <h2 className="text-xl font-bold text-white">Automation & Dev Assistant</h2>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                         {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-cyber-cyan flex-shrink-0 flex items-center justify-center"><AutomationIcon className="w-5 h-5 text-black" /></div>}
                         <div className={`p-3 rounded-lg max-w-xl whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-cyber-purple/80' : 'bg-cyber-surface'}`}>
                           {msg.text.split('```').map((part, i) => i % 2 === 1 ? <pre key={i} className="bg-black/30 p-2 rounded-md my-2 text-xs overflow-x-auto font-mono"><code>{part.trim()}</code></pre> : <p key={i}>{part}</p>)}
                         </div>
                    </div>
                ))}
                {isLoading && <div className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-cyber-cyan flex-shrink-0 flex items-center justify-center animate-pulse"><AutomationIcon className="w-5 h-5 text-black" /></div><div className="p-3 rounded-lg max-w-xl bg-cyber-surface"><LoadingDots/></div></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-cyber-border"><ChatInput message={message} setMessage={setMessage} onSendMessage={handleSendMessage} isLoading={isLoading} isRecording={false} toggleRecording={() => {}} /></div>
        </div>
    );
};

const Chat: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<ConciergeAIChatSection>('Chat');

    const renderContent = () => {
        switch (activeL3Section) {
            case 'Chat': return <MainChat />;
            case 'Report': return <ReportGenerator />;
            case 'Automation': return <DevAssistant />;
            default: return <MainChat />;
        }
    };

    return (
        <div className="flex h-full">
            <ConciergeAIL3Sidebar 
                activeL2Section="Chat"
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 min-w-0">
                <GlassCard className="h-full flex flex-col p-0">
                    {renderContent()}
                </GlassCard>
            </main>
        </div>
    );
};

export default Chat;
