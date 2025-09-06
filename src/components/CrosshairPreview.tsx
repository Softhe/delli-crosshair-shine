import { useState, useEffect } from 'react';

interface CrosshairSettings {
  size: number;
  thickness: number;
  gap: number;
  outline: number;
  dot: boolean;
  color: string;
}

interface CrosshairPreviewProps {
  shareCode: string;
}

// Parse CS2 share code to extract crosshair settings
const parseShareCode = (shareCode: string): CrosshairSettings | null => {
  if (!shareCode || !shareCode.startsWith('CSGO-')) {
    return null;
  }

  // This is a simplified parser - in reality, CS2 share codes are base64 encoded
  // For demo purposes, we'll generate some variations based on the code
  const hash = shareCode.split('-').join('').slice(4);
  const seed = hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    size: 2 + (seed % 8), // 2-10
    thickness: 1 + (seed % 3), // 1-4
    gap: -2 + (seed % 5), // -2-3
    outline: seed % 2, // 0-1
    dot: (seed % 2) === 1,
    color: '#00FFFF' // Default cyan
  };
};

export const CrosshairPreview = ({ shareCode }: CrosshairPreviewProps) => {
  const [settings, setSettings] = useState<CrosshairSettings | null>(null);

  useEffect(() => {
    const parsed = parseShareCode(shareCode);
    setSettings(parsed);
  }, [shareCode]);

  if (!settings) {
    return (
      <div className="crosshair-preview w-32 h-32 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">No preview</div>
      </div>
    );
  }

  const { size, thickness, gap, outline, dot } = settings;
  
  // Calculate crosshair dimensions
  const crosshairSize = size * 2;
  const lineThickness = Math.max(1, thickness);
  const gapSize = Math.max(0, gap);
  const outlineSize = outline;

  return (
    <div className="crosshair-preview w-32 h-32 flex items-center justify-center relative overflow-hidden">
      {/* Background grid for better visibility */}
      <div className="absolute inset-0 tactical-grid opacity-30"></div>
      
      {/* Center dot */}
      {dot && (
        <div 
          className="absolute"
          style={{
            width: `${lineThickness * 2}px`,
            height: `${lineThickness * 2}px`,
            backgroundColor: settings.color,
            boxShadow: `0 0 ${outlineSize * 2}px ${settings.color}`,
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
      
      {/* Horizontal line */}
      <div 
        className="absolute"
        style={{
          width: `${crosshairSize * 2 + gapSize * 2}px`,
          height: `${lineThickness}px`,
          background: `linear-gradient(90deg, ${settings.color} 0%, ${settings.color} ${((crosshairSize - gapSize) / (crosshairSize * 2 + gapSize * 2)) * 100}%, transparent ${((crosshairSize - gapSize) / (crosshairSize * 2 + gapSize * 2)) * 100}%, transparent ${((crosshairSize + gapSize) / (crosshairSize * 2 + gapSize * 2)) * 100}%, ${settings.color} ${((crosshairSize + gapSize) / (crosshairSize * 2 + gapSize * 2)) * 100}%)`,
          boxShadow: outlineSize > 0 ? `0 0 ${outlineSize * 2}px ${settings.color}40` : 'none',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Vertical line */}
      <div 
        className="absolute"
        style={{
          height: `${crosshairSize * 2 + gapSize * 2}px`,
          width: `${lineThickness}px`,
          background: `linear-gradient(180deg, ${settings.color} 0%, ${settings.color} ${((crosshairSize - gapSize) / (crosshairSize * 2 + gapSize * 2)) * 100}%, transparent ${((crosshairSize - gapSize) / (crosshairSize * 2 + gapSize * 2)) * 100}%, transparent ${((crosshairSize + gapSize) / (crosshairSize * 2 + gapSize * 2)) * 100}%, ${settings.color} ${((crosshairSize + gapSize) / (crosshairSize * 2 + gapSize * 2)) * 100}%)`,
          boxShadow: outlineSize > 0 ? `0 0 ${outlineSize * 2}px ${settings.color}40` : 'none',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
};