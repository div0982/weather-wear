import React, { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  size: number;
  delay: number;
  speed: number;
}

export const SnowBackground = () => {
  const [snowflakes] = useState<Snowflake[]>(() => 
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 5,
      speed: Math.random() * 3 + 2
    }))
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a365d] to-[#2d3748] overflow-hidden pointer-events-none">
      {snowflakes.map(flake => (
        <div
          key={flake.id}
          className="snowflake absolute bg-white rounded-full"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.speed}s`
          }}
        />
      ))}
    </div>
  );
}; 