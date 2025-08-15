import React from 'react';
import type { CanvasElement } from '../sections/Designer';
import { VerticalAlignTopIcon, VerticalAlignMiddleIcon, VerticalAlignBottomIcon } from './icons';

const NumberInput: React.FC<{ label: string, value: number, onChange: (val: number) => void, unit?: string, min?: number, max?:number, step?: number }> = ({ label, value, onChange, unit, min, max, step=1 }) => (
    <div>
        <label className="text-xs text-gray-400">{label}</label>
        <div className="relative">
            <input 
                type="number"
                value={Math.round(value)}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                min={min}
                max={max}
                step={step}
                className="w-full bg-gray-700 border border-gray-600 rounded p-1 text-center mt-1 pr-6"
            />
            {unit && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{unit}</span>}
        </div>
    </div>
);

const ColorInput: React.FC<{ label: string, value: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <div className="flex items-center gap-2 p-1 bg-gray-700 border border-gray-600 rounded-md">
            <input 
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-6 h-6 border-none bg-transparent cursor-pointer"
            />
            <span className="font-mono text-xs">{value}</span>
        </div>
    </div>
);

const SelectInput: React.FC<{ label: string, value: string, onChange: (val: string) => void, children: React.ReactNode }> = ({ label, value, onChange, children }) => (
     <div className="flex items-center justify-between">
         <label className="text-sm text-gray-300">{label}</label>
         <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-gray-700 border border-gray-600 rounded p-1 text-xs">
            {children}
         </select>
    </div>
);


const Section: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="border-b border-black/30 pb-4">
        <h4 className="font-semibold text-white mb-3">{title}</h4>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);


