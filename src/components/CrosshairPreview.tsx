import { useState, useEffect } from 'react';
import { decodeCrosshairShareCode, type Crosshair, InvalidShareCode, InvalidCrosshairShareCode } from '@/lib/cs2-sharecode';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Monitor, Palette } from 'lucide-react';

interface CrosshairPreviewProps {
  shareCode: string;
}

type BackgroundType = 'dust2' | 'mirage' | 'inferno' | 'dark' | 'light';

export const CrosshairPreview = ({ shareCode }: CrosshairPreviewProps) => {
  const [crosshair, setCrosshair] = useState<Crosshair | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('dust2');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!shareCode?.trim()) {
      setCrosshair(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Add a small delay to show loading state for better UX
    const timeoutId = setTimeout(() => {
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
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [shareCode]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-card/30 border border-tactical-blue/20 rounded-lg opacity-50">
          <div className="h-8 bg-secondary/50 rounded animate-pulse w-24"></div>
          <div className="h-8 bg-secondary/50 rounded animate-pulse w-16"></div>
          <div className="h-8 bg-secondary/50 rounded animate-pulse w-20"></div>
        </div>
        <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
            <div className="text-muted-foreground text-sm">Loading crosshair...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-card/30 border border-tactical-blue/20 rounded-lg opacity-50">
          <div className="h-8 bg-secondary/50 rounded w-24"></div>
          <div className="h-8 bg-secondary/50 rounded w-16"></div>
          <div className="h-8 bg-secondary/50 rounded w-20"></div>
        </div>
        <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg">
          <div className="text-destructive text-sm text-center px-4">
            <div className="mb-2">⚠️</div>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!crosshair) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-card/30 border border-tactical-blue/20 rounded-lg opacity-50">
          <div className="h-8 bg-secondary/50 rounded w-24"></div>
          <div className="h-8 bg-secondary/50 rounded w-16"></div>
          <div className="h-8 bg-secondary/50 rounded w-20"></div>
        </div>
        <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg">
          <div className="text-muted-foreground text-sm text-center">
            <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Enter a CS2 share code to preview
          </div>
        </div>
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
  
  // Responsive scaling based on screen size - more accurate CS2 proportions
  const screenWidth = window.innerWidth;
  const baseScale = (screenWidth < 768 ? 14 : screenWidth < 1024 ? 16 : screenWidth < 1280 ? 20 : 22) * zoom;
  
  // More accurate CS2 crosshair calculations
  const length = Math.max(8, crosshair.length * baseScale * 0.8); // Slightly smaller for accuracy
  const thickness = Math.max(1, crosshair.thickness * baseScale * 0.6); // More precise thickness
  
  // Better gap handling - CS2 gap behavior
  const gap = crosshair.gap * baseScale * 0.7;
  const hasNegativeGap = crosshair.gap < 0;
  const actualGap = hasNegativeGap ? Math.abs(gap) * 0.5 : Math.max(1, gap);
  
  // More accurate outline calculation
  const outlineThickness = crosshair.outlineEnabled ? 
    Math.max(0.5, crosshair.outline * baseScale * 0.3) : 0;

  // Background variations
  const getBackgroundStyle = (type: BackgroundType) => {
    switch (type) {
      case 'dust2':
        return {
          background: 'linear-gradient(135deg, #d4a574 0%, #b8956a 25%, #8b7355 75%, #6b5940 100%)',
          overlay: `
            radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 60%, rgba(101, 67, 33, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 40% 80%, rgba(160, 82, 45, 0.15) 0%, transparent 30%)
          `
        };
      case 'mirage':
        return {
          background: 'linear-gradient(135deg, #e8d5b7 0%, #c4a57b 25%, #9a8065 75%, #7a6450 100%)',
          overlay: `
            radial-gradient(circle at 30% 20%, rgba(218, 165, 32, 0.2) 0%, transparent 60%),
            radial-gradient(circle at 70% 70%, rgba(184, 134, 11, 0.15) 0%, transparent 50%)
          `
        };
      case 'inferno':
        return {
          background: 'linear-gradient(135deg, #8b4513 0%, #654321 25%, #4a2c17 75%, #2d1810 100%)',
          overlay: `
            radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 75% 60%, rgba(101, 67, 33, 0.3) 0%, transparent 35%)
          `
        };
      case 'dark':
        return {
          background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 50%, #0f0f23 100%)',
          overlay: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)'
        };
      case 'light':
        return {
          background: 'linear-gradient(135deg, #f7fafc 0%, #e2e8f0 50%, #cbd5e0 100%)',
          overlay: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.05) 0%, transparent 70%)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #d4a574 0%, #b8956a 25%, #8b7355 75%, #6b5940 100%)',
          overlay: ''
        };
    }
  };

  const backgroundStyle = getBackgroundStyle(backgroundType);
  
  console.log('Calculated values:', { 
    length, 
    thickness, 
    gap: crosshair.gap,
    actualGap,
    hasNegativeGap,
    outlineThickness, 
    baseScale,
    crosshairLength: crosshair.length,
    crosshairThickness: crosshair.thickness,
    crosshairColor,
    alpha
  });

  // Enhanced line styling with proper outline support (reverted)
  const lineStyle = {
    backgroundColor: crosshairColor,
    opacity: alpha,
    position: 'absolute' as const,
    zIndex: 10,
    borderRadius: '0.5px',
    // Proper outline implementation
    ...(outlineThickness > 0 && {
      boxShadow: `0 0 0 ${outlineThickness}px rgba(0, 0, 0, 0.8)`
    })
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-card/30 border border-tactical-blue/20 rounded-lg">
        <div className="flex items-center gap-1">
          <Button
            variant="tactical"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-3 h-3" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="tactical"
            size="sm"
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-3 h-3" />
          </Button>
        </div>
        
        <Button
          variant="tactical"
          size="sm"
          onClick={() => setZoom(1)}
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
        
        <div className="flex items-center gap-1">
          <Palette className="w-3 h-3 text-muted-foreground" />
          <select
            value={backgroundType}
            onChange={(e) => setBackgroundType(e.target.value as BackgroundType)}
            className="text-xs bg-secondary/50 border border-tactical-blue/30 rounded px-2 py-1 text-foreground"
          >
            <option value="dust2">Dust2</option>
            <option value="mirage">Mirage</option>
            <option value="inferno">Inferno</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>

      {/* Preview Container */}
      <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg relative overflow-hidden">
        {/* Dynamic background based on selection */}
        <div className="absolute inset-0" style={{ background: backgroundStyle.background }}></div>
        
        {/* Background overlay for texture */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: backgroundStyle.overlay
        }}></div>
        
        {/* Subtle noise texture for realism */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px'
        }}></div>
        
        {/* Dynamic lighting effect */}
        <div className="absolute inset-0" style={{
          background: backgroundType === 'light' ? 
            `linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%)` :
            `
              radial-gradient(ellipse at 50% 20%, rgba(255, 248, 220, 0.08) 0%, transparent 60%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.1) 100%)
            `
        }}></div>
        
        {/* Crosshair container */}
        <div className="relative w-full h-full flex items-center justify-center">
          
          {/* Center dot with reverted outline */}
          {crosshair.centerDotEnabled && (
            <div 
              style={{
                ...lineStyle,
                width: `${Math.max(1, thickness * 0.7)}px`,
                height: `${Math.max(1, thickness * 0.7)}px`,
                borderRadius: '50%',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20
              }}
            />
          )}
          
          {/* Horizontal lines with improved positioning */}
          {length > 0 && (
            <>
              {/* Left line */}
              <div 
                style={{
                  ...lineStyle,
                  width: `${length}px`,
                  height: `${thickness}px`,
                  right: hasNegativeGap ? `calc(50% - ${length/2 + actualGap}px)` : `calc(50% + ${actualGap}px)`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              {/* Right line */}
              <div 
                style={{
                  ...lineStyle,
                  width: `${length}px`,
                  height: `${thickness}px`,
                  left: hasNegativeGap ? `calc(50% - ${length/2 + actualGap}px)` : `calc(50% + ${actualGap}px)`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
            </>
          )}
          
          {/* Vertical lines with improved positioning */}
          {length > 0 && (
            <>
              {/* Top line */}
              <div 
                style={{
                  ...lineStyle,
                  width: `${thickness}px`,
                  height: `${length}px`,
                  left: '50%',
                  bottom: hasNegativeGap ? `calc(50% - ${length/2 + actualGap}px)` : `calc(50% + ${actualGap}px)`,
                  transform: 'translateX(-50%)'
                }}
              />
              {/* Bottom line */}
              <div 
                style={{
                  ...lineStyle,
                  width: `${thickness}px`,
                  height: `${length}px`,
                  left: '50%',
                  top: hasNegativeGap ? `calc(50% - ${length/2 + actualGap}px)` : `calc(50% + ${actualGap}px)`,
                  transform: 'translateX(-50%)'
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};