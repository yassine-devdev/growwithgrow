
import React, { useState, useEffect, useRef } from 'react';
import * as EditorIcons from './icons';
import { CanvasElement } from '../sections/Designer';
import LayersPanel from './LayersPanel';
import { AIGeneratorIcon } from '../components/ToolIcons';

const baseToolCategories = [
    { id: 'templates', label: 'Templates', icon: EditorIcons.TemplatesIcon },
    { id: 'elements', label: 'Elements', icon: EditorIcons.ElementsIcon },
    { id: 'uploads', label: 'Uploads', icon: EditorIcons.UploadsIcon },
    { id: 'text', label: 'Text', icon: EditorIcons.TextIcon },
    { id: 'projects', label: 'Projects', icon: EditorIcons.ProjectsIcon },
    { id: 'styles', label: 'Styles', icon: EditorIcons.StylesIcon },
    { id: 'logos', label: 'Logos', icon: EditorIcons.LogosIcon },
    { id: 'apps', label: 'Apps', icon: EditorIcons.AppsIcon },
];

const DraggableItem: React.FC<{
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    children: React.ReactNode;
    title: string;
}> = ({ onDragStart, children, title }) => (
    <div 
        draggable
        onDragStart={onDragStart}
        className="aspect-square bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing"
        title={title}
    >
        {children}
    </div>
);


