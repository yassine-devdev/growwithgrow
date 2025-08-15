import React, { useEffect, useRef, useCallback } from 'react';
import * as Icons from './icons';
import { MediaAsset, Track, Keyframe, Clip, TextStyle, TextAnimationType, TextAnimationLoopType, MotionPathType } from '../sections/VideoEditor';

interface PlayerProps {
    playerDivRef: React.RefObject<HTMLDivElement>;
    mediaAssets: MediaAsset[];
    tracks: Track[];
    currentTime: number;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number | ((prevTime: number) => number)) => void;
    totalDuration: number;
}

// Utility to get interpolated value from keyframes
function getInterpolatedValue<T>(keyframes: Keyframe<T>[], time: number): T {
    if (!keyframes || keyframes.length === 0) {
        if (typeof (keyframes as any)[0]?.value === 'number') return 100 as any;
        if (typeof (keyframes as any)[0]?.value === 'object') return { x: 50, y: 50 } as any;
        return 0 as any;
    }
    if (keyframes.length === 1) return keyframes[0].value;

    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    
    if (time <= sorted[0].time) return sorted[0].value;
    if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

    let prevKeyframe = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
        const nextKeyframe = sorted[i];
        if (time >= prevKeyframe.time && time <= nextKeyframe.time) {
            const t = (time - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time);
            
            if (typeof prevKeyframe.value === 'number' && typeof nextKeyframe.value === 'number') {
                return (prevKeyframe.value * (1 - t) + nextKeyframe.value * t) as any;
            }
            const isPosObject = (val: any): val is {x: number, y: number} => typeof val === 'object' && val !== null && 'x' in val && 'y' in val;
            if (isPosObject(prevKeyframe.value) && isPosObject(nextKeyframe.value)) {
                 return {
                    x: prevKeyframe.value.x * (1 - t) + nextKeyframe.value.x * t,
                    y: prevKeyframe.value.y * (1 - t) + nextKeyframe.value.y * t
                } as any;
            }
            return prevKeyframe.value;
        }
        prevKeyframe = nextKeyframe;
    }
    return prevKeyframe.value;
}

const drawVideoFrame = (ctx: CanvasRenderingContext2D, clip: Clip, clipLocalTime: number, mediaAssets: MediaAsset[], forcedOpacity?: number) => {
    const asset = mediaAssets.find(a => a.id === clip.assetId);
    if (!asset || asset.type !== 'video' || !asset.element) return;

    const video = asset.element as HTMLVideoElement;
    const timeInVideo = clip.start + clipLocalTime;
    if (Math.abs(video.currentTime - timeInVideo) > 0.1) video.currentTime = timeInVideo;
    
    const opacity = getInterpolatedValue(clip.properties.opacity, clipLocalTime) / 100;
    const size = getInterpolatedValue(clip.properties.size, clipLocalTime);
    const position = getInterpolatedValue(clip.properties.position, clipLocalTime);
    const rotate = getInterpolatedValue(clip.properties.rotate, clipLocalTime);
    const { filters } = clip.properties;
    
    ctx.save();
    ctx.globalAlpha = forcedOpacity !== undefined ? forcedOpacity : opacity;
    ctx.filter = `
        brightness(${getInterpolatedValue(filters.brightness, clipLocalTime)}%) 
        contrast(${getInterpolatedValue(filters.contrast, clipLocalTime)}%) 
        saturate(${getInterpolatedValue(filters.saturate, clipLocalTime)}%) 
        grayscale(${getInterpolatedValue(filters.grayscale, clipLocalTime)}%) 
        sepia(${getInterpolatedValue(filters.sepia, clipLocalTime)}%) 
        blur(${getInterpolatedValue(filters.blur, clipLocalTime)}px)
    `;

    const scale = size / 100;
    const w = video.videoWidth * scale; const h = video.videoHeight * scale;
    const x = (position.x / 100) * ctx.canvas.width - w / 2;
    const y = (position.y / 100) * ctx.canvas.height - h / 2;
    
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rotate * Math.PI / 180);
    ctx.drawImage(video, -w / 2, -h / 2, w, h);
    ctx.restore();
};


