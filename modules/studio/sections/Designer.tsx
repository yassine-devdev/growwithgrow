
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import EditorHeader from '../editor/EditorHeader';
import EditorLeftSidebar from '../editor/EditorLeftSidebar';
import EditorRightSidebar from '../editor/EditorRightSidebar';
import EditorCanvas, { ARTBOARD_WIDTH, ARTBOARD_HEIGHT } from '../editor/EditorCanvas';
import EditorFooter from '../editor/EditorFooter';
import { generateUiLayout } from '../../../services/geminiService';
import { UiLayout, UiElement, UiElementType } from '../designer/types';
import { nanoid } from 'nanoid';

// Centralized Type Definition for all Editor components
export interface CanvasElement {
    id: string;
    type: 'rect' | 'text' | 'circle' | 'image' | 'svg';
    x: number;
    y: number;
    width: number;
    height: number;
    rotate?: number;
    opacity?: number;
    isVisible?: boolean;
    isLocked?: boolean;
    parentId?: string; // For grouping
    // Shape properties
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    // Shadow properties
    shadowColor?: string;
    shadowX?: number;
    shadowY?: number;
    shadowBlur?: number;
    // Text properties
    content?: string;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number; 
    letterSpacing?: number;
    textDecoration?: 'none' | 'underline' | 'line-through';
    textTransform?: 'none' | 'uppercase' | 'lowercase';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    textStrokeColor?: string;
    textStrokeWidth?: number;
    textShadowColor?: string;
    textShadowX?: number;
    textShadowY?: number;
    textShadowBlur?: number;
    // Image properties
    src?: string;
    // SVG properties
    svgPath?: string;
    fillColor?: string;
}

export interface Page {
    id: string;
    elements: CanvasElement[];
}

export interface DesignState {
    pages: Page[];
    currentPageId: string;
}


// AI Generation Mapping Logic
const mapUiElementToCanvasElement = (el: UiElement, themeColors: any, id: string): Omit<CanvasElement, 'x' | 'y'> => {
    const base = { rotate: 0, opacity: 1, borderWidth: 0, borderColor: 'transparent', color: themeColors.text, fontFamily: 'Inter', fontWeight: 'normal' as 'normal', fontStyle: 'normal' as 'normal', isVisible: true, isLocked: false };
    
    switch (el.type) {
        case UiElementType.Logo:
            return { ...base, id, type: 'circle', width: 50, height: 50, backgroundColor: themeColors.primary, content: 'Logo', color: '#fff', textAlign: 'center', fontSize: 14, fontWeight: 'bold' };
        case UiElementType.Search:
            return { ...base, id, type: 'rect', width: 200, height: 36, borderRadius: 18, backgroundColor: themeColors.card, content: el.label || 'Search...', textAlign: 'left', color: themeColors.text, fontSize: 14 };
        case UiElementType.Button:
            return { ...base, id, type: 'rect', width: 120, height: 40, borderRadius: 8, backgroundColor: themeColors.primary, content: el.label || 'Button', textAlign: 'center', color: '#fff', fontSize: 14, fontWeight: 'bold' };
        case UiElementType.NavItem:
            return { ...base, id, type: 'text', width: 150, height: 30, content: el.label || 'Nav Item', textAlign: 'left', fontSize: 14, backgroundColor: 'transparent' };
        case UiElementType.Title:
            return { ...base, id, type: 'text', width: 400, height: 50, content: el.label || 'Title', fontSize: 32, fontWeight: 'bold', backgroundColor: 'transparent' };
        case UiElementType.Paragraph:
            return { ...base, id, type: 'text', width: 400, height: 80, content: el.label || 'Lorem ipsum dolor sit amet...', fontSize: 14, backgroundColor: 'transparent' };
        case UiElementType.Card:
            return { ...base, id, type: 'rect', width: 220, height: 280, backgroundColor: themeColors.card, borderRadius: 12, borderWidth: 1, borderColor: themeColors.border, content: 'Card', textAlign: 'center' };
        default:
            return { ...base, id, type: 'rect', width: 100, height: 50, content: el.type, backgroundColor: themeColors.card, textAlign: 'center' };
    }
};

