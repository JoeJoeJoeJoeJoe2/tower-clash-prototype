import { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-[#1a4a7c] via-[#0d3a5c] to-[#0a2840] flex flex-col items-center justify-center overflow-hidden relative">
      {/* Diamond pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              rgba(255,255,255,0.05) 20px,
              rgba(255,255,255,0.05) 40px
            )`
          }}
        />
      </div>

      {/* Characters area - emoji placeholders */}
      <div className="relative mb-8 flex items-end justify-center gap-2">
        <div className="text-5xl animate-bounce" style={{ animationDelay: '0.1s' }}>👺</div>
        <div className="text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>⚔️</div>
        <div className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>💀</div>
        <div className="text-7xl animate-bounce" style={{ animationDelay: '0.15s' }}>👑</div>
        <div className="text-5xl animate-bounce" style={{ animationDelay: '0.25s' }}>🗿</div>
        <div className="text-4xl animate-bounce" style={{ animationDelay: '0.05s' }}>🏹</div>
        <div className="text-6xl animate-bounce" style={{ animationDelay: '0.3s' }}>🤖</div>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <h1 
          className="text-5xl font-black tracking-wider uppercase"
          style={{
            fontFamily: "'Luckiest Guy', cursive",
            color: '#ffffff',
            textShadow: '3px 3px 0px #1a3a5c, 4px 4px 0px #0d2840, 5px 5px 10px rgba(0,0,0,0.5)',
            filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.6))',
            letterSpacing: '4px',
          }}
        >
          Cracked
        </h1>
        <h1 
          className="text-6xl font-black tracking-wider uppercase -mt-2"
          style={{
            fontFamily: "'Luckiest Guy', cursive",
            background: 'linear-gradient(180deg, #fff9c4 0%, #ffd54f 25%, #ff8f00 50%, #e65100 75%, #8b4513 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.6))',
            letterSpacing: '3px',
          }}
        >
          Royale
        </h1>

        {/* Shield with crown */}
        <div className="mt-4 w-20 h-24 relative">
          <div 
            className="absolute inset-0 rounded-b-full"
            style={{
              background: 'linear-gradient(180deg, #1e40af 0%, #1e3a8a 50%, #172554 100%)',
              clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
              border: '3px solid #fbbf24'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pt-2">
            <Crown className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Loading bar */}
      <div className="w-64 h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-gray-400 mt-2 text-sm">Loading...</p>
    </div>
  );
}
