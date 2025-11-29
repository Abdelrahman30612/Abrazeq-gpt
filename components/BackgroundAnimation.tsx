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

    canvas.width = width;
    canvas.height = height;

    // Characters to use in the rain (Katakana + Numbers + Latin)
    const characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = characters.split('');
    
    const fontSize = 14;
    const columns = width / fontSize;
    
    // An array of drops - one per column
    // drops[i] represents the y coordinate of the drop in the i-th column
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start at random negative heights
    }

    const draw = () => {
      // Create the trail effect by drawing a translucent rectangle over the previous frame
      // Matches the app's slate-950 background (#020617)
      ctx.fillStyle = 'rgba(2, 6, 23, 0.05)'; 
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Randomly choose colors from the Abrazeq palette (Purple/Pink/Blue)
        const colors = ['#a855f7', '#d946ef', '#6366f1', '#8b5cf6']; 
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

    const interval = setInterval(draw, 33); // ~30FPS

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
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
      className="fixed inset-0 z-0 opacity-25 pointer-events-none"
    />
  );
};

export default BackgroundAnimation;