
import React from 'react';
import GlassCard from '../../../components/GlassCard';
import { CRMSection } from '../../../types';
import { CRM_SECTIONS } from '../../../constants';

interface CRMHeaderProps {
  activeSection: CRMSection;
  setActiveSection: (section: CRMSection) => void;
}

const CRMHeader: React.FC<CRMHeaderProps> = ({ activeSection, setActiveSection }) => {
  return (
    <header className="p-4 flex-shrink-0">
      <GlassCard className="w-full h-full flex items-center justify-center px-4">
        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-cyber-border">
          {CRM_SECTIONS.map((item) => (
            <button
              key={item}
              onClick={() => setActiveSection(item)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
                activeSection === item
                  ? 'bg-cyber-purple/20 text-cyber-purple shadow-glow-purple'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </GlassCard>
    </header>
  );
};

export default CRMHeader;
