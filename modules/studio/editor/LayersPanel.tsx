
import React, { useState } from 'react';
import type { CanvasElement } from '../sections/Designer';
import * as EditorIcons from './icons';

interface LayersPanelProps {
    elements: CanvasElement[];
    selectedElementIds: string[];
    setSelectedElementIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    deleteElement: (id: string) => void;
    reorderElement: (draggedId: string, targetId: string) => void;
    toggleElementProperty: (id: string, prop: 'isLocked' | 'isVisible') => void;
}

const LayerItem: React.FC<{ 
    element: CanvasElement, 
    isSelected: boolean,
    onSelect: (e: React.MouseEvent, id: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, id: string) => void;
} & Omit<LayersPanelProps, 'elements' | 'selectedElementIds' | 'reorderElement'>> = ({ 
    element, isSelected, onSelect, onDragStart, onDragOver, onDrop,
    setSelectedElementIds, deleteElement, toggleElementProperty 
}) => {
    
    const ElementIcon = () => {
        switch (element.type) {
            case 'rect': return <EditorIcons.RectangleIcon className="w-4 h-4" />;
            case 'circle': return <EditorIcons.CircleIcon className="w-4 h-4" />;
            case 'text': return <EditorIcons.TextIcon className="w-4 h-4" />;
            case 'image': return <EditorIcons.ElementsIcon className="w-4 h-4" />;
            case 'svg': return <EditorIcons.ElementsIcon className="w-4 h-4" />;
            default: return null;
        }
    };

    const elementName = element.type === 'text' ? (element.content?.substring(0, 20) || 'Text') : element.type;
    const isVisible = element.isVisible !== false;
    const isLocked = element.isLocked === true;

    return (
        <div 
            draggable
            onDragStart={(e) => onDragStart(e, element.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, element.id)}
            onClick={(e) => onSelect(e, element.id)}
            className={`flex items-center p-2 rounded-md transition-colors cursor-pointer group ${isSelected ? 'bg-blue-600/50' : 'hover:bg-gray-700/50'} ${!isVisible ? 'opacity-50' : ''}`}
        >
            <div className="flex items-center gap-2 flex-1 truncate">
                <ElementIcon />
                <span className="text-sm truncate">{elementName}</span>
            </div>
             <div className="flex items-center gap-0.5">
                <button onClick={(e) => { e.stopPropagation(); toggleElementProperty(element.id, 'isVisible') }} className="p-1 rounded hover:bg-white/10 text-gray-400" title={isVisible ? "Hide" : "Show"}>
                    {isVisible ? <EditorIcons.EyeIcon className="w-4 h-4"/> : <EditorIcons.EyeSlashIcon className="w-4 h-4"/>}
                </button>
                <button onClick={(e) => { e.stopPropagation(); toggleElementProperty(element.id, 'isLocked') }} className="p-1 rounded hover:bg-white/10 text-gray-400" title={isLocked ? "Unlock" : "Lock"}>
                    {isLocked ? <EditorIcons.LockClosedIcon className="w-4 h-4"/> : <EditorIcons.LockOpenIcon className="w-4 h-4"/>}
                </button>
            </div>
        </div>
    );
};


const LayersPanel: React.FC<LayersPanelProps> = (props) => {
    const reversedElements = [...props.elements].reverse();

    if (props.elements.length === 0) {
        return (
            <div className="text-center text-gray-500 mt-10">
                <p>No layers yet. Add an element to the canvas.</p>
            </div>
        );
    }
    
    const handleSelect = (e: React.MouseEvent, id: string) => {
        if (e.shiftKey) {
            props.setSelectedElementIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else {
            props.setSelectedElementIds([id]);
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData("text/plain");
        if (draggedId && targetId && draggedId !== targetId) {
            props.reorderElement(draggedId, targetId);
        }
    };

    return (
        <div className="space-y-1">
           {reversedElements.map((el) => (
               <LayerItem
                   key={el.id}
                   element={el}
                   isSelected={props.selectedElementIds.includes(el.id)}
                   onSelect={handleSelect}
                   onDragStart={handleDragStart}
                   onDragOver={handleDragOver}
                   onDrop={handleDrop}
                   {...props}
               />
           ))}
        </div>
    );
};

export default LayersPanel;
