import React from 'react';

/**
 * Renders hidden SVG definitions for reusable CSS squircle clip-paths.
 */
export default function SquircleClipPath() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <clipPath id="squircle-clip" clipPathUnits="objectBoundingBox">
          <path d="M 0, 0.5 C 0, 0.04, 0.04, 0, 0.5, 0 C 0.96, 0, 1, 0.04, 1, 0.5 C 1, 0.96, 0.96, 1, 0.5, 1 C 0.04, 1, 0, 0.96, 0, 0.5 Z" />
        </clipPath>
        <clipPath id="squircle-clip-sharp" clipPathUnits="objectBoundingBox">
          <path d="M 0, 0.5 C 0, 0.02, 0.02, 0, 0.5, 0 C 0.98, 0, 1, 0.02, 1, 0.5 C 1, 0.98, 0.98, 1, 0.5, 1 C 0.02, 1, 0, 0.98, 0, 0.5 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
