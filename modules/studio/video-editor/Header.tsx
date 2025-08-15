
import React from 'react';

interface HeaderProps {
    onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExport }) => {
  return (
    <header className="h-12 bg-[#202122] flex-shrink-0 flex items-center justify-between px-2 sm:px-4 lg:px-6 border-b border-black/30">
      <div>
         {/* Future left-aligned controls can go here */}
      </div>

      <div className="text-center">
        <span className="font-semibold text-white text-xs sm:text-base">Draft.MOV</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex -space-x-2">
            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-800" src="https://picsum.photos/id/1005/100/100" alt="User 1"/>
            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-800" src="https://picsum.photos/id/1006/100/100" alt="User 2"/>
        </div>
        <button 
          onClick={onExport}
          className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#2563eb] rounded-md hover:bg-blue-600 transition-colors"
        >
          Export
        </button>
      </div>
    </header>
  );
};

export default Header;
