import React, { useEffect, useRef } from 'react';

const BackgroundAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    setCanvasSize();

    // Characters to use in the rain
    const characters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}/;[]!@#$%^&*()_+-=';
    const charArray = characters.split('');
    
    const fontSize = 14;
    let columns = width / fontSize;
    
    // drops[i] represents the y coordinate of the drop in the i-th column
    let drops: number[] = [];
    
    const initDrops = () => {
      columns = width / fontSize;
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100; // Start at random negative heights
      }
    };

    initDrops();

    const draw = () => {
      // Create trail effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.05)'; // Matches bg-slate-950 with high transparency
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px 'Courier New', monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Randomly choose colors from the Abrazeq palette
        const colors = [
          '#a855f7', // Purple-500
          '#d946ef', // Pink-500
          '#3b82f6', // Blue-500
          '#4c1d95', // Purple-900 (darker)
        ];
        
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly after it crosses the screen
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move the drop down
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      setCanvasSize();
      initDrops();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none"
    />
  );
};

export default BackgroundAnimation;