const uiLayoutToCanvasElements = (ui: UiLayout): CanvasElement[] => {
    const elements: CanvasElement[] = [];
    const themeClasses = { dark: { bg: '#2d2f34', text: '#e5e7eb', card: '#374151', border: '#4b5563', primary: '#3b82f6' }, light: { bg: '#f3f4f6', text: '#1f2937', card: '#ffffff', border: '#e5e7eb', primary: '#3b82f6' }, corporate: { bg: '#f3f4f6', text: '#1f2937', card: '#ffffff', border: '#d1d5db', primary: '#4f46e5' }};
    const currentTheme = themeClasses[ui.theme as keyof typeof themeClasses] || themeClasses.dark;
    const PADDING = 40; const GAP = 20; let yCursor = PADDING;
    if (ui.layout.header?.elements) {
        let xCursor = PADDING; let rowHeight = 0;
        ui.layout.header.elements.forEach((el, index) => {
            const mappedEl = mapUiElementToCanvasElement(el, currentTheme, `header-${index}`);
            elements.push({ ...mappedEl, x: xCursor, y: yCursor, content: mappedEl.content || el.label });
            xCursor += mappedEl.width + GAP; rowHeight = Math.max(rowHeight, mappedEl.height);
        });
        yCursor += rowHeight + GAP * 2;
    }
    let sidebarYCursor = yCursor; const sidebarWidth = ui.layout.sidebar ? 200 : 0;
    if (ui.layout.sidebar?.elements) {
        let xCursor = PADDING;
        ui.layout.sidebar.elements.forEach((el, index) => {
            const mappedEl = mapUiElementToCanvasElement(el, currentTheme, `sidebar-${index}`);
            elements.push({ ...mappedEl, x: xCursor, y: sidebarYCursor, content: mappedEl.content || el.label });
            sidebarYCursor += mappedEl.height + GAP;
        });
    }
    if (ui.layout.content?.elements) {
        let contentXCursor = PADDING + sidebarWidth + GAP; let contentYCursor = yCursor; let contentRowHeight = 0;
        ui.layout.content.elements.forEach((el, index) => {
            const mappedEl = mapUiElementToCanvasElement(el, currentTheme, `content-${index}`);
            if (contentXCursor + mappedEl.width > ARTBOARD_WIDTH - PADDING) {
                contentXCursor = PADDING + sidebarWidth + GAP; contentYCursor += contentRowHeight + GAP; contentRowHeight = 0;
            }
            elements.push({ ...mappedEl, x: contentXCursor, y: contentYCursor, content: mappedEl.content || el.label });
            contentXCursor += mappedEl.width + GAP; contentRowHeight = Math.max(contentRowHeight, mappedEl.height);
        });
    }
    return elements;
};

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