const ElementsPanel: React.FC<{ addElement: (type: CanvasElement['type'], props?: Partial<CanvasElement>) => void }> = ({ addElement }) => {

    const handleDragStart = (e: React.DragEvent, type: CanvasElement['type'], props: Partial<CanvasElement> = {}) => {
        const data = { type, ...props };
        e.dataTransfer.setData('application/json', JSON.stringify(data));
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const elementCategories = [
        { name: 'Tables', icon: EditorIcons.TableIcon },
        { name: 'Frames', icon: EditorIcons.FrameIcon },
        { name: 'Grids', icon: EditorIcons.GridIcon },
        { name: 'Collections', icon: EditorIcons.CollectionIcon },
    ];


    return (
         <div>
            <input type="text" placeholder="Search elements..." className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 mb-4" />
            <div className="space-y-4">
                {elementCategories.map(cat => (
                    <div key={cat.name}>
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="font-semibold text-white">{cat.name}</h4>
                             <button className="text-xs text-cyber-cyan hover:underline">Show all</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                             {[...Array(3)].map((_, i) => (
                                 <div key={i} className="aspect-square bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center cursor-pointer">
                                     <cat.icon className="w-8 h-8 text-gray-400"/>
                                 </div>
                             ))}
                        </div>
                    </div>
                ))}
            </div>
         </div>
    );
};

const UploadsPanel: React.FC<{ addElement: (type: CanvasElement['type'], props?: Partial<CanvasElement>) => void }> = ({ addElement }) => {
    const [images, setImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setImages(prev => [dataUrl, ...prev]);
                // Automatically add to canvas
                const img = new Image();
                img.onload = () => {
                     addElement('image', { src: dataUrl, width: img.width, height: img.height });
                }
                img.src = dataUrl;
            };
            reader.readAsDataURL(file);
        }
    };
    
     const handleDragStart = (e: React.DragEvent, src: string) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'image', src }));
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 flex flex-col items-center justify-center bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:border-gray-500 transition-colors">
                <EditorIcons.UploadsIcon className="w-6 h-6 mb-2"/>
                <span>Upload Image</span>
            </button>
            <div className="grid grid-cols-2 gap-2 mt-4">
                {images.map((src, i) => (
                    <div key={i} draggable onDragStart={(e) => handleDragStart(e, src)} className="aspect-square bg-gray-700 rounded-md overflow-hidden cursor-grab active:cursor-grabbing">
                        <img src={src} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        </div>
    );
};


const TextPanel: React.FC<{ addElement: (type: CanvasElement['type'], props?: Partial<CanvasElement>) => void }> = ({ addElement }) => (
    <div className="space-y-2">
        <button 
            onClick={() => addElement('text', { fontSize: 48, content: 'Add a heading', height: 60, width: 400, color: '#ffffff', textAlign: 'left', fontWeight: 'bold' })}
            className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-md text-left"
        >
            <span className="text-2xl font-bold text-white">Add a heading</span>
        </button>
        <button 
            onClick={() => addElement('text', { fontSize: 24, content: 'Add a subheading', height: 40, width: 300, color: '#ffffff', textAlign: 'left', fontWeight: 'bold' })}
            className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-md text-left"
        >
            <span className="text-lg font-semibold text-white">Add a subheading</span>
        </button>
    </div>
);

const AIPanel: React.FC<{ prompt: string, setPrompt: (p: string) => void, onGenerate: () => void, isLoading: boolean }> = 
({ prompt, setPrompt, onGenerate, isLoading }) => (
    <div className="flex flex-col h-full">
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A clean portfolio website with a sidebar and project cards."
            className="w-full flex-1 bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyber-orange resize-none"
            disabled={isLoading}
        />
        <button
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full mt-2 px-4 py-2 bg-cyber-orange text-white font-bold rounded-lg transition-all duration-300 ease-in-out hover:shadow-glow-orange disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center"
        >
            {isLoading ? 'Generating...' : 'Generate with AI'}
        </button>
    </div>
);


const PlaceholderPanel: React.FC<{ label: string }> = ({ label }) => (
    <div className="text-center text-gray-500 mt-10">
        <p>Content for {label} will appear here.</p>
    </div>
);

interface EditorLeftSidebarProps {
    addElement: (type: CanvasElement['type'], props?: Partial<CanvasElement>) => void;
    elements: CanvasElement[];
    selectedElementIds: string[];
    setSelectedElementIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    deleteElement: (id: string) => void;
    reorderElement: (draggedId: string, targetId: string) => void;
    toggleElementProperty: (id: string, prop: 'isLocked' | 'isVisible') => void;
    isAiEnabled?: boolean;
    prompt?: string;
    setPrompt?: (p: string) => void;
    onGenerate?: () => void;
    isAiLoading?: boolean;
}

const EditorLeftSidebar: React.FC<EditorLeftSidebarProps> = (props) => {
    const { isAiEnabled, prompt, setPrompt, onGenerate, isAiLoading } = props;
    const [activeCategory, setActiveCategory] = useState(isAiEnabled ? 'ai' : 'elements');
    const [toolCategories, setToolCategories] = useState(baseToolCategories);

    useEffect(() => {
        if (isAiEnabled) {
             setToolCategories([{ id: 'ai', label: 'AI Designer', icon: AIGeneratorIcon }, ...baseToolCategories]);
        } else {
             setToolCategories(baseToolCategories);
        }
    }, [isAiEnabled]);


    const activeCategoryLabel = toolCategories.find(c => c.id === activeCategory)?.label || 'Tools';

    const renderPanelContent = () => {
      switch(activeCategory) {
          case 'ai':
              return isAiEnabled && prompt !== undefined && setPrompt && onGenerate && isAiLoading !== undefined ? (
                  <AIPanel prompt={prompt} setPrompt={setPrompt} onGenerate={onGenerate} isLoading={isAiLoading} />
              ) : null;
          case 'elements': return <ElementsPanel addElement={props.addElement}/>;
          case 'text': return <TextPanel addElement={props.addElement}/>;
          case 'layers': return <LayersPanel {...props} />;
          case 'uploads': return <UploadsPanel addElement={props.addElement} />;
          default: return <PlaceholderPanel label={activeCategoryLabel} />;
      }
    };

  return (
    <div className="flex flex-shrink-0 h-full bg-[#1e1f22] border-r border-black/30">
      <nav className="w-20 bg-[#1e1f22] p-2 flex flex-col items-center gap-2 border-r border-black/30">
          {toolCategories.map(cat => (
              <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  title={cat.label}
                  className={`w-full h-16 flex flex-col items-center justify-center rounded-lg transition-colors duration-200 ${activeCategory === cat.id ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50 text-gray-400'}`}
              >
                  <cat.icon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium leading-tight">{cat.label}</span>
              </button>
          ))}
      </nav>
      <aside className="w-72 p-4 flex flex-col overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4">{activeCategoryLabel}</h3>
          {activeCategory !== 'layers' && activeCategory !== 'ai' && activeCategory !== 'elements' && <input 
              type="text" 
              placeholder={`Search ${activeCategoryLabel}...`}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 mb-4"
          />}
          <div className="flex-1">
            {renderPanelContent()}
          </div>
      </aside>
    </div>
  );
};

export default EditorLeftSidebar;
