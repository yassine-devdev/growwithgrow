
import React, { useState } from 'react';
import { ExportIcon, FileIcon, ResizeIcon, AnimationIcon, ShareIcon, OptionsIcon, ChevronRightIcon, RulersIcon, GridIcon, SnapIcon, HelpIcon, LanguageIcon } from './icons';
import { UndoIcon, RedoIcon } from './icons';
import * as htmlToImage from 'html-to-image';

interface EditorHeaderProps {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    artboardRef: React.RefObject<HTMLDivElement>;
}

const FileDropdownMenu: React.FC = () => (
    <div className="absolute left-0 top-full mt-2 w-48 bg-[#2d2f34] border border-black/50 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
        <a href="#" className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-700">New Design</a>
        <a href="#" className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-700">Save</a>
        <a href="#" className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-700">Save to folder</a>
        <div className="h-px bg-black/30 my-1"></div>
        <a href="#" className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-700">Version history</a>
    </div>
);

const OptionsDropdownMenu: React.FC = () => (
    <div className="absolute left-0 top-full mt-2 w-56 bg-[#2d2f34] border border-black/50 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20 text-sm">
        <div className="relative group/view">
            <div className="flex justify-between items-center px-3 py-2 text-gray-300 hover:bg-gray-700 cursor-pointer">
                <span className="flex items-center gap-2"><RulersIcon className="w-4 h-4" /> View</span>
                <ChevronRightIcon className="w-3 h-3" />
            </div>
            <div className="absolute left-full -top-1 w-48 bg-[#2d2f34] border border-black/50 rounded-md shadow-lg hidden group-hover/view:block">
                 <a href="#" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700"><RulersIcon className="w-4 h-4" /> Rulers & Guides</a>
                 <a href="#" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700"><GridIcon className="w-4 h-4" /> Show Margins</a>
                 <a href="#" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700"><SnapIcon className="w-4 h-4" /> Snap to objects</a>
            </div>
        </div>
        <div className="relative group/lang">
            <div className="flex justify-between items-center px-3 py-2 text-gray-300 hover:bg-gray-700 cursor-pointer">
                <span className="flex items-center gap-2"><LanguageIcon className="w-4 h-4" /> Language</span>
                <ChevronRightIcon className="w-3 h-3" />
            </div>
             <div className="absolute left-full -top-1 w-48 bg-[#2d2f34] border border-black/50 rounded-md shadow-lg hidden group-hover/lang:block">
                 <a href="#" className="block px-3 py-2 hover:bg-gray-700">English</a>
                 <a href="#" className="block px-3 py-2 hover:bg-gray-700">Español</a>
                 <a href="#" className="block px-3 py-2 hover:bg-gray-700">Français</a>
            </div>
        </div>
        <div className="h-px bg-black/30 my-1"></div>
        <a href="#" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700"><HelpIcon className="w-4 h-4" /> Help Center</a>
    </div>
);


const EditorHeader: React.FC<EditorHeaderProps> = ({ undo, redo, canUndo, canRedo, artboardRef }) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'png' | 'svg') => {
        if (!artboardRef.current || isExporting) return;
        setIsExporting(true);

        try {
            const dataUrl = format === 'png' 
                ? await htmlToImage.toPng(artboardRef.current, { quality: 1.0 })
                : await htmlToImage.toSvg(artboardRef.current);
            
            const link = document.createElement('a');
            link.download = `design.${format}`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
      <header className="h-14 bg-[#1e1f22] flex-shrink-0 flex items-center justify-between px-4 border-b border-black/30 text-gray-300">
        <div className="flex items-center gap-2">
            <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700">
                    <FileIcon className="w-5 h-5"/>
                    <span className="font-semibold text-sm">File</span>
                </button>
                <FileDropdownMenu />
            </div>
            <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700">
                    <OptionsIcon className="w-5 h-5"/>
                    <span className="font-semibold text-sm">Options</span>
                </button>
                <OptionsDropdownMenu />
            </div>
            <div className="h-6 w-px bg-gray-700"></div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700">
                <ResizeIcon className="w-5 h-5"/>
                <span className="font-semibold text-sm">Resize</span>
            </button>
             <div className="h-6 w-px bg-gray-700"></div>
            <button onClick={undo} disabled={!canUndo} className="p-2 rounded-md hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" title="Undo"><UndoIcon className="w-5 h-5"/></button>
            <button onClick={redo} disabled={!canRedo} className="p-2 rounded-md hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" title="Redo"><RedoIcon className="w-5 h-5"/></button>
        </div>
        
        <div className="flex-1 text-center hidden lg:block">
            <input type="text" defaultValue="Untitled Design" className="bg-transparent text-center text-sm font-bold text-white tracking-wider truncate w-64 focus:bg-gray-700 rounded-md p-1 focus:ring-1 focus:ring-cyber-cyan outline-none" />
        </div>

        <div className="flex items-center gap-2">
            <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700">
                <AnimationIcon className="w-5 h-5"/>
                <span className="font-semibold text-sm">Animation</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700">
                <ShareIcon className="w-5 h-5"/>
                <span className="font-semibold text-sm">Share</span>
            </button>
            <div className="relative group">
                <button disabled={isExporting} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-cyan text-black font-bold hover:shadow-glow-cyan transition-shadow disabled:bg-gray-500">
                    <ExportIcon className="w-5 h-5" />
                    {isExporting ? 'Exporting...' : 'Export'}
                </button>
                <div className="absolute right-0 top-full mt-2 w-32 bg-[#2d2f34] border border-black/50 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                    <button onClick={() => handleExport('png')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700">Export as PNG</button>
                    <button onClick={() => handleExport('svg')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700">Export as SVG</button>
                </div>
            </div>
        </div>
      </header>
    );
  };

export default EditorHeader;