const Player: React.FC<PlayerProps> = ({ playerDivRef, mediaAssets, tracks, currentTime, isPlaying, setIsPlaying, setCurrentTime, totalDuration }) => {
    const animationFrameId = useRef<number | undefined>();
    const lastTimeRef = useRef<number>(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const videoTracks = tracks.filter(t => t.type === 'video');
        videoTracks.forEach(track => {
            const activeClip = track.clips.find(c => c.type === 'video' && currentTime >= c.timelineStart && currentTime < c.timelineStart + (c.end - c.start));
            if (activeClip) {
                const clipLocalTime = currentTime - activeClip.timelineStart;
                if (activeClip.transitionIn && clipLocalTime < activeClip.transitionIn.duration) {
                    const t = clipLocalTime / activeClip.transitionIn.duration;
                    const prevClip = track.clips.filter(c => c.type === 'video' && (c.timelineStart + (c.end - c.start)) <= activeClip.timelineStart).sort((a,b) => b.timelineStart - a.timelineStart)[0];
                    if (prevClip) {
                        const prevClipLocalTime = (prevClip.end - prevClip.start);
                        drawVideoFrame(ctx, prevClip, prevClipLocalTime, mediaAssets, 1 - t);
                        drawVideoFrame(ctx, activeClip, clipLocalTime, mediaAssets, t);
                    } else {
                        drawVideoFrame(ctx, activeClip, clipLocalTime, mediaAssets, undefined);
                    }
                } else {
                     drawVideoFrame(ctx, activeClip, clipLocalTime, mediaAssets, undefined);
                }
            }
        });
    }, [tracks, currentTime, mediaAssets]);

    // Effect for drawing on canvas whenever dependencies change
    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    // Effect for managing the animation loop (play/pause)
    useEffect(() => {
        if (!isPlaying) {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            return;
        }

        const loop = (timestamp: number) => {
            const now = timestamp;
            const delta = now - (lastTimeRef.current || now);
            lastTimeRef.current = now;

            setCurrentTime(prev => {
                const newTime = prev + delta / 1000;
                if (newTime >= totalDuration) {
                    setIsPlaying(false);
                    return 0; // or totalDuration
                }
                return newTime;
            });
            animationFrameId.current = requestAnimationFrame(loop);
        };

        lastTimeRef.current = performance.now();
        animationFrameId.current = requestAnimationFrame(loop);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isPlaying, setCurrentTime, setIsPlaying, totalDuration]);
    
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60); const milliseconds = Math.floor((time * 1000) % 1000);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    }

    const renderTextClip = (clip: Clip) => {
        const duration = clip.end - clip.start;
        const clipLocalTime = currentTime - clip.timelineStart;
        
        let position = getInterpolatedValue(clip.properties.position, clipLocalTime);
        const rotate = getInterpolatedValue(clip.properties.rotate, clipLocalTime);
        const opacity = getInterpolatedValue(clip.properties.opacity, clipLocalTime) / 100;
        
        // Motion Path Simulation
        if (clip.motionPath === 'driftLeft') {
            const progress = clipLocalTime / duration;
            position = { ...position, x: position.x - progress * 10 };
        }
        if (clip.motionPath === 'floatUp') {
            const progress = clipLocalTime / duration;
            position = { ...position, y: position.y - progress * 10 };
        }

        let animationClass = '';
        if (clip.animationIn && clip.animationIn !== 'none' && clipLocalTime < 1) animationClass = `animate-${clip.animationIn}`;
        if (clip.animationLoop && clip.animationLoop !== 'none') animationClass += ` animate-${clip.animationLoop}`;
        
        const style: React.CSSProperties = {
            fontFamily: clip.fontFamily,
            fontSize: `${clip.fontSize}px`,
            color: clip.textStyle?.fill,
            opacity: opacity,
            position: 'absolute',
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
            whiteSpace: 'pre-wrap',
            textAlign: 'center',
            textShadow: '',
            animationFillMode: 'forwards',
            animationIterationCount: clip.animationLoop !== 'none' ? 'infinite' : 1,
        };

        if (animationClass.includes('fadeIn')) style.animation = 'fadeIn 1s ease-out';
        if (animationClass.includes('riseUp')) style.animation = 'riseUp 1s ease-out';
        if (animationClass.includes('typewriter')) {
            style.overflow = 'hidden';
            style.borderRight = '.15em solid orange';
            style.animation = 'typewriter 2s steps(40, end)';
        }
        if (animationClass.includes('pulse')) style.animation = 'pulse 2s infinite';
        if (animationClass.includes('flicker')) style.animation = 'flicker 1.5s infinite';
        if (animationClass.includes('wave')) style.animation = 'wave 3s infinite';

        let textShadows = [];
        if(clip.textStyle?.stroke.enabled && clip.textStyle.stroke.width > 0) {
            const { width, color } = clip.textStyle.stroke;
            textShadows.push(`-${width}px -${width}px 0 ${color}, ${width}px -${width}px 0 ${color}, -${width}px ${width}px 0 ${color}, ${width}px ${width}px 0 ${color}`);
        }
        if(clip.textStyle?.shadow.enabled && clip.textStyle.shadow.blur > 0) {
            const { offsetX, offsetY, blur, color } = clip.textStyle.shadow;
            textShadows.push(`${offsetX}px ${offsetY}px ${blur}px ${color}`);
        }
        if (textShadows.length > 0) style.textShadow = textShadows.join(', ');

        const bgStyle = clip.textStyle?.background.enabled ? {
            backgroundColor: clip.textStyle.background.color,
            padding: `${clip.textStyle.background.padding}px`,
            borderRadius: `${clip.textStyle.background.borderRadius}px`
        } : {};
        
        return (
            <div key={clip.id} style={style}>
                <span style={bgStyle}>{clip.content}</span>
            </div>
        );
    }
    
    return (
        <div className="flex-1 p-1 sm:p-2 md:p-4 flex flex-col items-center justify-center">
            <div ref={playerDivRef} className="w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-md relative">
                <canvas ref={canvasRef} width={1280} height={720} className="max-w-full max-h-full object-contain absolute" />
                <div className="absolute inset-0 pointer-events-none w-full h-full">
                    {tracks.flatMap(t => t.clips).filter(c => c.type === 'text' && currentTime >= c.timelineStart && currentTime < c.timelineStart + (c.end - c.start)).map(renderTextClip)}
                </div>
            </div>
            <div className="w-full flex-shrink-0 flex items-center justify-center md:justify-between flex-wrap gap-y-2 px-1 sm:px-4 py-2 mt-2">
                 <div className="hidden md:flex items-center gap-4 text-gray-400">
                    <span className="font-mono text-sm lg:text-lg text-white">{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentTime(t => Math.max(0, t - 1/30))} className="p-2 text-gray-400 hover:text-white"><Icons.PrevFrameIcon className="w-5 h-5"/></button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-transform active:scale-90" aria-label={isPlaying ? "Pause" : "Play"}>
                        {isPlaying ? <Icons.PauseIcon className="w-6 h-6" /> : <Icons.PlayIcon className="w-6 h-6" />}
                    </button>
                    <button onClick={() => setCurrentTime(t => Math.min(totalDuration, t + 1/30))} className="p-2 text-gray-400 hover:text-white"><Icons.NextFrameIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="p-2 hover:text-white"><Icons.VolumeIcon className="w-5 h-5"/></button>
                    <span className="font-semibold text-sm">16:9</span>
                    <button className="p-2 hover:text-white"><Icons.FullscreenIcon className="w-5 h-5"/></button>
                </div>
                <div className="md:hidden w-full text-center">
                    <span className="font-mono text-xs sm:text-sm text-white">{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
                </div>
            </div>
        </div>
    );
};

export default Player;
