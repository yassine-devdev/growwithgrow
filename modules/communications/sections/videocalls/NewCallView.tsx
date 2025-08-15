
import React, { useEffect, useRef } from 'react';
import GlassCard from '../../../../components/GlassCard';

const NewCallView: React.FC<{ onStartCall: () => void }> = ({ onStartCall }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => console.error("Error accessing camera:", err));

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center">
                <GlassCard className="w-full aspect-video p-2">
                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-md" style={{ transform: 'scaleX(-1)' }}></video>
                </GlassCard>
            </div>
            <div className="flex flex-col justify-center gap-6">
                <h2 className="text-4xl font-bold text-white">Ready to connect?</h2>
                <div className="space-y-4">
                    <button 
                        onClick={onStartCall}
                        className="w-full py-4 text-lg bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow"
                    >
                        Start Instant Meeting
                    </button>
                    <div className="flex gap-4">
                        <input type="text" placeholder="Enter meeting code" className="flex-1 bg-cyber-surface border border-cyber-border rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan" />
                        <button className="px-6 py-3 bg-cyber-surface text-white font-bold rounded-lg hover:bg-white/10">Join</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewCallView;
