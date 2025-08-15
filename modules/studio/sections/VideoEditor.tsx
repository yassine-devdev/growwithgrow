import React, { useState, useRef, useCallback } from 'react';
import Header from '../video-editor/Header';
import LeftPanel from '../video-editor/LeftPanel';
import Player from '../video-editor/Player';
import Timeline from '../video-editor/Timeline';
import RightPanel from '../video-editor/RightPanel';
import { nanoid } from 'nanoid';

export interface MediaAsset {
    id: string;
    type: 'video' | 'audio';
    name: string;
    url: string;
    duration: number;
    element?: HTMLVideoElement | HTMLAudioElement;
}

export interface Keyframe<T> {
    id: string;
    time: number; // Time in seconds, relative to the start of the clip
    value: T;
    easing?: string; // Future use: 'linear', 'ease-in', etc.
}

export interface ClipProperties {
    opacity: Keyframe<number>[];
    size: Keyframe<number>[]; // as a percentage of canvas width
    position: Keyframe<{ x: number; y: number }>[]; // as percentage of canvas size
    rotate: Keyframe<number>[];
    filters: {
        brightness: Keyframe<number>[]; // 0-200, default 100
        contrast: Keyframe<number>[];   // 0-200, default 100
        saturate: Keyframe<number>[];   // 0-200, default 100
        grayscale: Keyframe<number>[];  // 0-100, default 0
        sepia: Keyframe<number>[];      // 0-100, default 0
        blur: Keyframe<number>[];       // 0-20, default 0 (in px)
    };
}

// Advanced text styling
export interface TextStyle {
    fill: string;
    stroke: {
        color: string;
        width: number;
        enabled: boolean;
    };
    shadow: { // glow is a shadow
        color: string;
        blur: number;
        offsetX: number;
        offsetY: number;
        enabled: boolean;
    };
    background: {
        color: string;
        padding: number;
        borderRadius: number;
        enabled: boolean;
    }
}
export type TextAnimationType = 'none' | 'fadeIn' | 'riseUp' | 'typewriter';
export type TextAnimationLoopType = 'none' | 'pulse' | 'flicker' | 'wave';
export type MotionPathType = 'none' | 'driftLeft' | 'floatUp';


export interface Clip {
    id: string;
    type: 'video' | 'audio' | 'text';
    assetId?: string; // Only for video/audio clips
    name: string;
    // Times relative to the original media asset
    start: number; 
    end: number;
    // Time on the main timeline
    timelineStart: number;
    trackId: string;
    properties: ClipProperties;
    // Text-specific properties
    content?: string;
    fontFamily?: string;
    fontSize?: number;
    textStyle?: TextStyle;
    animationIn?: TextAnimationType;
    animationOut?: TextAnimationType;
    animationLoop?: TextAnimationLoopType;
    motionPath?: MotionPathType;

    // Transition effect at the beginning of the clip
    transitionIn?: {
        type: 'cross-fade' | 'wipe-left';
        duration: number; // in seconds
    };
}

export interface Track {
    id: string;
    type: 'video' | 'audio';
    clips: Clip[];
}

type AnimatableProperty = 'opacity' | 'size' | 'position' | 'rotate';

