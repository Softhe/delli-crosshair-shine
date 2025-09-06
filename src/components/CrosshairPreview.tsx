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
      <div className="w-40 h-40 flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg">
        <div className="text-destructive text-sm text-center px-4">{error}</div>
      </div>
    );
  }

  if (!crosshair) {
    return (
      <div className="w-40 h-40 flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg">
        <div className="text-muted-foreground text-sm">Enter share code</div>
      </div>
    );
  }

  // CS2 color mapping
  const getCS2Color = (colorIndex: number, red: number, green: number, blue: number) => {
    switch (colorIndex) {
      case 0: return { r: 250, g: 50, b: 50 };    // Red
      case 1: return { r: 50, g: 250, b: 50 };    // Green
      case 2: return { r: 255, g: 255, b: 50 };   // Yellow
      case 3: return { r: 50, g: 50, b: 250 };    // Blue
      case 4: return { r: 50, g: 255, b: 255 };   // Cyan
      case 5: return { r: red, g: green, b: blue }; // Custom
      default: return { r: 50, g: 255, b: 255 };  // Default to cyan
    }
  };

  const color = getCS2Color(crosshair.color, crosshair.red, crosshair.green, crosshair.blue);
  const crosshairColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
  const alpha = crosshair.alphaEnabled ? crosshair.alpha / 255 : 1;
  
  // Scale values for better visibility (CS2 uses different units)
  const scale = 3;
  const size = Math.max(1, crosshair.length * scale);
  const thickness = Math.max(1, crosshair.thickness * scale);
  const gap = Math.max(0, crosshair.gap * scale);
  const outlineThickness = crosshair.outlineEnabled ? Math.max(1, crosshair.outline) : 0;

  const lineStyle = {
    backgroundColor: crosshairColor,
    opacity: alpha,
    outline: outlineThickness > 0 ? `${outlineThickness}px solid rgba(0, 0, 0, 0.8)` : 'none',
    outlineOffset: '0px'
  };

  return (
    <div className="w-40 h-40 flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg relative overflow-hidden">
      {/* Dark background for contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
      
      {/* Crosshair container */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Center dot */}
        {crosshair.centerDotEnabled && (
          <div 
            className="absolute z-20"
            style={{
              ...lineStyle,
              width: `${Math.max(2, thickness)}px`,
              height: `${Math.max(2, thickness)}px`,
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        
        {/* Horizontal lines */}
        {size > 0 && (
          <>
            {/* Left line */}
            <div 
              className="absolute z-10"
              style={{
                ...lineStyle,
                width: `${size}px`,
                height: `${thickness}px`,
                right: `calc(50% + ${gap / 2}px)`,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            {/* Right line */}
            <div 
              className="absolute z-10"
              style={{
                ...lineStyle,
                width: `${size}px`,
                height: `${thickness}px`,
                left: `calc(50% + ${gap / 2}px)`,
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
              className="absolute z-10"
              style={{
                ...lineStyle,
                width: `${thickness}px`,
                height: `${size}px`,
                left: '50%',
                bottom: `calc(50% + ${gap / 2}px)`,
                transform: 'translateX(-50%)'
              }}
            />
            {/* Bottom line */}
            <div 
              className="absolute z-10"
              style={{
                ...lineStyle,
                width: `${thickness}px`,
                height: `${size}px`,
                left: '50%',
                top: `calc(50% + ${gap / 2}px)`,
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