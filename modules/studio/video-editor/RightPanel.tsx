import React, { useState } from 'react';
import { Clip, ClipProperties, Keyframe, TextStyle, TextAnimationType, TextAnimationLoopType, MotionPathType } from '../sections/VideoEditor';
import * as Icons from './icons';
import { nanoid } from 'nanoid';

type AnimatableProperty = 'opacity' | 'size' | 'position' | 'rotate';
type FilterProperty = keyof ClipProperties['filters'];

const fonts = ['Inter', 'Poppins', 'Oswald', 'Montserrat', 'Lobster', 'JetBrains Mono', 'Roboto', 'Lora'];
const animIn: TextAnimationType[] = ['none', 'fadeIn', 'riseUp', 'typewriter'];
const animLoop: TextAnimationLoopType[] = ['none', 'pulse', 'flicker', 'wave'];
const motionPaths: MotionPathType[] = ['none', 'driftLeft', 'floatUp'];

const textPresets: { name: string; style: Partial<TextStyle> & { fontFamily?: string, fontSize?: number } }[] = [
    { name: 'Neon', style: { fill: '#F0F', fontFamily: 'Oswald', stroke: { color: '#F0F', width: 2, enabled: true }, shadow: { color: '#F0F', blur: 15, offsetX: 0, offsetY: 0, enabled: true } }},
    { name: 'Outline', style: { fill: 'transparent', fontFamily: 'Montserrat', fontSize: 60, stroke: { color: '#FFF', width: 2, enabled: true } }},
    { name: 'Classic', style: { fontFamily: 'Lora', fill: '#FFFFFF' } },
    { name: 'Shadow', style: { fill: '#FFF', shadow: { color: 'rgba(0,0,0,0.7)', blur: 5, offsetX: 3, offsetY: 3, enabled: true } }},
    { name: 'Block', style: { fontFamily: 'Poppins', fill: '#000', background: { color: '#FFF', padding: 10, borderRadius: 5, enabled: true } }},
    { name: 'Elegant', style: { fontFamily: 'Lobster', fontSize: 70, fill: '#fde047'}},
];


interface RightPanelProps {
    selectedClip: Clip | null;
    onClipChange: (clipId: string, newProps: Partial<Clip>) => void;
    currentTime: number;
}

