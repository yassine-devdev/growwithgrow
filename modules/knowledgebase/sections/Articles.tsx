
import React from 'react';
import GlassCard from '../../../components/GlassCard';
import { SearchIcon } from '../../../components/icons/InterfaceIcons';

const articles = [
    { title: "Onboarding: First Steps", category: "Getting Started", views: 1204 },
    { title: "How to use the AI Tools module", category: "AI Suite", views: 876 },
    { title: "Understanding the Dashboard metrics", category: "System", views: 652 },
    { title: "Configuring System Settings", category: "Configuration", views: 431 },
    { title: "Marketplace Plugin Integration Guide", category: "Marketplace", views: 322 },
    { title: "Troubleshooting Network Connectivity", category: "Support", views: 189 },
]

const Articles: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-2">
            <GlassCard className="p-6">
                <h2 className="text-3xl font-bold text-white mb-2">Knowledge Base Articles</h2>
                <p className="text-gray-400 mb-4">Find guides, tutorials, and documentation.</p>
                <div className="relative max-w-lg">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        className="w-full bg-black/30 border border-cyber-border rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
                    />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                </div>
            </GlassCard>

            <GlassCard className="p-6 flex-1 overflow-y-auto">
                <div className="divide-y divide-cyber-border">
                    {articles.map((article, i) => (
                        <div key={i} className="py-4 flex justify-between items-center hover:bg-white/5 px-2 rounded-md transition-colors">
                            <div>
                                <h3 className="text-lg font-semibold text-white cursor-pointer hover:text-cyber-cyan">{article.title}</h3>
                                <p className="text-sm text-gray-400">Category: <span className="text-cyber-purple">{article.category}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-lg text-white">{article.views}</p>
                                <p className="text-xs text-gray-500">views</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

export default Articles;
