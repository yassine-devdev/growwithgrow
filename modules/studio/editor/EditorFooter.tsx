
import React from 'react';
import { ZoomInIcon, ZoomOutIcon, FitToScreenIcon, AddPageIcon, DuplicatePageIcon, TrashIcon, PageUpIcon, PageDownIcon } from './icons';
import type { Page } from '../sections/Designer';

interface EditorFooterProps {
    zoom: number;
    setZoom: (zoom: number) => void;
    fitCanvasToScreen: () => void;
    pages: Page[];
    currentPageId: string;
    setCurrentPageId: (id: string) => void;
    addPage: () => void;
    duplicatePage: (id: string) => void;
    deletePage: (id: string) => void;
}

const EditorFooter: React.FC<EditorFooterProps> = ({ 
    zoom, setZoom, fitCanvasToScreen,
    pages, currentPageId, setCurrentPageId,
    addPage, duplicatePage, deletePage
}) => {
    const zoomPercentage = Math.round(zoom * 100);
    const currentPageIndex = pages.findIndex(p => p.id === currentPageId);

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoom(parseInt(e.target.value) / 100);
    };

    const zoomIn = () => setZoom(Math.min(2, zoom + 0.1));
    const zoomOut = () => setZoom(Math.max(0.1, zoom - 0.1));
    const prevPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageId(pages[currentPageIndex - 1].id);
        }
    };
    const nextPage = () => {
        if (currentPageIndex < pages.length - 1) {
            setCurrentPageId(pages[currentPageIndex + 1].id);
        }
    };


    return (
        <div className="h-12 bg-[#1e1f22] flex-shrink-0 flex items-center justify-between px-4 gap-2 border-t border-black/30">
            {/* Page Controls */}
            <div className="flex items-center gap-2 text-gray-300">
                <button onClick={prevPage} disabled={currentPageIndex <= 0} className="p-2 rounded-md hover:bg-white/10 disabled:opacity-50" title="Previous Page"><PageUpIcon className="w-5 h-5"/></button>
                <span className="text-sm font-semibold w-20 text-center">{`Page ${currentPageIndex + 1} of ${pages.length}`}</span>
                <button onClick={nextPage} disabled={currentPageIndex >= pages.length - 1} className="p-2 rounded-md hover:bg-white/10 disabled:opacity-50" title="Next Page"><PageDownIcon className="w-5 h-5"/></button>
                <div className="w-px h-5 bg-gray-700 mx-2"></div>
                <button onClick={addPage} className="p-2 rounded-md hover:bg-white/10" title="Add Page"><AddPageIcon className="w-5 h-5"/></button>
                <button onClick={() => duplicatePage(currentPageId)} className="p-2 rounded-md hover:bg-white/10" title="Duplicate Page"><DuplicatePageIcon className="w-5 h-5"/></button>
                <button onClick={() => deletePage(currentPageId)} disabled={pages.length <= 1} className="p-2 rounded-md hover:bg-white/10 disabled:opacity-50" title="Delete Page"><TrashIcon className="w-5 h-5"/></button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
                <button onClick={zoomOut} className="p-2 rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Zoom Out">
                    <ZoomOutIcon className="w-5 h-5" />
                </button>
                <input 
                    type="range"
                    min="10"
                    max="200"
                    value={zoomPercentage}
                    onChange={handleZoomChange}
                    className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm"
                />
                <span className="text-sm font-semibold w-16 text-center cursor-default">{zoomPercentage}%</span>
                <button onClick={zoomIn} className="p-2 rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Zoom In">
                    <ZoomInIcon className="w-5 h-5" />
                </button>
                <div className="w-px h-5 bg-gray-700 mx-2"></div>
                <button onClick={fitCanvasToScreen} className="p-2 rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Fit to screen">
                    <FitToScreenIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default EditorFooter;
