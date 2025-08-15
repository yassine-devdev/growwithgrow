import React, { useRef, useState } from 'react';
import * as Icons from './icons';
import { Track, Clip } from '../sections/VideoEditor';

interface TimelineProps {
    tracks: Track[];
    selectedClipId: string | null;
    onClipSelect: (clipId: string | null) => void;
    onDropOnTimeline: (assetId: string, trackId: string, timelineStart: number) => void;
    onUpdateClip: (clipId: string, newProps: Partial<Clip>) => void;
    currentTime: number;
    setCurrentTime: (time: number) => void;
    totalDuration: number;
    onAddTrack: (type: 'video' | 'audio') => void;
    onRemoveTrack: (trackId: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ tracks, selectedClipId, onClipSelect, onDropOnTimeline, onUpdateClip, currentTime, setCurrentTime, totalDuration, onAddTrack, onRemoveTrack }) => {
    const [zoom, setZoom] = useState(50); // pixels per second
    const timelineContentRef = useRef<HTMLDivElement>(null);
    const timelineRulerRef = useRef<HTMLDivElement>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, trackId: string) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        if (!timelineContentRef.current) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
        const timelineStart = x / zoom;

        if (data.type === 'media' && data.assetId) {
            onDropOnTimeline(data.assetId, trackId, timelineStart);
        } else if (data.type === 'effect') {
            // This is handled at clip level now, dropping on a track doesn't make sense for effects.
            // A more advanced implementation might create an "effect track"
        }
    };
    
    const handleDropOnClip = (e: React.DragEvent<HTMLDivElement>, clip: Clip) => {
        e.stopPropagation();
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        if (data.type === 'effect') {
            const onApplyEffect = (e.currentTarget.parentElement?.dataset as any).onapplyeffect;
            if(onApplyEffect) {
                // This is a hacky way to pass function through data attributes
                // In a real app, use a proper state management library
                // For now, this requires the parent component to handle the drop event
                // This logic will be moved to LeftPanel to be more direct.
                console.log("Effect dropped on clip, but handler is not implemented here directly.");
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    
    const handleTimeUpdateFromClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setCurrentTime((x + e.currentTarget.scrollLeft) / zoom);
    };
    
    const handlePlayheadDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const ruler = timelineRulerRef.current;
        if (!ruler) return;
        
        const onMouseMove = (moveEvent: MouseEvent) => {
            const rect = ruler.getBoundingClientRect();
            const x = moveEvent.clientX - rect.left;
            setCurrentTime(Math.max(0, Math.min((x + ruler.scrollLeft) / zoom, totalDuration)));
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    return (
        <div className="h-64 bg-[#161718] flex-shrink-0 p-2 flex flex-col border-t-2 border-black/50">
            <div className="flex items-center justify-between flex-wrap gap-2 h-auto md:h-10 px-2">
                 <div className="flex items-center gap-2 sm:gap-4">
                    <button className="p-1 text-gray-400 hover:text-white" title="Add Video Track" onClick={() => onAddTrack('video')}><Icons.AddTrackIcon /></button>
                    <button className="p-1 text-gray-400 hover:text-white" title="Add Audio Track" onClick={() => onAddTrack('audio')}><Icons.AudioIcon /></button>
                 </div>
                 <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="p-1 text-gray-400 hover:text-white"><Icons.TimelineZoomOutIcon className="w-5 h-5"/></button>
                        <input type="range" min="10" max="200" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-16 sm:w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm" />
                        <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 text-gray-400 hover:text-white"><Icons.TimelineZoomInIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto relative flex">
                <div className="w-24 md:w-32 bg-[#161718] flex-shrink-0 z-20 space-y-1 pt-[29px]">
                    {tracks.map(track => (
                        <div key={track.id} className="h-14 bg-gray-800/50 rounded-lg flex items-center p-1 md:p-2 gap-1 md:gap-2">
                            <span className="font-semibold text-xs text-white truncate flex-1">{track.type === 'video' ? 'Video' : 'Audio'}</span>
                            <button onClick={() => onRemoveTrack(track.id)} className="p-1 text-gray-500 hover:text-red-400"><Icons.DeleteIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>

                <div ref={timelineContentRef} className="flex-1 relative">
                    <div ref={timelineRulerRef} className="h-6 flex items-end text-xs text-gray-500 sticky top-0 bg-[#161718] z-20" onClick={handleTimeUpdateFromClick} style={{ width: `${totalDuration * zoom}px` }}>
                        {Array.from({ length: totalDuration * 2 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 text-left border-l border-gray-700 pl-1" style={{ width: `${zoom / 2}px`}}>{i % 2 === 0 ? `00:${(i/2).toString().padStart(2, '0')}`: ''}</div>
                        ))}
                    </div>
                     
                    <div className="relative space-y-1 mt-1 pb-2" style={{ width: `${totalDuration * zoom}px` }}>
                       {tracks.map(track => (
                           <div key={track.id} className="h-14 rounded-lg flex items-center p-1 relative" onDrop={(e) => handleDrop(e, track.id)} onDragOver={handleDragOver}>
                                {track.clips.map(clip => {
                                    const clipColor = clip.type === 'video' ? 'bg-purple-500/50' : clip.type === 'audio' ? 'bg-green-500/50' : 'bg-blue-500/50';
                                    return (
                                        <div 
                                            key={clip.id} 
                                            onClick={() => onClipSelect(clip.id)}
                                            onDrop={e => handleDropOnClip(e, clip)}
                                            onDragOver={handleDragOver}
                                            className={`absolute flex h-12 ${clipColor} rounded-md cursor-pointer ${selectedClipId === clip.id ? 'border-2 border-cyan-400' : 'border-2 border-transparent'}`}
                                            style={{ left: `${clip.timelineStart * zoom}px`, width: `${(clip.end - clip.start) * zoom}px` }}
                                        >
                                            {clip.transitionIn && (
                                                <div 
                                                    className="absolute top-0 left-0 h-full bg-yellow-400/50"
                                                    style={{ width: `${Math.min((clip.end - clip.start) * zoom / 2, clip.transitionIn.duration * zoom)}px`, clipPath: 'polygon(100% 0, 0 0, 0 100%)' }}
                                                    title={`Transition: ${clip.transitionIn.type} (${clip.transitionIn.duration}s)`}
                                                ></div>
                                            )}
                                            <div className="p-1 text-white text-xs font-semibold bg-black/30 rounded-l-md flex items-center truncate">{clip.name}</div>
                                        </div>
                                    )
                                })}
                           </div>
                       ))}
                    </div>

                    {/* Playhead */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-white z-30 pointer-events-none" style={{ left: `${currentTime * zoom}px` }}>
                        <div onMouseDown={handlePlayheadDrag} className="absolute -top-1 -ml-2 w-4 h-4 bg-white rounded-full cursor-col-resize pointer-events-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
