
import React from 'react';
import GlassCard from '../../../../components/GlassCard';

const ProfileCard: React.FC = () => {
  return (
    <GlassCard className="p-6 text-center">
      <img
        src="https://picsum.photos/id/1005/150/150"
        alt="Student Avatar"
        className="w-32 h-32 rounded-full border-4 border-cyber-purple mx-auto mb-4"
      />
      <h2 className="text-2xl font-bold text-white">Alex Thompson</h2>
      <p className="text-cyber-cyan font-mono">Student ID: 42-BEEF-CAFE</p>
      
      <div className="text-left space-y-3 mt-6">
        <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Major</p>
            <p className="text-white font-medium">Computer Science - AI Specialization</p>
        </div>
         <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Current GPA</p>
            <p className="text-white font-medium">3.8 / 4.0</p>
        </div>
         <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Expected Graduation</p>
            <p className="text-white font-medium">Spring 2025</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProfileCard;
