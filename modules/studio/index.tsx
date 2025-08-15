
import React, { useState, useMemo } from 'react';
import { STUDIO_DATA } from '../../constants';
import { StudioSection } from './types';
import GlassCard from '../../components/GlassCard';
import * as ToolIcons from './components/ToolIcons';
import VideoEditor from './sections/VideoEditor';
import Placeholder from '../../components/Placeholder';
import ManualEditor from './sections/ManualEditor';
import AiLayoutGenerator from './sections/AiLayoutGenerator';
import IDE from './sections/coder/IDE';

const toolIcons: Record<string, React.FC<{ className?: string }>> = {
    'UI/UX': ToolIcons.UixIcon,
    'Graphic Design': ToolIcons.GraphicDesignIcon,
    '3D Modeling': ToolIcons.ThreeDModelIcon,
    'Vector Art': ToolIcons.VectorArtIcon,
    'Prototypes': ToolIcons.PrototypeIcon,
    'Editor': ToolIcons.ManualEditorIcon,
    'Gallery': ToolIcons.GalleryIcon,
    'AI Generator': ToolIcons.AIGeneratorIcon,
    'Filters & Effects': ToolIcons.FiltersIcon,
    'Batch Processor': ToolIcons.BatchProcessorIcon,
    'Player': ToolIcons.PlayerIcon,
    'Video Editor': ToolIcons.VideoEditorIcon,
    'Shorts': ToolIcons.ShortsIcon,
    'Converter': ToolIcons.ConverterIcon,
    'Streaming': ToolIcons.StreamingIcon,
    'IDE': ToolIcons.IdeIcon,
    'Playground': ToolIcons.PlaygroundIcon,
    'Debugger': ToolIcons.DebuggerIcon,
    'Git Client': ToolIcons.GitClientIcon,
    'API Tester': ToolIcons.ApiTesterIcon,
    'Docs': ToolIcons.DocsIcon,
    'Sheets': ToolIcons.SheetsIcon,
    'Slides': ToolIcons.SlidesIcon,
    'PDF Viewer': ToolIcons.PdfViewerIcon,
    'Notes': ToolIcons.NotesIcon,
    'General': ToolIcons.GeneralSettingsIcon,
    'Plugins': ToolIcons.PluginsIcon,
    'Export Options': ToolIcons.ExportIcon,
    'Cloud Sync': ToolIcons.CloudSyncIcon,
    'Preferences': ToolIcons.PreferencesIcon,
};


const ToolButton: React.FC<{
  label: string;
  icon: React.FC<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      title={label}
      className={`w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-all duration-300 ease-in-out group p-1
        ${isActive
          ? 'bg-cyber-orange/20 text-cyber-orange'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
    >
      <Icon className="w-6 h-6 mb-1 flex-shrink-0" />
      <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
    </button>
);


const Studio: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<StudioSection>(STUDIO_DATA[0].category);
    const [activeTool, setActiveTool] = useState<string | null>(STUDIO_DATA[0].items[0] || null);

    const handleCategoryClick = (category: StudioSection) => {
        setActiveCategory(category);
        const items = STUDIO_DATA.find(data => data.category === category)?.items || [];
        setActiveTool(items[0] || null);
    };

    const toolItems = useMemo(() => {
        if (!activeCategory) return [];
        return STUDIO_DATA.find(data => data.category === activeCategory)?.items || [];
    }, [activeCategory]);

    const renderContent = () => {
        if (activeCategory === 'Designer') {
            switch (activeTool) {
                case 'Editor':
                    return <ManualEditor />;
                case 'UI/UX':
                case 'Graphic Design':
                case 'Vector Art':
                case 'Prototypes':
                    return <AiLayoutGenerator key={activeTool} activeTool={activeTool as string} />;
                case '3D Modeling':
                    return <Placeholder sectionName="3D Modeling" />;
                default:
                    return <Placeholder sectionName={activeTool || 'Designer'} />;
            }
        }
        
        if (activeCategory === 'Coder' && activeTool === 'IDE') {
            return <IDE />;
        }

        if (activeCategory === 'Images' && activeTool === 'Editor') {
             return <ManualEditor />;
        }
        
        if (activeCategory === 'Video' && (activeTool === 'Editor' || activeTool === 'Shorts')) {
            return <VideoEditor />;
        }

        if (!activeTool) {
             return (
                <div className="flex items-center justify-center h-full text-gray-500 font-mono p-8">
                    <p>Select a tool to get started.</p>
                </div>
            );
        }

        return (
            <div className="p-1 sm:p-2 lg:p-3">
                 <Placeholder sectionName={activeTool} />
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col text-white overflow-hidden">
            {/* Header with Category Buttons */}
            <header className="flex-shrink-0 p-4 bg-black/20 border-b border-cyber-border">
                <div className="flex items-center flex-wrap gap-3">
                    {STUDIO_DATA.map(({ category }) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                                ${activeCategory === category
                                    ? 'bg-cyber-orange/20 text-cyber-orange shadow-md'
                                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sub-Left Sidebar for Tools */}
                <aside className="w-[90px] flex-shrink-0 bg-black/20 p-2 border-r border-cyber-border flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-2 w-full">
                        {toolItems.map(item => {
                            const Icon = toolIcons[item] || ToolIcons.DefaultToolIcon;
                             return (
                                <ToolButton
                                    key={item}
                                    label={item}
                                    icon={Icon}
                                    isActive={activeTool === item}
                                    onClick={() => setActiveTool(item)}
                                />
                            )
                        })}
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 p-0 min-w-0">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Studio;
