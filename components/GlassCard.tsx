import React from 'react';

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative bg-gradient-to-tr from-card-from to-card-to border border-cyber-border rounded-xl shadow-lg backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}
    >
      {/* Enhanced glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-tl from-cyber-cyan/5 to-transparent opacity-20" />
      
      {/* Subtle animated border glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-cyan/10 via-cyber-purple/5 to-cyber-cyan/10 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;