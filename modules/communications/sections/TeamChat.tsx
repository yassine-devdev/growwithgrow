
import React from 'react';
import GlassCard from '../../../components/GlassCard';
import { SearchIcon } from '../../../components/icons/InterfaceIcons';

const contacts = [
    { name: 'Dr. Ada Lovelace', status: 'online', avatar: 'https://picsum.photos/id/1/50/50' },
    { name: 'Dr. Alan Turing', status: 'online', avatar: 'https://picsum.photos/id/2/50/50' },
    { name: 'Dr. Grace Hopper', status: 'offline', avatar: 'https://picsum.photos/id/3/50/50' },
    { name: '#dev-team', status: 'channel', avatar: null },
    { name: '#project-pegasus', status: 'channel', avatar: null },
];

const messages = [
    { from: 'Dr. Ada Lovelace', text: 'Have you seen the latest performance metrics? CPU usage is down 15%!', time: '10:30 AM', avatar: 'https://picsum.photos/id/1/50/50' },
    { from: 'me', text: 'That\'s fantastic news! The optimizations must have worked.', time: '10:31 AM', avatar: 'https://picsum.photos/id/1005/100/100' },
    { from: 'Dr. Alan Turing', text: 'Indeed. I\'m running final diagnostics now. Will post the report in #project-pegasus shortly.', time: '10:32 AM', avatar: 'https://picsum.photos/id/2/50/50' },
];

const TeamChat: React.FC = () => {
    return (
        <div className="h-full flex gap-4 text-white">
            {/* Contacts/Channels List */}
            <GlassCard className="w-1/4 p-4 flex flex-col">
                <h3 className="text-lg font-bold text-cyber-cyan mb-4">Channels & DMs</h3>
                <ul className="space-y-2 overflow-y-auto">
                    {contacts.map((contact, i) => (
                        <li key={i} className={`p-2.5 cursor-pointer rounded-md flex items-center gap-3 ${i === 0 ? 'bg-cyber-purple/20' : ''} hover:bg-white/10`}>
                            {contact.avatar ? (
                                <div className="relative">
                                    <img src={contact.avatar} alt={contact.name} className="w-9 h-9 rounded-full"/>
                                    {contact.status === 'online' && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-cyber-surface"></span>}
                                </div>
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center font-bold text-sm text-gray-300">#</div>
                            )}
                            <span className="font-semibold truncate">{contact.name}</span>
                        </li>
                    ))}
                </ul>
            </GlassCard>

            {/* Chat Area */}
            <GlassCard className="w-3/4 p-4 flex flex-col">
                <header className="border-b border-cyber-border pb-3 mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Dr. Ada Lovelace</h2>
                    <div className="relative w-64">
                        <input type="text" placeholder="Search in chat..." className="w-full bg-black/30 border border-cyber-border rounded-full py-1.5 pl-8 pr-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyber-cyan" />
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 items-start ${msg.from === 'me' ? 'flex-row-reverse' : ''}`}>
                            <img src={msg.avatar} alt={msg.from} className="w-10 h-10 rounded-full"/>
                            <div className={`p-3 rounded-lg max-w-md ${msg.from === 'me' ? 'bg-cyber-purple/80' : 'bg-cyber-surface'}`}>
                                <div className="flex items-baseline gap-2">
                                    <p className="font-semibold text-white">{msg.from}</p>
                                    <p className="text-xs text-gray-400">{msg.time}</p>
                                </div>
                                <p className="text-gray-200 mt-1">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="mt-4 pt-4 border-t border-cyber-border">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="w-full bg-black/50 border border-cyber-border rounded-lg py-3 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-purple"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-cyber-cyan hover:bg-cyber-cyan/20">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default TeamChat;
