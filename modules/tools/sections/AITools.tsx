import React, { useState } from 'react';
import TextGenerator from './TextGenerator';
import ChartGenerator from './ChartGenerator';
import ImageGenerator from './ImageGenerator';
import ToolsL3Sidebar from '../components/ToolsL3Sidebar';
import { ToolsAISection } from '../types';

const AITools: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<ToolsAISection>('Text Generator');

    const renderTool = () => {
        switch(activeL3Section) {
            case 'Text Generator': return <TextGenerator />;
            case 'Chart Generator': return <ChartGenerator />;
            case 'Image Generator': return <ImageGenerator />;
            default: return <TextGenerator />;
        }
    };

    return (
        <div className="flex h-full">
            <ToolsL3Sidebar 
                activeL2Section="AI" 
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                {renderTool()}
            </main>
        </div>
    );
}

export default AITools;
