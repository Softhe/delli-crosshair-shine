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
      <div className="crosshair-preview w-32 h-32 flex items-center justify-center">
        <div className="text-destructive text-sm text-center">{error}</div>
      </div>
    );
  }

  if (!crosshair) {
    return (
      <div className="crosshair-preview w-32 h-32 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">No preview</div>
      </div>
    );
  }
  
  // Calculate crosshair dimensions and colors
  const crosshairSize = crosshair.length * 4; // Scale up for visibility
  const lineThickness = Math.max(1, crosshair.thickness * 2);
  const gapSize = Math.max(0, crosshair.gap * 2);
  const outlineSize = crosshair.outline;
  
  // Get crosshair color
  const getCrosshairColor = () => {
    if (crosshair.color === 5) {
      // Custom color using RGB values
      return `rgb(${crosshair.red}, ${crosshair.green}, ${crosshair.blue})`;
    }
    // Predefined colors
    const colors = [
      'rgb(250, 50, 50)',   // Red
      'rgb(50, 250, 50)',   // Green  
      'rgb(255, 255, 50)',  // Yellow
      'rgb(50, 50, 250)',   // Blue
      'rgb(50, 255, 255)',  // Cyan
    ];
    return colors[crosshair.color] || colors[4]; // Default to cyan
  };
  
  const crosshairColor = getCrosshairColor();
  const alpha = crosshair.alphaEnabled ? crosshair.alpha / 255 : 1;

  return (
    <div className="crosshair-preview w-32 h-32 flex items-center justify-center relative overflow-hidden">
      {/* Background grid for better visibility */}
      <div className="absolute inset-0 tactical-grid opacity-30"></div>
      
      {/* Center dot */}
      {crosshair.centerDotEnabled && (
        <div 
          className="absolute"
          style={{
            width: `${lineThickness}px`,
            height: `${lineThickness}px`,
            backgroundColor: crosshairColor,
            opacity: alpha,
            boxShadow: crosshair.outlineEnabled ? `0 0 0 1px rgba(0,0,0,0.8)` : 'none',
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
      
      {/* Horizontal lines */}
      {/* Left line */}
      <div 
        className="absolute"
        style={{
          width: `${crosshairSize}px`,
          height: `${lineThickness}px`,
          backgroundColor: crosshairColor,
          opacity: alpha,
          boxShadow: crosshair.outlineEnabled ? `0 0 0 ${outlineSize}px rgba(0,0,0,0.8)` : 'none',
          top: '50%',
          right: `calc(50% + ${gapSize}px)`,
          transform: 'translateY(-50%)'
        }}
      />
      {/* Right line */}
      <div 
        className="absolute"
        style={{
          width: `${crosshairSize}px`,
          height: `${lineThickness}px`,
          backgroundColor: crosshairColor,
          opacity: alpha,
          boxShadow: crosshair.outlineEnabled ? `0 0 0 ${outlineSize}px rgba(0,0,0,0.8)` : 'none',
          top: '50%',
          left: `calc(50% + ${gapSize}px)`,
          transform: 'translateY(-50%)'
        }}
      />
      
      {/* Vertical lines */}
      {/* Top line */}
      <div 
        className="absolute"
        style={{
          height: `${crosshairSize}px`,
          width: `${lineThickness}px`,
          backgroundColor: crosshairColor,
          opacity: alpha,
          boxShadow: crosshair.outlineEnabled ? `0 0 0 ${outlineSize}px rgba(0,0,0,0.8)` : 'none',
          left: '50%',
          bottom: `calc(50% + ${gapSize}px)`,
          transform: 'translateX(-50%)'
        }}
      />
      {/* Bottom line */}
      <div 
        className="absolute"
        style={{
          height: `${crosshairSize}px`,
          width: `${lineThickness}px`,
          backgroundColor: crosshairColor,
          opacity: alpha,
          boxShadow: crosshair.outlineEnabled ? `0 0 0 ${outlineSize}px rgba(0,0,0,0.8)` : 'none',
          left: '50%',
          top: `calc(50% + ${gapSize}px)`,
          transform: 'translateX(-50%)'
        }}
      />
    </div>
  );
};