import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedHeroGraphic = () => {
  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center mb-8">
      {/* Background glowing orb */}
      <motion.div 
        className="absolute inset-0 bg-brand-primary/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />

      {/* Main floating container */}
      <motion.div
        className="relative z-10 w-full h-full"
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          {/* Main Shield / Crest Background */}
          <motion.path
            d="M100 20 C150 20 180 50 180 90 C180 140 130 180 100 190 C70 180 20 140 20 90 C20 50 50 20 100 20 Z"
            fill="url(#shield-grad)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Graduation Cap */}
          <motion.g
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          >
            <path d="M100 50 L150 75 L100 100 L50 75 Z" fill="#0f172a" />
            <path d="M60 80 L60 110 C60 125 140 125 140 110 L140 80 L100 100 Z" fill="#1e293b" />
            {/* Tassel */}
            <motion.path 
              d="M100 75 L160 100 L160 120" 
              stroke="#F59E0B" 
              strokeWidth="4" 
              fill="none"
              strokeLinecap="round"
              animate={{ rotate: [-2, 5, -2], originX: "100px", originY: "75px" }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <circle cx="160" cy="125" r="5" fill="#F59E0B" />
          </motion.g>

          {/* Floating Diploma */}
          <motion.g
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
          >
            <rect x="70" y="110" width="60" height="20" rx="4" fill="#ffffff" transform="rotate(-15 100 120)" />
            <rect x="90" y="105" width="10" height="30" fill="#F59E0B" transform="rotate(-15 100 120)" />
          </motion.g>

          {/* Sparkles / Stars */}
          {[
            { cx: 40, cy: 60, delay: 0 },
            { cx: 160, cy: 50, delay: 1 },
            { cx: 50, cy: 150, delay: 2 },
            { cx: 150, cy: 160, delay: 1.5 }
          ].map((star, i) => (
            <motion.circle
              key={i}
              cx={star.cx}
              cy={star.cy}
              r="4"
              fill="#F59E0B"
              animate={{ 
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: star.delay,
                ease: "easeInOut"
              }}
            />
          ))}

          <defs>
            <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
};
