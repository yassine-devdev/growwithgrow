
import React, { useState } from 'react';
import { BlogSection } from '../types';
import BlogL2Sidebar from '../components/BlogL2Sidebar';
import GlassCard from '../../../components/GlassCard';
import AIChartCard from '../../../components/AIChartCard';
import { PlusIcon } from '../../crm/components/Icons';


const dummyPosts = [
    { id: 1, title: "Our New AI-Powered Future", status: "Published", author: "Admin", date: "2024-07-20" },
    { id: 2, title: "Q3 System Updates", status: "Published", author: "Admin", date: "2024-07-15" },
    { id: 3, title: "Exploring the New Tools Module", status: "Draft", author: "Content Team", date: "2024-07-22" },
];

const statusClasses = {
    Published: 'bg-green-500/30 text-green-300',
    Draft: 'bg-yellow-500/30 text-yellow-300',
};

const AllPostsView: React.FC<{setView: (view: 'list' | 'editor') => void}> = ({ setView }) => (
    <div className="h-full flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-white">All Blog Posts</h2>
            </div>
            <button 
                onClick={() => setView('editor')}
                className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow"
            >
                <PlusIcon className="w-5 h-5"/>
                Add New Post
            </button>
        </div>
        <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-cyber-surface/80 backdrop-blur-sm">
                        <tr>
                            {['Title', 'Status', 'Author', 'Date', ''].map(h => (
                                <th key={h} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-cyber-border">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border/50">
                        {dummyPosts.map(post => (
                            <tr key={post.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 font-medium text-white">{post.title}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-bold rounded-full ${statusClasses[post.status]}`}>{post.status}</span></td>
                                <td className="p-3 text-gray-400">{post.author}</td>
                                <td className="p-3 text-gray-400">{post.date}</td>
                                <td className="p-3 text-right"><button onClick={() => setView('editor')} className="font-medium text-cyber-cyan hover:underline">Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    </div>
);

const PostEditor: React.FC<{setView: (view: 'list' | 'editor') => void}> = ({ setView }) => (
    <div className="h-full flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">Blog Post Editor</h2>
            <button onClick={() => setView('list')} className="text-sm text-gray-400 hover:text-white">&larr; Back to All Posts</button>
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-2 min-h-0">
            <GlassCard className="lg:col-span-3 p-4 flex flex-col">
                 <input type="text" placeholder="Post Title" className="w-full bg-black/30 border border-cyber-border rounded-lg p-3 text-xl font-bold text-white mb-4 flex-shrink-0" defaultValue="New Blog Post Title" />
                 <textarea placeholder="Write your content here... supports markdown." className="w-full flex-1 bg-black/30 border border-cyber-border rounded-lg p-3 text-white resize-none font-mono"></textarea>
            </GlassCard>
            <div className="lg:col-span-1 flex flex-col gap-2">
                <GlassCard className="p-4">
                     <h3 className="text-lg font-semibold text-cyber-cyan mb-2">Publish</h3>
                     <div className="flex flex-col gap-2">
                        <button onClick={() => setView('list')} className="w-full py-2 bg-cyber-surface text-white rounded-md hover:bg-white/10">Save Draft</button>
                        <button onClick={() => setView('list')} className="w-full py-2 bg-cyber-cyan text-black font-bold rounded-md hover:bg-white">Publish</button>
                     </div>
                </GlassCard>
                <GlassCard className="p-4">
                     <h3 className="text-lg font-semibold text-cyber-cyan mb-2">Categories</h3>
                     <input type="text" placeholder="Add category..." className="w-full bg-black/30 border border-cyber-border rounded-lg p-2 text-sm text-white"/>
                </GlassCard>
                 <GlassCard className="p-4">
                     <h3 className="text-lg font-semibold text-cyber-cyan mb-2">Featured Image</h3>
                     <div className="aspect-video bg-black/30 border-2 border-dashed border-cyber-border rounded-lg flex items-center justify-center text-sm text-gray-500">
                         Click to upload
                     </div>
                </GlassCard>
            </div>
        </div>
    </div>
);

const CategoriesView: React.FC = () => (
    <div className="h-full flex flex-col gap-2">
         <h2 className="text-3xl font-bold text-white">Manage Categories</h2>
         <GlassCard className="p-6">
            <p className="text-gray-400">Category Management UI placeholder.</p>
         </GlassCard>
    </div>
);

const AnalyticsView: React.FC = () => (
     <div className="h-full flex flex-col gap-2">
         <h2 className="text-3xl font-bold text-white">Blog Analytics</h2>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0">
            <AIChartCard
                title="Post Views (Last 30 Days)"
                prompt="Create a line chart for daily blog post views over the last 30 days, showing a general upward trend with some peaks and valleys. Start around 200 views and end around 800."
            />
            <AIChartCard
                title="Top 5 Posts by Engagement"
                prompt="Create a bar chart for the top 5 blog posts by engagement score: 'New AI Future' (95), 'Q3 Updates' (82), 'Tool Exploration' (75), 'Old Post A' (60), 'Old Post B' (55)."
            />
        </div>
    </div>
);


const Blog: React.FC = () => {
    const [activeSection, setActiveSection] = useState<BlogSection>('All Posts');
    const [view, setView] = useState<'list' | 'editor'>('list'); // 'list' shows All Posts/Categories/Analytics, 'editor' shows the post editor

    const handleAddNew = () => {
        setActiveSection('All Posts'); // Switch to 'All Posts' view contextually
        setView('editor');
    };

    const handleSetSection = (section: BlogSection) => {
        setActiveSection(section);
        setView('list'); // Always go back to list view when changing sections
    };

    const renderContent = () => {
        if (view === 'editor') {
            return <PostEditor setView={setView} />;
        }
        
        switch (activeSection) {
            case 'All Posts':
                return <AllPostsView setView={setView} />;
            case 'Categories':
                return <CategoriesView />;
            case 'Analytics':
                return <AnalyticsView />;
            default:
                return <AllPostsView setView={setView} />;
        }
    };

    return (
        <div className="flex h-full">
            <BlogL2Sidebar activeSection={activeSection} setActiveSection={handleSetSection} onAddNew={handleAddNew} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
                {renderContent()}
            </main>
        </div>
    );
};

export default Blog;
