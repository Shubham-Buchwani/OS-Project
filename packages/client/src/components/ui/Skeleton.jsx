import React from 'react';

/**
 * Skeleton component — a shimmering placeholder for loading states.
 */
export default function Skeleton({ width, height, borderRadius, style, className = '' }) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || 'var(--radius-md)',
        ...style
      }}
    />
  );
}