// Custom hook for managing state history (Undo/Redo)
const useHistory = <T,>(initialState: T) => {
    const [history, setHistory] = useState({
        past: [] as T[],
        present: initialState,
        future: [] as T[],
    });

    const setState = useCallback((newState: T | ((prev: T) => T)) => {
        setHistory(currentHistory => {
            const newPresent = typeof newState === 'function' ? (newState as (prev: T) => T)(currentHistory.present) : newState;
            if (JSON.stringify(newPresent) === JSON.stringify(currentHistory.present)) return currentHistory;
            return { past: [...currentHistory.past, currentHistory.present], present: newPresent, future: [] };
        });
    }, []);

    const undo = useCallback(() => {
        setHistory(currentHistory => {
            if (currentHistory.past.length === 0) return currentHistory;
            const newPast = currentHistory.past.slice(0, currentHistory.past.length - 1);
            return { past: newPast, present: currentHistory.past[currentHistory.past.length - 1], future: [currentHistory.present, ...currentHistory.future] };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory(currentHistory => {
            if (currentHistory.future.length === 0) return currentHistory;
            const newFuture = currentHistory.future.slice(1);
            return { past: [...currentHistory.past, currentHistory.present], present: currentHistory.future[0], future: newFuture };
        });
    }, []);

    return { state: history.present, setState, undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0 };
};


const Designer: React.FC<{ activeTool?: string; isAiEnabled?: boolean; }> = ({ activeTool, isAiEnabled = true }) => {
    const firstPageId = useMemo(() => nanoid(), []);
    const { state: design, setState: setDesign, undo, redo, canUndo, canRedo } = useHistory<DesignState>({
        pages: [{ id: firstPageId, elements: [] }],
        currentPageId: firstPageId,
    });

    const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
    const [zoom, setZoom] = useState(1);
    const [clipboard, setClipboard] = useState<CanvasElement[]>([]);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const artboardRef = useRef<HTMLDivElement>(null);
    
    const [prompt, setPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(isAiEnabled);
    const [aiError, setAiError] = useState<string|null>(null);
    
    const currentPage = useMemo(() => design.pages.find(p => p.id === design.currentPageId) || design.pages[0], [design.pages, design.currentPageId]);
    const currentPageElements = currentPage.elements;

    const setCurrentPageElements = useCallback((updater: React.SetStateAction<CanvasElement[]>) => {
        setDesign(currentDesign => {
            const newPages = currentDesign.pages.map(page => {
                if (page.id === currentDesign.currentPageId) {
                    const newElements = typeof updater === 'function' ? updater(page.elements) : updater;
                    return { ...page, elements: newElements };
                }
                return page;
            });
            return { ...currentDesign, pages: newPages };
        });
    }, [setDesign]);


    const fitCanvasToScreen = useCallback(() => {
        if (!canvasWrapperRef.current) return;
        const { width: containerWidth, height: containerHeight } = canvasWrapperRef.current.getBoundingClientRect();
        const PADDING = 64; 
        const scaleX = (containerWidth - PADDING) / ARTBOARD_WIDTH;
        const scaleY = (containerHeight - PADDING) / ARTBOARD_HEIGHT;
        const newZoom = Math.min(scaleX, scaleY);
        setZoom(Math.max(0.05, newZoom));
    }, []);

    const triggerGeneration = useCallback(async (currentPrompt: string) => {
        if (!isAiEnabled || !currentPrompt.trim()) return;
        setIsAiLoading(true); setAiError(null); setCurrentPageElements([]);
        try {
            const result = await generateUiLayout(currentPrompt, activeTool || 'UI/UX');
            setCurrentPageElements(uiLayoutToCanvasElements(result));
        } catch (err) {
            if (err instanceof Error && (err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED'))) {
                 setAiError("AI generation quota exceeded. Loading a default layout as a fallback.");
                 setCurrentPageElements(uiLayoutToCanvasElements(defaultUiLayout));
            } else {
                setAiError(err instanceof Error ? err.message : "An unknown error occurred.");
            }
        } finally {
            setIsAiLoading(false);
        }
    }, [activeTool, isAiEnabled, setCurrentPageElements]);

    useEffect(() => {
        if (isAiEnabled && activeTool) {
            const initialPrompt = `A modern ${activeTool} dashboard with a header, sidebar, and some content cards.`;
            setPrompt(initialPrompt);
            triggerGeneration(initialPrompt);
        } else {
            setIsAiLoading(false);
        }
        fitCanvasToScreen();
        window.addEventListener('resize', fitCanvasToScreen);
        return () => {
            window.removeEventListener('resize', fitCanvasToScreen);
        }
    }, [fitCanvasToScreen, activeTool, isAiEnabled, triggerGeneration]);
    
    const addElement = useCallback((type: CanvasElement['type'], props: Partial<CanvasElement> = {}) => {
        const newElement: CanvasElement = {
            id: nanoid(), type, x: 100, y: 100,
            width: type === 'rect' ? 150 : (type === 'circle' ? 120 : (type === 'image' ? 200 : 250)),
            height: type === 'rect' ? 100 : (type === 'circle' ? 120 : (type === 'image' ? 150 : 50)),
            rotate: 0, opacity: 1, backgroundColor: '#3b82f6', borderColor: 'transparent',
            borderWidth: 0, borderRadius: 0, borderStyle: 'solid',
            shadowColor: '#000000', shadowX: 0, shadowY: 0, shadowBlur: 0,
            content: 'Hello World', fontSize: 16, color: '#ffffff', fontFamily: 'Inter', fontWeight: 'normal',
            fontStyle: 'normal', textAlign: 'center', lineHeight: 1.5, letterSpacing: 0,
            textDecoration: 'none', textTransform: 'none', verticalAlign: 'middle',
            textStrokeWidth: 0, textShadowBlur: 0, textShadowX: 0, textShadowY: 0,
            isVisible: true, isLocked: false,
            ...props,
        };
        setCurrentPageElements(prev => [...prev, newElement]);
        setSelectedElementIds([newElement.id]);
    }, [setCurrentPageElements]);

    const updateElement = useCallback((id: string, newProps: Partial<CanvasElement>) => {
        setCurrentPageElements(prev => prev.map(el => (el.id === id ? { ...el, ...newProps } : el)));
    }, [setCurrentPageElements]);

    const updateSelectedElements = useCallback((newProps: Partial<CanvasElement>) => {
        setCurrentPageElements(prev => prev.map(el => (selectedElementIds.includes(el.id) ? { ...el, ...newProps } : el)));
    }, [selectedElementIds, setCurrentPageElements]);
    
    const deleteElement = useCallback((id: string) => {
        setCurrentPageElements(prev => prev.filter(el => el.id !== id));
        setSelectedElementIds(prev => prev.filter(selectedId => selectedId !== id));
    }, [setCurrentPageElements]);

    const deleteSelectedElements = useCallback(() => {
        setCurrentPageElements(prev => prev.filter(el => !selectedElementIds.includes(el.id)));
        setSelectedElementIds([]);
    }, [selectedElementIds, setCurrentPageElements]);

    const duplicateSelectedElements = useCallback(() => {
        const newElements: CanvasElement[] = [];
        const newSelectedIds: string[] = [];
        
        currentPageElements.forEach(el => {
            if (selectedElementIds.includes(el.id)) {
                const newEl: CanvasElement = {
                    ...el,
                    id: nanoid(),
                    x: el.x + 20,
                    y: el.y + 20,
                };
                newElements.push(newEl);
                newSelectedIds.push(newEl.id);
            }
        });

        if (newElements.length > 0) {
            setCurrentPageElements(prev => [...prev, ...newElements]);
            setSelectedElementIds(newSelectedIds);
        }
    }, [currentPageElements, selectedElementIds, setCurrentPageElements]);

    const copySelectedElements = useCallback(() => {
        const copied = currentPageElements.filter(el => selectedElementIds.includes(el.id));
        setClipboard(copied);
    }, [currentPageElements, selectedElementIds]);

    const pasteElements = useCallback(() => {
        if (clipboard.length === 0) return;
        const newElements = clipboard.map(el => ({
            ...el,
            id: nanoid(),
            x: el.x + 20,
            y: el.y + 20,
        }));
        setCurrentPageElements(prev => [...prev, ...newElements]);
        setSelectedElementIds(newElements.map(el => el.id));
    }, [clipboard, setCurrentPageElements]);
    
    const groupSelectedElements = useCallback(() => {
        if (selectedElementIds.length < 2) return;
        const groupId = `group-${nanoid()}`;
        const selected = currentPageElements.filter(el => selectedElementIds.includes(el.id));
        
        const bounds = selected.reduce((acc, el) => ({
            minX: Math.min(acc.minX, el.x),
            minY: Math.min(acc.minY, el.y),
            maxX: Math.max(acc.maxX, el.x + el.width),
            maxY: Math.max(acc.maxY, el.y + el.height),
        }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

        const groupElement: CanvasElement = {
            id: groupId, type: 'rect',
            x: bounds.minX, y: bounds.minY,
            width: bounds.maxX - bounds.minX, height: bounds.maxY - bounds.minY,
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            borderColor: 'rgba(0, 255, 255, 0.5)',
            borderWidth: 1, borderStyle: 'dashed',
            isLocked: false, isVisible: true,
        };

        setCurrentPageElements(prev => {
            const newElements = prev.map(el => 
                selectedElementIds.includes(el.id) ? { ...el, parentId: groupId } : el
            );
            return [...newElements, groupElement];
        });

        setSelectedElementIds([groupId]);
    }, [currentPageElements, selectedElementIds, setCurrentPageElements]);
    
    const ungroupSelectedElements = useCallback(() => {
        const groupIds = selectedElementIds.filter(id => id.startsWith('group-'));
        if (groupIds.length === 0) return;
        
        const childrenIdsToSelect: string[] = [];
        
        setCurrentPageElements(prev => {
            // Remove parentId from children and collect their IDs
            const updatedChildren = prev.map(el => {
                if (el.parentId && groupIds.includes(el.parentId)) {
                    childrenIdsToSelect.push(el.id);
                    const { parentId, ...rest } = el;
                    return rest as CanvasElement;
                }
                return el;
            });
            // Remove the group elements themselves
            return updatedChildren.filter(el => !groupIds.includes(el.id));
        });
        
        setSelectedElementIds(childrenIdsToSelect);

    }, [selectedElementIds, setCurrentPageElements]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.getAttribute('contenteditable') === 'true';
            
            if (isTyping) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                deleteSelectedElements();
            }
            if ((e.metaKey || e.ctrlKey)) {
                switch (e.key) {
                    case 'd': e.preventDefault(); duplicateSelectedElements(); break;
                    case 'c': e.preventDefault(); copySelectedElements(); break;
                    case 'v': e.preventDefault(); pasteElements(); break;
                    case 'g': e.preventDefault(); groupSelectedElements(); break;
                    case 'G': e.preventDefault(); if (e.shiftKey) ungroupSelectedElements(); break;
                }
            }
            
            const nudgeAmount = e.shiftKey ? 10 : 1;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                setCurrentPageElements(prev => prev.map(el => {
                    if (selectedElementIds.includes(el.id)) {
                        const newEl = { ...el };
                        if (e.key === 'ArrowUp') newEl.y -= nudgeAmount;
                        if (e.key === 'ArrowDown') newEl.y += nudgeAmount;
                        if (e.key === 'ArrowLeft') newEl.x -= nudgeAmount;
                        if (e.key === 'ArrowRight') newEl.x += nudgeAmount;
                        return newEl;
                    }
                    return el;
                }));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementIds, deleteSelectedElements, duplicateSelectedElements, copySelectedElements, pasteElements, groupSelectedElements, ungroupSelectedElements, setCurrentPageElements]);
    
    const toggleElementProperty = useCallback((id: string, prop: 'isLocked' | 'isVisible') => {
        setCurrentPageElements(prev => prev.map(el => {
            if (el.id === id) {
                const newEl = {...el};
                if (prop === 'isVisible') newEl.isVisible = !(newEl.isVisible ?? true);
                else if (prop === 'isLocked') newEl.isLocked = !(newEl.isLocked ?? false);
                return newEl;
            }
            return el;
        }));
    }, [setCurrentPageElements]);

    const reorderElement = useCallback((draggedId: string, targetId: string) => {
        setCurrentPageElements(prev => {
            const draggedIndex = prev.findIndex(el => el.id === draggedId);
            let targetIndex = prev.findIndex(el => el.id === targetId);
            if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return prev;
            
            const newElements = [...prev];
            const [draggedItem] = newElements.splice(draggedIndex, 1);
            targetIndex = newElements.findIndex(el => el.id === targetId);
            newElements.splice(targetIndex, 0, draggedItem);
            return newElements;
        });
    }, [setCurrentPageElements]);

    const selectedElement = currentPageElements.find(el => el.id === selectedElementIds[0]) || null;
    
    // Page Management
    const addPage = () => {
        const newPageId = nanoid();
        setDesign(d => ({ ...d, pages: [...d.pages, { id: newPageId, elements: [] }], currentPageId: newPageId }));
    };
    const duplicatePage = (id: string) => {
        const pageToDup = design.pages.find(p => p.id === id);
        if (!pageToDup) return;
        const newPageId = nanoid();
        const newPage: Page = {
            id: newPageId,
            elements: pageToDup.elements.map(el => ({...el, id: nanoid() })) // Important: new IDs for elements
        };
        const pageIndex = design.pages.findIndex(p => p.id === id);
        setDesign(d => {
            const newPages = [...d.pages];
            newPages.splice(pageIndex + 1, 0, newPage);
            return { ...d, pages: newPages, currentPageId: newPageId };
        });
    };
    const deletePage = (id: string) => {
        if (design.pages.length <= 1) return;
        const pageIndex = design.pages.findIndex(p => p.id === id);
        setDesign(d => {
            const newPages = d.pages.filter(p => p.id !== id);
            const newIndex = Math.max(0, pageIndex - 1);
            return { ...d, pages: newPages, currentPageId: newPages[newIndex].id };
        });
    };
    const setCurrentPageId = (id: string) => {
        setDesign(d => ({ ...d, currentPageId: id }));
        setSelectedElementIds([]);
    };


    const alignElements = (direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
        setCurrentPageElements(prev => {
            const selected = prev.filter(el => selectedElementIds.includes(el.id) && !el.id.startsWith('group-'));
            if (selected.length < 2) return prev;
            const bounds = selected.reduce((acc, el) => ({
                minX: Math.min(acc.minX, el.x), maxX: Math.max(acc.maxX, el.x + el.width),
                minY: Math.min(acc.minY, el.y), maxY: Math.max(acc.maxY, el.y + el.height),
            }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
            return prev.map(el => {
                if (!selectedElementIds.includes(el.id)) return el;
                let newEl = { ...el };
                switch (direction) {
                    case 'left': newEl.x = bounds.minX; break;
                    case 'center-h': newEl.x = bounds.minX + (bounds.maxX - bounds.minX) / 2 - newEl.width / 2; break;
                    case 'right': newEl.x = bounds.maxX - newEl.width; break;
                    case 'top': newEl.y = bounds.minY; break;
                    case 'center-v': newEl.y = bounds.minY + (bounds.maxY - bounds.minY) / 2 - newEl.height / 2; break;
                    case 'bottom': newEl.y = bounds.maxY - newEl.height; break;
                }
                return newEl;
            });
        });
    };
    
    const distributeElements = (direction: 'horizontal' | 'vertical') => {
        setCurrentPageElements(prev => {
            const selected = prev.filter(el => selectedElementIds.includes(el.id) && !el.id.startsWith('group-')).sort((a, b) => direction === 'horizontal' ? a.x - b.x : a.y - b.y);
            if (selected.length < 3) return prev;
            const newElements = [...prev];
            if (direction === 'horizontal') {
                const totalWidth = selected.reduce((sum, el) => sum + el.width, 0);
                const minX = selected[0].x;
                const maxX = selected[selected.length - 1].x + selected[selected.length - 1].width;
                const totalSpan = maxX - minX;
                const spacing = (totalSpan - totalWidth) / (selected.length - 1);
                let currentX = minX + selected[0].width + spacing;
                for (let i = 1; i < selected.length - 1; i++) {
                    const elIndex = newElements.findIndex(el => el.id === selected[i].id);
                    newElements[elIndex].x = currentX;
                    currentX += selected[i].width + spacing;
                }
            } else { // vertical
                const totalHeight = selected.reduce((sum, el) => sum + el.height, 0);
                const minY = selected[0].y;
                const maxY = selected[selected.length - 1].y + selected[selected.length - 1].height;
                const totalSpan = maxY - minY;
                const spacing = (totalSpan - totalHeight) / (selected.length - 1);
                let currentY = minY + selected[0].height + spacing;
                for (let i = 1; i < selected.length - 1; i++) {
                    const elIndex = newElements.findIndex(el => el.id === selected[i].id);
                    newElements[elIndex].y = currentY;
                    currentY += selected[i].height + spacing;
                }
            }
            return newElements;
        });
    };

    const bringForward = (id: string) => {
        setCurrentPageElements(prev => {
            const index = prev.findIndex(e => e.id === id);
            if (index === -1 || index === prev.length - 1) return prev;
            const newElements = [...prev];
            [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
            return newElements;
        });
    };

    const sendBackward = (id: string) => {
         setCurrentPageElements(prev => {
            const index = prev.findIndex(e => e.id === id);
            if (index < 1) return prev;
            const newElements = [...prev];
            [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
            return newElements;
        });
    };

    const bringToFront = (id: string) => {
        setCurrentPageElements(prev => { const el = prev.find(e => e.id === id); return el ? [...prev.filter(e => e.id !== id), el] : prev; });
    };

    const sendToBack = (id: string) => {
        setCurrentPageElements(prev => { const el = prev.find(e => e.id === id); return el ? [el, ...prev.filter(e => e.id !== id)] : prev; });
    };

    return (
        <div className="h-full flex flex-col bg-gray-800 text-white rounded-lg overflow-hidden border border-cyber-border shadow-lg">
            <EditorHeader undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} artboardRef={artboardRef} />
            <div className="flex flex-1 overflow-hidden">
                <EditorLeftSidebar 
                    addElement={addElement} 
                    elements={currentPageElements}
                    selectedElementIds={selectedElementIds}
                    setSelectedElementIds={setSelectedElementIds}
                    deleteElement={deleteElement}
                    reorderElement={reorderElement}
                    toggleElementProperty={toggleElementProperty}
                    isAiEnabled={isAiEnabled}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onGenerate={() => triggerGeneration(prompt)}
                    isAiLoading={isAiLoading}
                />
                <div ref={canvasWrapperRef} className="flex-1 flex flex-col bg-[#2d2f34] relative min-w-0">
                    <EditorCanvas
                        artboardRef={artboardRef}
                        elements={currentPageElements}
                        setElements={setCurrentPageElements}
                        selectedElementIds={selectedElementIds}
                        setSelectedElementIds={setSelectedElementIds}
                        zoom={zoom}
                        isLoading={isAiLoading}
                        error={aiError}
                    />
                    <EditorFooter 
                        zoom={zoom} setZoom={setZoom} fitCanvasToScreen={fitCanvasToScreen} 
                        pages={design.pages} currentPageId={design.currentPageId} setCurrentPageId={setCurrentPageId}
                        addPage={addPage} duplicatePage={duplicatePage} deletePage={deletePage}
                    />
                </div>
                <EditorRightSidebar selectedElement={selectedElement} selectedElementIds={selectedElementIds} updateElement={updateElement} />
            </div>
        </div>
    );
};

export default Designer;
