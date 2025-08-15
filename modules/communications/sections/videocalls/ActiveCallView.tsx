
import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../../../../components/GlassCard';
import * as CallIcons from './CallIcons';

const participants = [
    { id: 2, name: 'Dr. Anya Sharma', avatar: 'https://i.pravatar.cc/150?img=1', isMuted: false },
    { id: 3, name: 'Kyle Reese', avatar: 'https://i.pravatar.cc/150?img=2', isMuted: true },
    { id: 4, name: 'AI Assistant', avatar: 'https://i.pravatar.cc/150?img=3', isMuted: true, isAI: true },
    { id: 5, name: 'John Anderton', avatar: 'https://i.pravatar.cc/150?img=4', isMuted: false },
];

const ActiveCallView: React.FC<{ onEndCall: () => void }> = ({ onEndCall }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isAvatarMode, setIsAvatarMode] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isCamOff) {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
        } else {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => console.error("Error accessing camera:", err));
        }

        return () => {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [isCamOff]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="h-full flex flex-col bg-cyber-bg/50 rounded-lg relative overflow-hidden">
            <style>{`
                .holo-video {
                    filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.7)) drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
                }
                .holo-video::after {
                    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: repeating-linear-gradient(0deg, rgba(0,255,255,0.1), rgba(0,255,255,0.1) 1px, transparent 1px, transparent 4px);
                    animation: holoscan 4s linear infinite; pointer-events: none;
                }
                @keyframes holoscan { from { background-position-y: 0; } to { background-position-y: -200%; } }
                .participant-grid {
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                }
            `}</style>
            
            <header className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                <span className="font-mono text-lg text-white bg-black/30 px-3 py-1 rounded-lg border border-cyber-border">{formatDuration(callDuration)}</span>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
                {/* Main Video View */}
                <div className="relative w-full max-w-4xl aspect-video holo-video">
                     <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-md" style={{ transform: 'scaleX(-1)' }}></video>
                </div>
                 {isTranslating && (
                    <div className="absolute bottom-24 w-full max-w-4xl p-2 text-center text-lg italic text-cyber-cyan font-semibold bg-black/50 backdrop-blur-sm rounded">
                        [AI Translation]: "Acknowledged. Proceeding with the data transfer."
                    </div>
                )}
            </main>
            
             <aside className="absolute right-0 top-0 bottom-24 w-48 p-2 overflow-y-auto space-y-2">
                 {participants.map(p => (
                     <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-cyber-border/50">
                         <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                         <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-xs truncate">{p.name}</div>
                         {p.isMuted && <div className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full"><CallIcons.MicOffIcon className="w-3 h-3 text-white"/></div>}
                     </div>
                 ))}
            </aside>

            <footer className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-black/50 to-transparent">
                <GlassCard className="max-w-xl mx-auto p-2">
                    <div className="flex justify-center items-center gap-4">
                        <button onClick={() => setIsMuted(m => !m)} className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-cyber-surface'}`}><CallIcons.MicOffIcon className="w-6 h-6"/></button>
                        <button onClick={() => setIsCamOff(c => !c)} className={`p-3 rounded-full ${isCamOff ? 'bg-red-500' : 'bg-cyber-surface'}`}><CallIcons.CamOffIcon className="w-6 h-6"/></button>
                        <button className="p-3 rounded-full bg-cyber-surface"><CallIcons.ShareScreenIcon className="w-6 h-6"/></button>
                        <button onClick={onEndCall} className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"><CallIcons.EndCallIcon className="w-6 h-6"/></button>
                        <div className="w-px h-8 bg-cyber-border mx-2"></div>
                        <button onClick={() => setIsTranslating(t => !t)} className={`p-3 rounded-full transition-colors ${isTranslating ? 'bg-cyber-cyan text-black' : 'bg-cyber-surface'}`} title="AI Translation"><CallIcons.TranslateIcon className="w-6 h-6"/></button>
                        <button onClick={() => setIsAvatarMode(a => !a)} className={`p-3 rounded-full transition-colors ${isAvatarMode ? 'bg-cyber-cyan text-black' : 'bg-cyber-surface'}`} title="AI Avatar Mode"><CallIcons.AvatarIcon className="w-6 h-6"/></button>
                    </div>
                </GlassCard>
            </footer>
        </div>
    );
};

export default ActiveCallView;
