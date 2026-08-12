'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface SplitTextProps {
  text: string | number;
  className?: string;
  delay?: number;
  duration?: number;
  by?: 'word' | 'char';
}

export default function SplitText({ 
  text, 
  className = '', 
  delay = 0,
  duration = 0.5,
  by = 'char'
}: SplitTextProps) {
  const textStr = String(text);
  const elements = by === 'word' ? textStr.split(' ') : textStr.split('');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
        duration: duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      filter: 'blur(4px)',
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {elements.map((element, index) => (
        <motion.span
          variants={child}
          key={index}
          style={{ display: 'inline-block' }}
        >
          {element === ' ' ? '\u00A0' : element}
          {by === 'word' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </motion.div>
  );
}
