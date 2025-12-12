import React from 'react';

// Renders a Swastika symbol (Hindu sacred symbol)
// Kept component name as OmIcon to maintain compatibility with existing imports
export const OmIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    {/* Vertical and Horizontal Bars */}
    <rect x="11" y="2" width="2" height="20" rx="0.5" />
    <rect x="2" y="11" width="20" height="2" rx="0.5" />
    
    {/* Arms */}
    <rect x="13" y="2" width="9" height="2" rx="0.5" />   {/* Top Right */}
    <rect x="2" y="20" width="9" height="2" rx="0.5" />  {/* Bottom Left */}
    <rect x="2" y="2" width="2" height="9" rx="0.5" />   {/* Top Left - actually turns UP from left horizontal */}
    <rect x="20" y="13" width="2" height="9" rx="0.5" /> {/* Bottom Right - turns DOWN from right horizontal */}
    
    {/* Dots (Bindus) */}
    <circle cx="7" cy="7" r="1.5" className="opacity-80" />
    <circle cx="17" cy="7" r="1.5" className="opacity-80" />
    <circle cx="7" cy="17" r="1.5" className="opacity-80" />
    <circle cx="17" cy="17" r="1.5" className="opacity-80" />
  </svg>
);