import React, { useRef } from 'react';
import * as Icons from './icons';
import { MediaAsset, Track, Clip, ClipProperties, Keyframe } from '../sections/VideoEditor';

type AnimatableProperty = 'opacity' | 'size' | 'position' | 'rotate';

interface Effect {
    name: string;
    property: AnimatableProperty;
    keyframes: Omit<Keyframe<any>, 'id'>[];
}

const effects: Effect[] = [
    { name: 'Fade In', property: 'opacity', keyframes: [{ time: 0, value: 0 }, { time: 1, value: 100 }] },
    { name: 'Fade Out', property: 'opacity', keyframes: [{ time: 0, value: 100 }, { time: 1, value: 0 }] },
    { name: 'Slide In', property: 'position', keyframes: [{ time: 0, value: {x: -50, y: 50} }, { time: 1, value: {x: 50, y: 50} }] },
    { name: 'Zoom In', property: 'size', keyframes: [{ time: 0, value: 50 }, { time: 1, value: 100 }] },
];


const MediaPanelContent: React.FC<{ mediaAssets: MediaAsset[], onFileUpload: (file: File) => void }> = ({ mediaAssets, onFileUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
    };

    const handleDragStart = (e: React.DragEvent, asset: MediaAsset) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'media', assetId: asset.id }));
    };

    return (
     <>
        <input type="file" accept="video/*,audio/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 flex flex-col items-center justify-center bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:border-gray-500 transition-colors">
            <Icons.UploadIcon className="w-6 h-6 mb-2"/>
            <span>Upload</span>
        </button>
        <div className="grid grid-cols-2 gap-2 mt-4">
            {mediaAssets.map(asset => (
                <div 
                    key={asset.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, asset)}
                    className="relative aspect-video bg-gray-700 rounded-md overflow-hidden group cursor-grab active:cursor-grabbing"
                    title={asset.name}
                >
                    {asset.type === 'video' ? (
                        <video src={asset.url} className="object-cover w-full h-full pointer-events-none" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-2">
                           <Icons.AudioIcon className="w-8 h-8 text-green-400"/>
                           <p className="text-xs text-center text-gray-300 mt-2 break-all">{asset.name}</p>
                        </div>
                    )}
                    <span className="absolute bottom-1 right-1 text-xs bg-black/50 px-1 rounded">{asset.duration.toFixed(1)}s</span>
                </div>
            ))}
        </div>
     </>
    );
};

const TextPanelContent: React.FC<{ onAddText: () => void }> = ({ onAddText }) => (
    <div className="space-y-2">
        <button 
            onClick={onAddText}
            className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-md text-left"
        >
            <span className="text-lg font-bold text-white">Add Text</span>
        </button>
    </div>
);

const EffectsPanelContent: React.FC<{}> = () => {
     const handleDragStart = (e: React.DragEvent, effect: Effect) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'effect', effect }));
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            {effects.map(effect => (
                <div 
                    key={effect.name}
                    draggable
                    onDragStart={(e) => handleDragStart(e, effect)}
                    className="aspect-video bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center p-2 text-center text-white font-semibold cursor-grab active:cursor-grabbing"
                    title={`Drag to apply ${effect.name}`}
                >
                    {effect.name}
                </div>
            ))}
        </div>
    );
}

interface LeftPanelProps {
    activeTool: string;
    setActiveTool: (tool: string) => void;
    mediaAssets: MediaAsset[];
    onFileUpload: (file: File) => void;
    onAddTextClip: (trackId: string, time: number) => void;
    onApplyEffect: (clipId: string, effect: any) => void;
    tracks: Track[];
}

const LeftPanel: React.FC<LeftPanelProps> = ({ activeTool, setActiveTool, mediaAssets, onFileUpload, onAddTextClip, tracks }) => {
    const toolCategories = [
        { id: 'media', label: 'Media', icon: Icons.MediaIcon },
        { id: 'text', label: 'Text', icon: Icons.TextIcon },
        { id: 'effects', label: 'Effects', icon: Icons.EffectsIcon },
    ];

    const handleAddText = () => {
        const firstVideoTrack = tracks.find(t => t.type === 'video');
        if (firstVideoTrack) {
            onAddTextClip(firstVideoTrack.id, 0); // Add at the beginning for simplicity
        } else {
            alert("Please add a video track first.");
        }
    };
    
    const renderPanelContent = () => {
        switch(activeTool) {
            case 'media':
                return <MediaPanelContent mediaAssets={mediaAssets} onFileUpload={onFileUpload} />;
            case 'text':
                return <TextPanelContent onAddText={handleAddText} />;
            case 'effects':
                 return <EffectsPanelContent />;
            default:
                const activeToolLabel = toolCategories.find(t => t.id === activeTool)?.label || 'Tool';
                return <div className="text-center text-gray-500 mt-10"><p>Assets for '{activeToolLabel}'</p></div>;
        }
    }

    return (
        <div className="w-full bg-[#202122] flex h-full flex-shrink-0">
            <nav className="w-20 bg-[#161718] p-2 flex flex-col items-center gap-2 border-r border-black/30">
                {toolCategories.map(tool => (
                     <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        title={tool.label}
                        className={`w-full h-16 flex flex-col items-center justify-center rounded-lg transition-colors duration-200 ${activeTool === tool.id ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50 text-gray-400'}`}
                    >
                        <tool.icon className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium leading-tight text-center">{tool.label}</span>
                    </button>
                ))}
            </nav>
            <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold text-white mb-4">Project</h3>
                {renderPanelContent()}
            </div>
        </div>
    );
};

export default LeftPanel;