const RightPanel: React.FC<RightPanelProps> = ({ selectedClip, onClipChange }) => {
    const [activeTab, setActiveTab] = useState('basic');

    if (!selectedClip) {
        return (
             <aside className="w-full bg-[#202122] flex-shrink-0 p-4 border-l border-black/30 flex items-center justify-center text-center">
                <p className="text-gray-500">Select a clip on the timeline to see its properties.</p>
            </aside>
        );
    }
    
    // Handlers for text properties
    const handleTextChange = (prop: keyof Clip, value: any) => onClipChange(selectedClip.id, { [prop]: value });
    const handleTextStyleChange = (prop: keyof TextStyle, value: any) => {
        const currentStyle = selectedClip.textStyle || {};
        const newStyle = {
            ...currentStyle,
            [prop]: prop === 'fill' ? value : { ...(currentStyle[prop] as object), ...value }
        };
        onClipChange(selectedClip.id, { textStyle: newStyle as TextStyle });
    };
    const handlePreset = (preset: typeof textPresets[0]) => {
        const {fontFamily, fontSize, ...styleProps} = preset.style;
        const newClipProps: Partial<Clip> = {
            textStyle: {...selectedClip.textStyle, ...styleProps} as TextStyle
        };
        if (fontFamily) newClipProps.fontFamily = fontFamily;
        if (fontSize) newClipProps.fontSize = fontSize;
        onClipChange(selectedClip.id, newClipProps);
    }

    const renderVideoPanel = () => (
        <div className="space-y-6">
            <p className="text-gray-400">Video clip properties are animated in the keyframe editor (coming soon).</p>
        </div>
    );
    
    const renderTextPanel = () => (
        <>
            <div className="flex items-center border-b border-gray-700 mb-4">
                {[
                    {id: 'preset', icon: Icons.PresetIcon}, 
                    {id: 'basic', icon: Icons.TextIcon}, 
                    {id: 'style', icon: Icons.StyleIcon}, 
                    {id: 'animation', icon: Icons.AnimationIcon}, 
                    {id: 'tracking', icon: Icons.TrackingIcon}
                ].map(tab => (
                     <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-semibold capitalize flex items-center gap-2 ${activeTab === tab.id ? 'text-white border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                        <tab.icon className="w-4 h-4" />
                        {tab.id}
                    </button>
                ))}
            </div>
            {activeTab === 'preset' && (
                 <div className="grid grid-cols-2 gap-2">
                    {textPresets.map(p => (
                        <button key={p.name} onClick={() => handlePreset(p)} className="p-4 bg-gray-800 border border-gray-700 rounded-md text-white text-lg font-bold hover:border-cyan-400">
                            {p.name}
                        </button>
                    ))}
                 </div>
            )}
             {activeTab === 'basic' && (
                <div className="space-y-4">
                    <textarea value={selectedClip.content} onChange={e => handleTextChange('content', e.target.value)} rows={4} className="w-full bg-gray-800 p-2 rounded-md" />
                    <select value={selectedClip.fontFamily} onChange={e => handleTextChange('fontFamily', e.target.value)} className="w-full bg-gray-800 p-2 rounded-md">
                        {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <input type="number" value={selectedClip.fontSize} onChange={e => handleTextChange('fontSize', parseInt(e.target.value))} className="w-full bg-gray-800 p-2 rounded-md" />
                </div>
            )}
             {activeTab === 'style' && (
                <div className="space-y-4">
                     <div><h4 className="font-semibold text-gray-400 mb-2">Fill</h4><input type="color" value={selectedClip.textStyle?.fill || '#ffffff'} onChange={e => handleTextStyleChange('fill', e.target.value)} className="w-full h-8 p-0 border-none rounded cursor-pointer" /></div>
                     <div className="space-y-2"><h4 className="font-semibold text-gray-400">Stroke</h4> <label className="flex items-center gap-2"><input type="checkbox" checked={selectedClip.textStyle?.stroke.enabled} onChange={e => handleTextStyleChange('stroke', {enabled: e.target.checked})} /> Enable</label> <div className="flex gap-2"><input type="color" value={selectedClip.textStyle?.stroke.color} onChange={e => handleTextStyleChange('stroke', {color: e.target.value})} /> <input type="number" value={selectedClip.textStyle?.stroke.width} onChange={e => handleTextStyleChange('stroke', {width: parseInt(e.target.value)})} className="w-20 bg-gray-800 p-1 rounded" />px</div></div>
                     <div className="space-y-2"><h4 className="font-semibold text-gray-400">Glow</h4><label className="flex items-center gap-2"><input type="checkbox" checked={selectedClip.textStyle?.shadow.enabled} onChange={e => handleTextStyleChange('shadow', {enabled: e.target.checked})} /> Enable</label> <div className="flex gap-2"><input type="color" value={selectedClip.textStyle?.shadow.color} onChange={e => handleTextStyleChange('shadow', {color: e.target.value})} /> <input type="number" value={selectedClip.textStyle?.shadow.blur} onChange={e => handleTextStyleChange('shadow', {blur: parseInt(e.target.value)})} className="w-20 bg-gray-800 p-1 rounded" />px</div></div>
                     <div className="space-y-2"><h4 className="font-semibold text-gray-400">Background</h4><label className="flex items-center gap-2"><input type="checkbox" checked={selectedClip.textStyle?.background.enabled} onChange={e => handleTextStyleChange('background', {enabled: e.target.checked})} /> Enable</label> <div className="flex gap-2"><input type="color" value={selectedClip.textStyle?.background.color} onChange={e => handleTextStyleChange('background', {color: e.target.value})} /> <input type="number" value={selectedClip.textStyle?.background.padding} onChange={e => handleTextStyleChange('background', {padding: parseInt(e.target.value)})} className="w-20 bg-gray-800 p-1 rounded" />px</div></div>
                </div>
            )}
             {activeTab === 'animation' && (
                 <div className="space-y-3">
                     <div><label className="font-semibold text-gray-400 block mb-1">In Animation</label><select value={selectedClip.animationIn} onChange={e => handleTextChange('animationIn', e.target.value as TextAnimationType)} className="w-full bg-gray-800 p-2 rounded-md">{animIn.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                     <div><label className="font-semibold text-gray-400 block mb-1">Out Animation</label><select className="w-full bg-gray-800 p-2 rounded-md" disabled><option>none</option></select></div>
                     <div><label className="font-semibold text-gray-400 block mb-1">Loop Animation</label><select value={selectedClip.animationLoop} onChange={e => handleTextChange('animationLoop', e.target.value as TextAnimationLoopType)} className="w-full bg-gray-800 p-2 rounded-md">{animLoop.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                 </div>
            )}
             {activeTab === 'tracking' && (
                  <div className="space-y-3">
                     <div><label className="font-semibold text-gray-400 block mb-1">Motion Path</label><select value={selectedClip.motionPath} onChange={e => handleTextChange('motionPath', e.target.value as MotionPathType)} className="w-full bg-gray-800 p-2 rounded-md">{motionPaths.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                 </div>
            )}
        </>
    );

    return (
        <aside className="w-full bg-[#202122] flex-shrink-0 border-l border-black/30">
          <h3 className="text-lg font-bold text-white p-4 capitalize border-b border-gray-700">Inspector</h3>
          <div className="p-4 space-y-6 text-sm overflow-y-auto h-[calc(100%-60px)]">
            {selectedClip.type === 'text' ? renderTextPanel() : renderVideoPanel()}
          </div>
        </aside>
    );
};

export default RightPanel;
