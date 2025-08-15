import React from 'react';
import GlassCard from './GlassCard';
import { ToolsIcon } from '../modules/tools/Icon'; // Using a generic icon

interface PlaceholderProps {
  sectionName: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ sectionName }) => {
  return (
    <GlassCard className="h-full flex items-center justify-center border-2 border-dashed border-cyber-border/50">
      <div className="text-center text-gray-500">
        <ToolsIcon className="w-16 h-16 mx-auto opacity-30" />
        <h2 className="mt-4 text-xl font-bold text-gray-400">{sectionName}</h2>
        <p className="mt-1 font-mono text-sm">Content for this section is under development.</p>
      </div>
    </GlassCard>
  );
};

export default Placeholder;
