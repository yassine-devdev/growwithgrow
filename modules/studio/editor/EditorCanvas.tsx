import React, { useRef, useCallback, useState, useEffect } from 'react';
import { CanvasElement } from '../sections/Designer';
import { Rnd } from 'react-rnd';

export const ARTBOARD_WIDTH = 1080;
export const ARTBOARD_HEIGHT = 1080;

interface ElementProps {
    data: CanvasElement, 
    isSelected: boolean,
    onSelect: (e: React.MouseEvent, id: string) => void,
    onUpdate: (id: string, props: Partial<CanvasElement>) => void,
}

const Element: React.FC<ElementProps> = ({ data, isSelected, onSelect, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing && textRef.current) {
            textRef.current.focus();
            document.execCommand('selectAll', false, null);
        }
    }, [isEditing]);

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(e, data.id);
    };

    const handleDoubleClick = () => {
        if ((data.type === 'text' || data.content) && !data.isLocked) {
            setIsEditing(true);
        }
    }
    
    const handleTextBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        setIsEditing(false);
        onUpdate(data.id, { content: e.currentTarget.textContent || '' });
    };

    const handleTextKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Escape') e.currentTarget.blur();
    };

    const shadow = (data.shadowBlur || 0) > 0 
        ? `${data.shadowX || 0}px ${data.shadowY || 0}px ${data.shadowBlur || 0}px ${data.shadowColor || 'rgba(0,0,0,0.5)'}`
        : 'none';
        
    const textShadow = (data.textShadowBlur || 0) > 0 || data.textShadowX || data.textShadowY
        ? `${data.textShadowX || 0}px ${data.textShadowY || 0}px ${data.textShadowBlur || 0}px ${data.textShadowColor || 'rgba(0,0,0,0.5)'}`
        : 'none';

    const style: React.CSSProperties = {
        width: '100%', height: '100%',
        display: 'flex', 
        alignItems: 'center',
        background: data.type === 'text' ? 'transparent' : data.backgroundColor,
        color: data.color,
        fontSize: `${data.fontSize}px`,
        fontFamily: data.fontFamily || 'Inter, sans-serif',
        fontWeight: data.fontWeight || 'normal',
        fontStyle: data.fontStyle || 'normal',
        justifyContent: data.textAlign || 'center',
        textAlign: data.textAlign || 'center',
        lineHeight: data.lineHeight,
        letterSpacing: `${data.letterSpacing || 0}px`,
        transform: `rotate(${data.rotate}deg)`,
        borderRadius: data.type === 'circle' ? '50%' : `${data.borderRadius || 0}px`,
        border: `${data.borderWidth || 0}px ${data.borderStyle || 'solid'} ${data.borderColor || 'transparent'}`,
        boxShadow: shadow,
        outline: 'none',
        padding: data.type === 'text' ? '0' : '8px',
        boxSizing: 'border-box',
        opacity: data.opacity ?? 1,
        pointerEvents: isEditing ? 'auto' : 'none',
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word',
        textDecoration: data.textDecoration ?? 'none',
        textTransform: data.textTransform ?? 'none',
        textShadow: textShadow,
        // @ts-ignore
        WebkitTextStroke: (data.textStrokeWidth || 0) > 0 ? `${data.textStrokeWidth}px ${data.textStrokeColor}` : 'none',
    };

    const renderContent = () => {
        if (data.type === 'image') {
            return <img src={data.src} alt={data.content || 'uploaded image'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />;
        }
        if (data.type === 'svg') {
            return <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{fill: data.fillColor || data.backgroundColor, stroke: data.borderColor, strokeWidth: data.borderWidth}}>
                <path d={data.svgPath} />
            </svg>
        }
        return (
            <div
                ref={textRef}
                style={{width: '100%', height: '100%', display: 'flex', alignItems: data.verticalAlign === 'top' ? 'flex-start' : data.verticalAlign === 'bottom' ? 'flex-end' : 'center', justifyContent: data.textAlign || 'center', pointerEvents: isEditing ? 'auto' : 'none'}}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={handleTextBlur}
                onKeyDown={handleTextKeyDown}
                dangerouslySetInnerHTML={{ __html: data.content || '' }}
            />
        );
    };
    
    const resizeHandleClasses = {
        top: 'cursor-n-resize', right: 'cursor-e-resize', bottom: 'cursor-s-resize', left: 'cursor-w-resize',
        topRight: 'cursor-ne-resize', bottomRight: 'cursor-se-resize', bottomLeft: 'cursor-sw-resize', topLeft: 'cursor-nw-resize',
    };

    return (
        <Rnd
            size={{ width: data.width, height: data.height }}
            position={{ x: data.x, y: data.y }}
            onDragStop={(e, d) => { onUpdate(data.id, { x: d.x, y: d.y }) }}
            onResizeStop={(e, direction, ref, delta, position) => {
                onUpdate(data.id, {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    ...position,
                });
            }}
            onClick={data.isLocked ? (e) => e.stopPropagation() : handleSelect}
            onDoubleClick={handleDoubleClick}
            className={isSelected ? 'z-10' : 'z-0'}
            style={{ border: isSelected && !isEditing ? '2px solid #00ffff' : '2px solid transparent' }}
            lockAspectRatio={data.type === 'circle' || data.type === 'image'}
            cancel="[contenteditable]"
            disableDragging={data.isLocked}
            enableResizing={!data.isLocked ? { top: true, right: true, bottom: true, left: true, topRight: true, bottomRight: true, bottomLeft: true, topLeft: true } : { top: false, right: false, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
            resizeHandleClasses={resizeHandleClasses}
        >
            <div style={style}>
                 {renderContent()}
            </div>
        </Rnd>
    )
};


const EditorCanvas: React.FC<{
    artboardRef: React.RefObject<HTMLDivElement>;
    elements: CanvasElement[];
    setElements: (updater: (prev: CanvasElement[]) => CanvasElement[]) => void;
    selectedElementIds: string[];
    setSelectedElementIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    zoom: number;
    isLoading: boolean;
    error: string | null;
}> = ({ artboardRef, elements, setElements, selectedElementIds, setSelectedElementIds, zoom, isLoading, error }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const selectionBoxStart = useRef<{ x: number; y: number } | null>(null);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        if (!artboardRef.current) return;
        const data = JSON.parse(event.dataTransfer.getData('application/json'));

        const artboardBounds = artboardRef.current.getBoundingClientRect();
        const x = (event.clientX - artboardBounds.left) / zoom;
        const y = (event.clientY - artboardBounds.top) / zoom;

        const newElement: CanvasElement = {
            id: Date.now().toString(), 
            x: x - (data.width || 150) / 2, 
            y: y - (data.height || 100) / 2,
            width: 150, height: 100,
            backgroundColor: '#3b82f6', rotate: 0, opacity: 1,
            content: 'New Text', color: '#ffffff', fontSize: 16, textAlign: 'center',
            isVisible: true, isLocked: false,
            ...data
        };
        setElements(prev => [...prev, newElement]);
        setSelectedElementIds([newElement.id]);
    }, [zoom, setElements, setSelectedElementIds]);


    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (!canvasRef.current || e.target !== canvasRef.current) return;
        e.preventDefault();
        selectionBoxStart.current = { x: e.clientX, y: e.clientY };
        setSelectedElementIds([]);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!selectionBoxStart.current || !canvasRef.current) return;
            const canvasBounds = canvasRef.current.getBoundingClientRect();
            const startX = selectionBoxStart.current.x - canvasBounds.left;
            const startY = selectionBoxStart.current.y - canvasBounds.top;
            const currentX = moveEvent.clientX - canvasBounds.left;
            const currentY = moveEvent.clientY - canvasBounds.top;
            
            const x = Math.min(startX, currentX);
            const y = Math.min(startY, currentY);
            const width = Math.abs(startX - currentX);
            const height = Math.abs(startY - currentY);
            setSelectionBox({ x, y, width, height });
        };
        const handleMouseUp = (upEvent: MouseEvent) => {
            if (selectionBox) {
                const artboardBounds = artboardRef.current!.getBoundingClientRect();
                const selectionRect = {
                    x: (selectionBox.x - (artboardBounds.left - canvasRef.current!.getBoundingClientRect().left)) / zoom,
                    y: (selectionBox.y - (artboardBounds.top - canvasRef.current!.getBoundingClientRect().top)) / zoom,
                    width: selectionBox.width / zoom,
                    height: selectionBox.height / zoom
                };
                
                const selectedIds = elements.filter(el => {
                    const elRect = { x: el.x, y: el.y, width: el.width, height: el.height };
                    return (
                        !el.isLocked &&
                        elRect.x < selectionRect.x + selectionRect.width &&
                        elRect.x + elRect.width > selectionRect.x &&
                        elRect.y < selectionRect.y + selectionRect.height &&
                        elRect.y + elRect.height > selectionRect.y
                    );
                }).map(el => el.id);
                setSelectedElementIds(selectedIds);
            }
            selectionBoxStart.current = null;
            setSelectionBox(null);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleSelect = (e: React.MouseEvent, id: string) => {
        if (e.shiftKey) {
            setSelectedElementIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else {
            setSelectedElementIds([id]);
        }
    };
    
    const updateElement = (id: string, newProps: Partial<CanvasElement>) => {
        setElements(prev =>
            prev.map(el => (el.id === id ? { ...el, ...newProps } : el))
        );
    };

    return (
        <main ref={canvasRef} onMouseDown={handleCanvasMouseDown} className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-auto" onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}>
            <style>{`.react-resizable-handle { background: #00ffff; border: 1px solid #0a0a1a; width: 10px !important; height: 10px !important; box-sizing: border-box; }`}</style>
             {selectionBox && <div className="absolute border-2 border-dashed border-cyber-cyan bg-cyber-cyan/10 pointer-events-none z-50" style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.width, height: selectionBox.height }} />}
            <div 
                ref={artboardRef}
                className="bg-white shadow-2xl flex-shrink-0 origin-top-left relative"
                style={{ width: `${ARTBOARD_WIDTH}px`, height: `${ARTBOARD_HEIGHT}px`, transform: `scale(${zoom})`, transformOrigin: '0 0', }}
                onClick={(e) => e.stopPropagation()}
            >
                {isLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"><p className="text-white font-bold text-lg">Generating UI...</p></div>}
                {error && <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center z-20"><p className="text-white p-4 font-mono text-center">{error}</p></div>}
                
                {elements.filter(el => el.isVisible !== false).map((el) => (
                    <Element 
                        key={el.id} data={el}
                        isSelected={selectedElementIds.includes(el.id)}
                        onSelect={handleSelect} onUpdate={updateElement}
                    />
                ))}
            </div>
        </main>
    );
};

export default EditorCanvas;
