import React, { useState, useCallback, useEffect } from 'react';
import { generateUiLayout } from '../../../services/geminiService';
import { UiLayout, UiElement, UiElementType } from '../designer/types';
import UiRenderer from '../designer/UiRenderer';
import DesignerControls from '../designer/DesignerControls';
import LoadingSpinner from '../designer/LoadingSpinner';

interface AiLayoutGeneratorProps {
    activeTool: string;
}

const defaultUiLayout: UiLayout = {
    theme: 'dark',
    layout: {
        type: 'header-sidebar-content',
        header: {
            elements: [
                { type: UiElementType.Logo, label: 'Logo' },
                { type: UiElementType.NavItem, label: 'Home' },
                { type: UiElementType.NavItem, label: 'About' },
                { type: UiElementType.Search, label: 'Search...' },
                { type: UiElementType.Button, label: 'Sign Up' },
            ],
        },
        sidebar: {
            elements: [
                { type: UiElementType.NavItem, label: 'Dashboard' },
                { type: UiElementType.NavItem, label: 'Analytics' },
                { type: UiElementType.NavItem, label: 'Reports' },
                { type: UiElementType.NavItem, label: 'Settings' },
            ],
        },
        content: {
            elements: [
                { type: UiElementType.Title, label: 'Welcome!' },
                { type: UiElementType.Paragraph, label: 'Here is some default content.' },
                { type: UiElementType.Card },
                { type: UiElementType.Card },
                { type: UiElementType.Card },
            ],
        },
    },
};


const AiLayoutGenerator: React.FC<AiLayoutGeneratorProps> = ({ activeTool }) => {
    const [uiLayout, setUiLayout] = useState<UiLayout | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const triggerGeneration = useCallback(async (currentPrompt: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateUiLayout(currentPrompt, activeTool);
            setUiLayout(result);
        } catch (err) {
            if (err instanceof Error && (err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED'))) {
                 setError("AI generation quota exceeded. Loading a default layout as a fallback.");
                 setUiLayout(defaultUiLayout);
            } else {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
                setUiLayout(null); // Clear previous layout on error
            }
        } finally {
            setIsLoading(false);
        }
    }, [activeTool]);

    useEffect(() => {
        const initialPrompt = `A modern ${activeTool} layout with a header, sidebar, and some content cards.`;
        setPrompt(initialPrompt);
        triggerGeneration(initialPrompt);
    }, [activeTool, triggerGeneration]);

    return (
        <div className="h-full flex flex-col bg-cyber-bg text-white rounded-lg overflow-hidden border border-cyber-border shadow-lg">
            <div className="flex-1 p-4 relative overflow-auto">
                {isLoading && <LoadingSpinner />}
                {error && (
                    <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center z-10">
                        <p className="text-white p-4 font-mono text-center">{error}</p>
                    </div>
                )}
                {uiLayout && <UiRenderer ui={uiLayout} />}
                {!isLoading && !error && !uiLayout && (
                     <div className="flex items-center justify-center h-full text-gray-500 font-mono">
                        <p>Enter a prompt below to generate a UI layout.</p>
                    </div>
                )}
            </div>
            <DesignerControls
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={() => triggerGeneration(prompt)}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AiLayoutGenerator;
