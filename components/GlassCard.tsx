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
      className={`bg-gradient-to-tr from-card-from to-card-to border border-cyber-border rounded-lg shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;