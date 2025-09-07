import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CrosshairPreview } from './CrosshairPreview';
import { Download, Copy, Crosshair } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { decodeCrosshairShareCode, crosshairToConVars, InvalidShareCode, InvalidCrosshairShareCode } from '@/lib/cs2-sharecode';

// This function converts CS2 share code to config commands
const generateConfig = (shareCode: string, aliasName?: string): string => {
  if (!shareCode || !shareCode.startsWith('CSGO-')) {
    throw new Error('Invalid CS2 share code format');
  }

  try {
    const crosshair = decodeCrosshairShareCode(shareCode);
    const convars = crosshairToConVars(crosshair);
    
    const fileName = aliasName ? `crosshair_${aliasName}.cfg` : 'crosshair.cfg';
    const displayName = aliasName || 'mycrosshair';
    const aliasCommand = `alias "${displayName}" "exec ${fileName}"`;
    
    return `// CS2 Crosshair Config - Generated from ${shareCode}
// Place this file in your CS2 config folder
// Add this to your autoexec.cfg: ${aliasCommand}

// Crosshair settings
${convars}

echo "Crosshair config loaded successfully!"`;
  } catch (error) {
    if (error instanceof InvalidShareCode || error instanceof InvalidCrosshairShareCode) {
      throw new Error('Invalid crosshair share code');
    }
    throw error;
  }
};

export const CS2ConfigGenerator = () => {
  const [shareCode, setShareCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aliasName, setAliasName] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!shareCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid CS2 share code",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const config = generateConfig(shareCode, aliasName);
      
      // Create and download the config file
      const blob = new Blob([config], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = aliasName ? `crosshair_${aliasName}.cfg` : 'crosshair.cfg';
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success!",
        description: "Config file downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate config",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPath = () => {
    const configPath = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo\\cfg";
    navigator.clipboard.writeText(configPath);
    toast({
      title: "Copied!",
      description: "Config path copied to clipboard",
    });
  };

  const handleCopyAlias = () => {
    if (!aliasName.trim()) return;
    const fileName = `crosshair_${aliasName}.cfg`;
    const aliasCommand = `alias "${aliasName}" "exec ${fileName}"`;
    navigator.clipboard.writeText(aliasCommand);
    toast({
      title: "Copied!",
      description: "Alias command copied to clipboard",
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Crosshair className="w-8 h-8 text-neon-cyan" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            CS2 Crosshair
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Config Generator
        </p>
        <div className="text-sm text-neon-cyan font-mono">
          delli.cc
        </div>
      </div>

      {/* Main Tool */}
      <Card className="p-8 space-y-6 bg-card/50 border-tactical-blue/30 backdrop-blur-sm">
        <div className="space-y-4">
          <label htmlFor="shareCode" className="text-lg font-semibold text-foreground">
            Enter your CS2 share code:
          </label>
          <Input
            id="shareCode"
            type="text"
            placeholder="CSGO-O4Jai-V36wY-rTMGK-9w7qF-jQ8WB"
            value={shareCode}
            onChange={(e) => setShareCode(e.target.value)}
            className="text-lg py-6 bg-secondary/50 border-tactical-blue/30 focus:border-neon-cyan transition-all duration-300"
          />
        </div>

        <div className="space-y-4">
          <label htmlFor="aliasName" className="text-lg font-semibold text-foreground">
            Alias name (optional):
          </label>
          <div className="space-y-2">
            <Input
              id="aliasName"
              type="text"
              placeholder="e.g., bluedynsmall"
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              className="text-lg py-6 bg-secondary/50 border-tactical-blue/30 focus:border-neon-cyan transition-all duration-300"
            />
            {aliasName && (
              <div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-md border border-tactical-blue/20">
                <code className="text-sm text-neon-cyan font-mono flex-1">
                  alias "{aliasName}" "exec crosshair_{aliasName}.cfg"
                </code>
                <Button onClick={handleCopyAlias} variant="tactical" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Crosshair Preview */}
        {shareCode && (
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-semibold text-neon-cyan">Crosshair Preview</h3>
            <CrosshairPreview shareCode={shareCode} />
          </div>
        )}

        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !shareCode.trim()}
          variant="gaming"
          size="lg"
          className="w-full text-lg py-6"
        >
          <Download className="w-5 h-5" />
          {isGenerating ? 'Generating...' : 'Generate Config File'}
        </Button>
      </Card>

      {/* Instructions */}
      <Card className="p-6 space-y-4 bg-card/30 border-tactical-blue/20">
        <h3 className="text-lg font-semibold text-neon-cyan">How to use:</h3>
        <ol className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Copy your CS2 crosshair share code
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Paste it in the input field above
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Click "Generate Config File" to download your .cfg file
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">4</span>
            Place the .cfg file in your CS2 config folder
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">5</span>
            <div className="space-y-2">
              <span>Config folder is probably located at:</span>
              <div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-md border border-tactical-blue/20">
                <code className="text-sm text-neon-cyan font-mono flex-1">
                  C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg
                </code>
                <Button 
                  onClick={handleCopyPath}
                  variant="tactical"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </li>
        </ol>
      </Card>
    </div>
  );
};