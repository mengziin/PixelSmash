import React, { useEffect, useRef } from 'react';

interface PixelCanvasProps {
  src: string;
  pixelSize?: number; // Higher number = more blocky
  className?: string;
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({ src, pixelSize = 4, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate aspect ratio
      const aspect = img.width / img.height;
      
      // Logic: Render small, then let CSS scale it up
      // Use a slightly larger base for calculation to ensure we don't get too blocky on large screens
      const displayWidth = canvas.clientWidth || 400; 
      const displayHeight = displayWidth / aspect;
      
      // Target resolution
      // Ensure minimum dimensions to prevent complete blur
      const w = Math.max(64, Math.floor(displayWidth / pixelSize));
      const h = Math.max(64, Math.floor(displayHeight / pixelSize));

      canvas.width = w;
      canvas.height = h;

      // Disable smoothing for pixel art look
      ctx.imageSmoothingEnabled = false;
      
      // Draw image small
      ctx.drawImage(img, 0, 0, w, h);
    };
  }, [src, pixelSize]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-auto pixelated ${className}`} 
      style={{ 
        imageRendering: 'pixelated',
        // Reduced contrast/saturation to keep the image clearer and more natural while still retro
        filter: 'contrast(1.05) saturate(1.05)' 
      }}
    />
  );
};