const EditorRightSidebar: React.FC<{ selectedElement: CanvasElement | null, selectedElementIds: string[], updateElement: (id: string, props: Partial<CanvasElement>) => void }> = ({ selectedElement, selectedElementIds, updateElement }) => {
    
    if (selectedElementIds.length > 1) {
         return (
            <aside className="w-72 bg-[#1e1f22] flex-shrink-0 p-4 border-l border-black/30 flex items-center justify-center">
                 <p className="text-gray-400 text-center text-sm">
                    <span className="font-bold text-white text-base block mb-1">{selectedElementIds.length} objects selected</span>
                    Edit common properties or ungroup to edit individually.
                </p>
            </aside>
        );
    }

    if (!selectedElement) {
        return (
            <aside className="w-72 bg-[#1e1f22] flex-shrink-0 p-4 border-l border-black/30 flex items-center justify-center">
                 <p className="text-gray-500 text-center text-sm">Select an element to see its properties.</p>
            </aside>
        );
    }
    
  return (
    <aside className="w-72 bg-[#1e1f22] flex-shrink-0 border-l border-black/30">
      <h3 className="text-lg font-bold text-white p-4 capitalize border-b border-black/30">{selectedElement.type} Properties</h3>
      <div className="p-4 space-y-4 text-sm overflow-y-auto h-[calc(100%-60px)]">
        
        <Section title="Transform">
            <div className="grid grid-cols-2 gap-2">
                <NumberInput label="X" value={selectedElement.x} onChange={val => updateElement(selectedElement.id, { x: val })} unit="px" min={-1000} max={2000} />
                <NumberInput label="Y" value={selectedElement.y} onChange={val => updateElement(selectedElement.id, { y: val })} unit="px" min={-1000} max={2000} />
            </div>
             <div className="grid grid-cols-2 gap-2">
                <NumberInput label="Width" value={selectedElement.width} onChange={val => updateElement(selectedElement.id, { width: val })} unit="px" />
                <NumberInput label="Height" value={selectedElement.height} onChange={val => updateElement(selectedElement.id, { height: val })} unit="px" />
            </div>
            <NumberInput label="Rotation" value={selectedElement.rotate || 0} onChange={val => updateElement(selectedElement.id, { rotate: val })} unit="deg" max={360} />
        </Section>
        
        {(selectedElement.type !== 'text' && selectedElement.type !== 'svg') && (
            <Section title="Appearance">
                <ColorInput label="Fill" value={selectedElement.backgroundColor || '#ffffff'} onChange={(color) => updateElement(selectedElement.id, { backgroundColor: color })} />
                {selectedElement.type === 'rect' && <NumberInput label="Corner Radius" value={selectedElement.borderRadius || 0} onChange={val => updateElement(selectedElement.id, { borderRadius: val })} unit="px" />}
            </Section>
        )}
         {selectedElement.type === 'svg' && (
            <Section title="Appearance">
                <ColorInput label="Fill" value={selectedElement.fillColor || '#ffffff'} onChange={(color) => updateElement(selectedElement.id, { fillColor: color })} />
            </Section>
        )}
        
        {(selectedElement.type === 'text' || selectedElement.content) && (
            <Section title="Text">
                <ColorInput label="Color" value={selectedElement.color || '#000000'} onChange={(color) => updateElement(selectedElement.id, { color: color })} />
                <div className="grid grid-cols-3 gap-2">
                     <NumberInput label="Size" value={selectedElement.fontSize || 16} onChange={val => updateElement(selectedElement.id, { fontSize: val })} unit="px" />
                     <NumberInput label="Line Ht" value={Math.round((selectedElement.lineHeight || 1.5) * 100)} onChange={val => updateElement(selectedElement.id, { lineHeight: val / 100 })} unit="%" min={50} max={300} step={10}/>
                     <NumberInput label="Spacing" value={selectedElement.letterSpacing || 0} onChange={val => updateElement(selectedElement.id, { letterSpacing: val })} unit="px" min={-10} max={50}/>
                </div>
                <h5 className="font-semibold text-gray-300 pt-2 border-t border-black/20">Vertical Align</h5>
                <div className="grid grid-cols-3 gap-2">
                    <button title="Align Top" onClick={() => updateElement(selectedElement.id, { verticalAlign: 'top' })} className={`p-2 rounded ${selectedElement.verticalAlign === 'top' ? 'bg-gray-600' : 'bg-gray-700'} hover:bg-gray-600`}><VerticalAlignTopIcon className="w-5 h-5 mx-auto" /></button>
                    <button title="Align Middle" onClick={() => updateElement(selectedElement.id, { verticalAlign: 'middle' })} className={`p-2 rounded ${selectedElement.verticalAlign === 'middle' || !selectedElement.verticalAlign ? 'bg-gray-600' : 'bg-gray-700'} hover:bg-gray-600`}><VerticalAlignMiddleIcon className="w-5 h-5 mx-auto" /></button>
                    <button title="Align Bottom" onClick={() => updateElement(selectedElement.id, { verticalAlign: 'bottom' })} className={`p-2 rounded ${selectedElement.verticalAlign === 'bottom' ? 'bg-gray-600' : 'bg-gray-700'} hover:bg-gray-600`}><VerticalAlignBottomIcon className="w-5 h-5 mx-auto" /></button>
                </div>
            </Section>
        )}

        {selectedElement.type !== 'text' && (
            <Section title="Border">
                <ColorInput label="Color" value={selectedElement.borderColor || '#000000'} onChange={(color) => updateElement(selectedElement.id, { borderColor: color })}/>
                <div className="grid grid-cols-2 gap-2">
                    <NumberInput label="Width" value={selectedElement.borderWidth || 0} onChange={val => updateElement(selectedElement.id, { borderWidth: val })} unit="px" />
                    <SelectInput label="Style" value={selectedElement.borderStyle || 'solid'} onChange={val => updateElement(selectedElement.id, { borderStyle: val as any })}>
                        <option>solid</option><option>dashed</option><option>dotted</option>
                    </SelectInput>
                </div>
            </Section>
        )}

        {(selectedElement.type === 'text' || selectedElement.content) && (
            <Section title="Text Effects">
                <h5 className="font-semibold text-gray-300">Shadow</h5>
                <ColorInput label="Color" value={selectedElement.textShadowColor || '#000000'} onChange={val => updateElement(selectedElement.id, { textShadowColor: val })} />
                <div className="grid grid-cols-3 gap-2">
                    <NumberInput label="X" value={selectedElement.textShadowX || 0} onChange={val => updateElement(selectedElement.id, { textShadowX: val })} unit="px" min={-50} max={50}/>
                    <NumberInput label="Y" value={selectedElement.textShadowY || 0} onChange={val => updateElement(selectedElement.id, { textShadowY: val })} unit="px" min={-50} max={50}/>
                    <NumberInput label="Blur" value={selectedElement.textShadowBlur || 0} onChange={val => updateElement(selectedElement.id, { textShadowBlur: val })} unit="px" min={0} max={100}/>
                </div>
                <h5 className="font-semibold text-gray-300 pt-2 border-t border-black/20">Outline</h5>
                <ColorInput label="Color" value={selectedElement.textStrokeColor || '#000000'} onChange={val => updateElement(selectedElement.id, { textStrokeColor: val })} />
                <NumberInput label="Width" value={selectedElement.textStrokeWidth || 0} onChange={val => updateElement(selectedElement.id, { textStrokeWidth: val })} unit="px" min={0} max={20}/>
            </Section>
        )}

        <Section title="Effects">
            <NumberInput label="Opacity" value={Math.round((selectedElement.opacity ?? 1) * 100)} onChange={val => updateElement(selectedElement.id, { opacity: val / 100 })} unit="%" max={100} />
            <h5 className="font-semibold text-gray-300 pt-2 border-t border-black/20">Shadow</h5>
            <ColorInput label="Color" value={selectedElement.shadowColor || '#000000'} onChange={val => updateElement(selectedElement.id, { shadowColor: val })} />
            <div className="grid grid-cols-3 gap-2">
                <NumberInput label="X" value={selectedElement.shadowX || 0} onChange={val => updateElement(selectedElement.id, { shadowX: val })} unit="px" min={-50} max={50}/>
                <NumberInput label="Y" value={selectedElement.shadowY || 0} onChange={val => updateElement(selectedElement.id, { shadowY: val })} unit="px" min={-50} max={50}/>
                <NumberInput label="Blur" value={selectedElement.shadowBlur || 0} onChange={val => updateElement(selectedElement.id, { shadowBlur: val })} unit="px" min={0} max={100}/>
            </div>
        </Section>
      </div>
    </aside>
  );
};

export default EditorRightSidebar;
