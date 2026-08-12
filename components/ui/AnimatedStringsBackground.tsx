'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';

export default function AnimatedStringsBackground() {
  const [dimensions, setDimensions] = useState({ width: 1440, height: 900 });
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use a slightly wider spacing for a cleaner background
  const spacing = 64; 
  const numStrings = Math.floor(dimensions.height / spacing);
  const strings = React.useMemo(() => Array.from({ length: numStrings }), [numStrings]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    
    // Set initial dimensions
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle GSAP interactive plucking animations
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      strings.forEach((_, i) => {
        const path = svg.querySelector(`#string-${i}`);
        if (!path) return;

        const yPos = (i + 1) * spacing;
        const distance = mouseY - yPos;

        // If mouse is near the string (within a 60px radius threshold)
        if (Math.abs(distance) < 60) {
          // Bend the string towards the mouse
          const pull = distance * 0.7; // Dampen the pull slightly
          gsap.to(path, {
            attr: { d: `M 0 ${yPos} Q ${mouseX} ${yPos + pull} ${dimensions.width} ${yPos}` },
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
          });
        } else {
          // Spring back to straight line with a highly elastic bounce
          gsap.to(path, {
            attr: { d: `M 0 ${yPos} Q ${dimensions.width / 2} ${yPos} ${dimensions.width} ${yPos}` },
            duration: 1.5,
            ease: "elastic.out(1, 0.15)",
            overwrite: "auto"
          });
        }
      });
    };

    const handleMouseLeave = () => {
      // Snap all strings back if mouse leaves window
      strings.forEach((_, i) => {
        const path = svg.querySelector(`#string-${i}`);
        if (!path) return;
        const yPos = (i + 1) * spacing;
        gsap.to(path, {
          attr: { d: `M 0 ${yPos} Q ${dimensions.width / 2} ${yPos} ${dimensions.width} ${yPos}` },
          duration: 1.5,
          ease: "elastic.out(1, 0.15)",
          overwrite: "auto"
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [dimensions, strings]);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-app-bg overflow-hidden">
      <svg 
        ref={svgRef}
        width={dimensions.width} 
        height={dimensions.height} 
        className="w-full h-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
      >
        {strings.map((_, i) => {
          const yPos = (i + 1) * spacing;
          const initialPath = `M 0 ${yPos} Q ${dimensions.width / 2} ${yPos} ${dimensions.width} ${yPos}`;
          return (
            <motion.path
              key={i}
              id={`string-${i}`}
              d={initialPath}
              stroke="#E4E4E7" // zinc-200 color for a subtle grid line look
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.8, delay: i * 0.08, ease: 'circOut' }}
            />
          );
        })}
      </svg>
    </div>
  );
}
