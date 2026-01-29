import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface EmoteMessage {
  id: string;
  content: string;
  isText: boolean;
  isPlayer: boolean;
  timestamp: number;
}

interface EmoteDisplayProps {
  messages: EmoteMessage[];
}

export function EmoteDisplay({ messages }: EmoteDisplayProps) {
  const [visibleMessages, setVisibleMessages] = useState<EmoteMessage[]>([]);

  useEffect(() => {
    // Add new messages
    const newMessages = messages.filter(
      m => !visibleMessages.some(vm => vm.id === m.id)
    );
    
    if (newMessages.length > 0) {
      setVisibleMessages(prev => [...prev, ...newMessages]);
    }

    // Remove old messages after 3 seconds
    const timeout = setTimeout(() => {
      const now = Date.now();
      setVisibleMessages(prev => 
        prev.filter(m => now - m.timestamp < 3000)
      );
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);

  return (
    <>
      {/* Player emote (bottom) */}
      {visibleMessages.filter(m => m.isPlayer).slice(-1).map(message => (
        <div
          key={message.id}
          className={cn(
            "absolute bottom-24 left-1/2 -translate-x-1/2 z-40",
            "animate-in zoom-in-75 fade-in duration-200"
          )}
        >
          <EmoteBubble content={message.content} isText={message.isText} isPlayer={true} />
        </div>
      ))}

      {/* Enemy emote (top) */}
      {visibleMessages.filter(m => !m.isPlayer).slice(-1).map(message => (
        <div
          key={message.id}
          className={cn(
            "absolute top-12 left-1/2 -translate-x-1/2 z-40",
            "animate-in zoom-in-75 fade-in duration-200"
          )}
        >
          <EmoteBubble content={message.content} isText={message.isText} isPlayer={false} />
        </div>
      ))}
    </>
  );
}

function EmoteBubble({ content, isText, isPlayer }: { content: string; isText: boolean; isPlayer: boolean }) {
  return (
    <div 
      className={cn(
        "relative px-4 py-2 rounded-2xl shadow-lg animate-bounce-subtle",
        isPlayer 
          ? "bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-400"
          : "bg-gradient-to-b from-red-500 to-red-700 border-2 border-red-400"
      )}
    >
      {isText ? (
        <span className="text-white font-bold text-sm whitespace-nowrap">{content}</span>
      ) : (
        <span className="text-4xl">{content}</span>
      )}
      
      {/* Speech bubble tail */}
      <div 
        className={cn(
          "absolute w-3 h-3 rotate-45",
          isPlayer 
            ? "bg-blue-600 border-b-2 border-r-2 border-blue-400 -bottom-1.5 left-1/2 -translate-x-1/2"
            : "bg-red-600 border-t-2 border-l-2 border-red-400 -top-1.5 left-1/2 -translate-x-1/2"
        )}
      />
    </div>
  );
}
