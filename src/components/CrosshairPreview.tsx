import { useState, useEffect } from 'react';
import { decodeCrosshairShareCode, type Crosshair, InvalidShareCode, InvalidCrosshairShareCode } from '@/lib/cs2-sharecode';

interface CrosshairPreviewProps {
  shareCode: string;
}

export const CrosshairPreview = ({ shareCode }: CrosshairPreviewProps) => {
  const [crosshair, setCrosshair] = useState<Crosshair | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareCode?.trim()) {
      setCrosshair(null);
      setError(null);
      return;
    }

    try {
      const decoded = decodeCrosshairShareCode(shareCode);
      setCrosshair(decoded);
      setError(null);
    } catch (err) {
      setCrosshair(null);
      if (err instanceof InvalidShareCode || err instanceof InvalidCrosshairShareCode) {
        setError('Invalid share code format');
      } else {
        setError('Failed to decode share code');
      }
    }
  }, [shareCode]);

  if (error) {
    return (
      <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg">
        <div className="text-destructive text-sm text-center px-4">{error}</div>
      </div>
    );
  }

  if (!crosshair) {
    return (
      <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg">
        <div className="text-muted-foreground text-sm">Enter share code</div>
      </div>
    );
  }

  // CS2 color mapping - accurate colors based on game
  const getCS2Color = (colorIndex: number, red: number, green: number, blue: number) => {
    switch (colorIndex) {
      case 0: return { r: 255, g: 0, b: 0 };      // Red
      case 1: return { r: 0, g: 255, b: 0 };      // Green  
      case 2: return { r: 255, g: 255, b: 0 };    // Yellow
      case 3: return { r: 0, g: 0, b: 255 };      // Blue
      case 4: return { r: 0, g: 255, b: 255 };    // Cyan
      case 5: return { r: red, g: green, b: blue }; // Custom
      default: return { r: 0, g: 255, b: 255 };   // Default to cyan
    }
  };

  const color = getCS2Color(crosshair.color, crosshair.red, crosshair.green, crosshair.blue);
  const crosshairColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
  const alpha = crosshair.alphaEnabled ? crosshair.alpha / 255 : 1;
  
  // Debug log for this specific crosshair
  console.log('Crosshair values:', {
    length: crosshair.length,
    thickness: crosshair.thickness,
    gap: crosshair.gap,
    outline: crosshair.outline,
    shareCode,
    centerDotEnabled: crosshair.centerDotEnabled,
    color: crosshair.color,
    style: crosshair.style
  });
  
  // Responsive scaling based on screen size - increased base scale for better visibility
  const screenWidth = window.innerWidth;
  const baseScale = screenWidth < 768 ? 12 : screenWidth < 1024 ? 14 : screenWidth < 1280 ? 16 : 18;
  
  // Force visible crosshair for testing - remove this later
  const forceVisible = true;
  
  // Ensure minimum visibility with proper scaling
  // Handle edge case where crosshair.length might be 0 or very small
  const rawSize = crosshair.length * baseScale;
  const size = forceVisible ? Math.max(50, rawSize) : (rawSize > 0 ? Math.max(30, rawSize) : 40);
  const thickness = forceVisible ? Math.max(4, crosshair.thickness * baseScale) : Math.max(3, crosshair.thickness * baseScale);
  const gap = Math.max(8, crosshair.gap * baseScale); // Ensure minimum gap
  const outlineThickness = crosshair.outlineEnabled ? Math.max(1, crosshair.outline * baseScale) : 0;
  
  console.log('Calculated values:', { 
    rawSize, 
    size, 
    thickness, 
    gap, 
    outlineThickness, 
    baseScale,
    crosshairLength: crosshair.length,
    crosshairThickness: crosshair.thickness,
    crosshairColor,
    alpha
  });

  const lineStyle = {
    backgroundColor: crosshairColor,
    opacity: alpha,
    boxShadow: outlineThickness > 0 ? `0 0 0 ${outlineThickness}px rgba(0, 0, 0, 0.95)` : 'none',
    position: 'absolute' as const,
    zIndex: 10
  };

  return (
    <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg relative overflow-hidden">
      {/* Game-like background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600"></div>
      {/* Grid pattern like CS2 */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }}></div>
      
      {/* Crosshair container */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Center dot */}
        {crosshair.centerDotEnabled && (
          <div 
            style={{
              ...lineStyle,
              width: `${Math.max(2, thickness * 0.8)}px`,
              height: `${Math.max(2, thickness * 0.8)}px`,
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20
            }}
          />
        )}
        
        {/* Horizontal lines */}
        {size > 0 && (
          <>
            {/* Left line */}
            <div 
              style={{
                ...lineStyle,
                width: `${size}px`,
                height: `${thickness}px`,
                right: `calc(50% + ${Math.max(0, gap / 2)}px)`,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            {/* Right line */}
            <div 
              style={{
                ...lineStyle,
                width: `${size}px`,
                height: `${thickness}px`,
                left: `calc(50% + ${Math.max(0, gap / 2)}px)`,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
          </>
        )}
        
        {/* Vertical lines */}
        {size > 0 && (
          <>
            {/* Top line */}
            <div 
              style={{
                ...lineStyle,
                width: `${thickness}px`,
                height: `${size}px`,
                left: '50%',
                bottom: `calc(50% + ${Math.max(0, gap / 2)}px)`,
                transform: 'translateX(-50%)'
              }}
            />
            {/* Bottom line */}
            <div 
              style={{
                ...lineStyle,
                width: `${thickness}px`,
                height: `${size}px`,
                left: '50%',
                top: `calc(50% + ${Math.max(0, gap / 2)}px)`,
                transform: 'translateX(-50%)'
              }}
            />
          </>
        )}
      </div>
      
      {/* Debug info overlay (remove in production) */}
      <div className="absolute top-1 right-1 text-xs text-white/50 font-mono">
        {crosshair.style}
      </div>
    </div>
  );
};