export const VideoEditor: React.FC = () => {
    const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
    const [tracks, setTracks] = useState<Track[]>([
        { id: 'track_video_1', type: 'video', clips: [] },
        { id: 'track_audio_1', type: 'audio', clips: [] },
    ]);
    const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState('media');

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const totalDuration = 60; // 60 seconds for now

    const playerDivRef = useRef<HTMLDivElement>(null);


    const handleFileUpload = (file: File) => {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('video') ? 'video' : 'audio';
        const element = document.createElement(type) as HTMLVideoElement | HTMLAudioElement;
        element.src = url;
        element.onloadedmetadata = () => {
            const newAsset: MediaAsset = {
                id: nanoid(),
                type,
                name: file.name,
                url,
                duration: element.duration,
                element,
            };
            setMediaAssets(prev => [...prev, newAsset]);
        };
    };

    const handleDropOnTimeline = (assetId: string, trackId: string, timelineStart: number) => {
        const asset = mediaAssets.find(a => a.id === assetId);
        if (!asset) return;

        const targetTrack = tracks.find(t => t.id === trackId);
        if (!targetTrack || targetTrack.type !== asset.type) return;

        const newClip: Clip = {
            id: nanoid(),
            type: asset.type,
            assetId,
            name: asset.name,
            start: 0,
            end: asset.duration,
            timelineStart,
            trackId,
            properties: { 
                opacity: [{ id: nanoid(), time: 0, value: 100 }], 
                size: [{ id: nanoid(), time: 0, value: 100 }], 
                position: [{ id: nanoid(), time: 0, value: { x: 50, y: 50 } }], 
                rotate: [{ id: nanoid(), time: 0, value: 0 }],
                filters: {
                    brightness: [{ id: nanoid(), time: 0, value: 100 }],
                    contrast: [{ id: nanoid(), time: 0, value: 100 }],
                    saturate: [{ id: nanoid(), time: 0, value: 100 }],
                    grayscale: [{ id: nanoid(), time: 0, value: 0 }],
                    sepia: [{ id: nanoid(), time: 0, value: 0 }],
                    blur: [{ id: nanoid(), time: 0, value: 0 }],
                }
            }
        };

        setTracks(prev => prev.map(track => 
            track.id === trackId ? { ...track, clips: [...track.clips, newClip] } : track
        ));
    };
    
    const handleAddTextClip = (trackId: string, timelineStart: number) => {
        const targetTrack = tracks.find(t => t.id === trackId);
        if (!targetTrack || targetTrack.type !== 'video') {
            alert("Text can only be added to video tracks.");
            return;
        }

        const newClip: Clip = {
            id: nanoid(),
            type: 'text',
            name: 'Text',
            start: 0,
            end: 5, // Default 5 seconds duration
            timelineStart,
            trackId,
            content: 'Your Text Here',
            fontFamily: 'Inter',
            fontSize: 50,
            textStyle: {
                fill: '#FFFFFF',
                stroke: { color: '#000000', width: 0, enabled: false },
                shadow: { color: 'rgba(0,0,0,0.75)', blur: 5, offsetX: 2, offsetY: 2, enabled: false },
                background: { color: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 5, enabled: false }
            },
            animationIn: 'none',
            animationOut: 'none',
            animationLoop: 'none',
            motionPath: 'none',
            properties: { 
                opacity: [{ id: nanoid(), time: 0, value: 100 }], 
                size: [{ id: nanoid(), time: 0, value: 100 }], 
                position: [{ id: nanoid(), time: 0, value: { x: 50, y: 50 } }], 
                rotate: [{ id: nanoid(), time: 0, value: 0 }],
                filters: {
                    brightness: [{ id: nanoid(), time: 0, value: 100 }],
                    contrast: [{ id: nanoid(), time: 0, value: 100 }],
                    saturate: [{ id: nanoid(), time: 0, value: 100 }],
                    grayscale: [{ id: nanoid(), time: 0, value: 0 }],
                    sepia: [{ id: nanoid(), time: 0, value: 0 }],
                    blur: [{ id: nanoid(), time: 0, value: 0 }],
                }
            }
        };
        
        setTracks(prev => prev.map(track => 
            track.id === trackId ? { ...track, clips: [...track.clips, newClip] } : track
        ));
    };

    const handleApplyEffect = (clipId: string, effect: { property: AnimatableProperty, keyframes: Omit<Keyframe<any>, 'id'>[] }) => {
        setTracks(prev => prev.map(track => ({
            ...track,
            clips: track.clips.map(clip => {
                if (clip.id === clipId) {
                    const newKeyframes = effect.keyframes.map(kf => ({...kf, id: nanoid() }));
                    // This logic is simplified; a real version would intelligently merge or replace keyframes
                    const updatedProperties = {
                        ...clip.properties,
                        [effect.property]: newKeyframes
                    };
                    return { ...clip, properties: updatedProperties };
                }
                return clip;
            })
        })));
    };


    const handleUpdateClip = (clipId: string, newProps: Partial<Clip>) => {
         setTracks(prev => prev.map(track => ({
            ...track,
            clips: track.clips.map(clip => clip.id === clipId ? { ...clip, ...newProps } : clip)
        })));
    };
    
    const selectedClip = tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId) || null;
    
    const handleAddTrack = (type: 'video' | 'audio') => {
        const newTrack: Track = { id: `track_${type}_${nanoid()}`, type, clips: [] };
        setTracks(prev => [...prev, newTrack]);
    };

    const handleRemoveTrack = (trackId: string) => {
        setTracks(prev => prev.filter(t => t.id !== trackId));
    };

    const handleExport = async () => {
        if (!playerDivRef.current) return;
        alert("Starting export... The video will download automatically when finished. Please don't close the tab.");

        const canvas = playerDivRef.current.querySelector('canvas');
        if (!canvas) {
            alert("Export failed: Canvas not found.");
            return;
        }

        const stream = canvas.captureStream(30); // 30 fps
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks: Blob[] = [];
        
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'video-export.webm';
            a.click();
            URL.revokeObjectURL(url);
             alert("Export complete!");
        };

        recorder.start();
        
        setCurrentTime(0);
        setIsPlaying(true);
        
        // This is a simplified export; a real export would render each frame sequentially.
        // This relies on the real-time playback being accurate enough.
        setTimeout(() => {
            recorder.stop();
            setIsPlaying(false);
            setCurrentTime(0);
        }, totalDuration * 1000);
    };


    return (
        <div className="h-full flex flex-col bg-[#161718] text-gray-300 text-sm overflow-hidden">
            <Header onExport={handleExport} />
            <div className="flex flex-1 overflow-hidden relative">
                <div className="flex-shrink-0 md:w-72 lg:w-[340px]">
                    <LeftPanel 
                        activeTool={activeTool} 
                        setActiveTool={setActiveTool} 
                        mediaAssets={mediaAssets} 
                        onFileUpload={handleFileUpload}
                        onAddTextClip={(trackId, time) => handleAddTextClip(trackId, time)}
                        onApplyEffect={handleApplyEffect}
                        tracks={tracks}
                    />
                </div>

                <div className="flex flex-1 flex-col bg-[#0d0e0f] min-w-0">
                    <Player 
                        playerDivRef={playerDivRef}
                        mediaAssets={mediaAssets}
                        tracks={tracks}
                        currentTime={currentTime}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        setCurrentTime={setCurrentTime}
                        totalDuration={totalDuration}
                    />
                    <Timeline
                        tracks={tracks}
                        selectedClipId={selectedClipId}
                        onClipSelect={setSelectedClipId}
                        onDropOnTimeline={handleDropOnTimeline}
                        onUpdateClip={handleUpdateClip}
                        currentTime={currentTime}
                        setCurrentTime={setCurrentTime}
                        totalDuration={totalDuration}
                        onAddTrack={handleAddTrack}
                        onRemoveTrack={handleRemoveTrack}
                    />
                </div>

                <div className="flex-shrink-0 md:w-72 lg:w-[340px]">
                    <RightPanel 
                        selectedClip={selectedClip} 
                        onClipChange={handleUpdateClip}
                        currentTime={currentTime}
                    />
                </div>
            </div>
        </div>
    );
};

export default VideoEditor;
