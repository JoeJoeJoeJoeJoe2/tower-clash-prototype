import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Users, Crown, Shield, MessageSquare, Send, Trophy, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@supabase/supabase-js';
import { OnlinePlayer } from '@/hooks/useOnlinePresence';
import { BattleRequest } from '@/hooks/useBattleRequests';
import { OnlinePlayersPanel } from './OnlinePlayersPanel';

interface ClanScreenProps {
  playerName: string;
  trophies: number;
  onBack: () => void;
  // Multiplayer props
  user: User | null;
  onlinePlayers: OnlinePlayer[];
  incomingRequests: BattleRequest[];
  outgoingRequests: BattleRequest[];
  onSendRequest: (userId: string, playerName: string) => Promise<boolean>;
  onAcceptRequest: (requestId: string) => Promise<boolean>;
  onDeclineRequest: (requestId: string) => Promise<boolean>;
  onCancelRequest: (requestId: string) => Promise<boolean>;
  onSignOut: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

const mockChatMessages: ChatMessage[] = [
  { id: '1', sender: 'DragonSlayer', message: 'Good game everyone! 🎮', timestamp: new Date(Date.now() - 300000) },
  { id: '2', sender: 'ShadowKnight', message: 'Anyone want to practice?', timestamp: new Date(Date.now() - 180000) },
  { id: '3', sender: 'System', message: 'IceQueen joined the clan!', timestamp: new Date(Date.now() - 60000), isSystem: true },
];

type Tab = 'online' | 'chat' | 'members';

export function ClanScreen({ 
  playerName, 
  trophies, 
  onBack,
  user,
  onlinePlayers,
  incomingRequests,
  outgoingRequests,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onCancelRequest,
  onSignOut
}: ClanScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('online');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: playerName,
      message: newMessage.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a3a5c] via-[#0d2840] to-[#0a1f33] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0d1b2a] to-[#152238] px-3 py-2 border-b border-cyan-900/50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Social</h1>
            <div className="flex items-center gap-2 text-xs">
              {user ? (
                <>
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">Online</span>
                  <span className="text-gray-500">•</span>
                  <button 
                    onClick={onSignOut}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-500">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          {(['online', 'chat', 'members'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all capitalize relative",
                activeTab === tab
                  ? "bg-cyan-600/40 text-cyan-300 border border-cyan-500/50"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {tab === 'online' && <Wifi className="w-4 h-4 inline mr-1" />}
              {tab === 'chat' && <MessageSquare className="w-4 h-4 inline mr-1" />}
              {tab === 'members' && <Users className="w-4 h-4 inline mr-1" />}
              {tab === 'online' ? 'Players' : tab}
              {tab === 'online' && incomingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-bounce">
                  {incomingRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'online' && (
          <div className="flex-1 overflow-y-auto p-3">
            {user ? (
              <OnlinePlayersPanel
                onlinePlayers={onlinePlayers}
                incomingRequests={incomingRequests}
                outgoingRequests={outgoingRequests}
                onSendRequest={onSendRequest}
                onAcceptRequest={onAcceptRequest}
                onDeclineRequest={onDeclineRequest}
                onCancelRequest={onCancelRequest}
              />
            ) : (
              <div className="text-center py-12">
                <WifiOff className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <h3 className="text-white font-semibold mb-2">Sign in to play with friends</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Create an account to see online players and send battle requests!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "rounded-lg p-2",
                    msg.isSystem 
                      ? "bg-yellow-900/30 border border-yellow-600/30 text-center" 
                      : "bg-gray-800/50"
                  )}
                >
                  {msg.isSystem ? (
                    <p className="text-yellow-300 text-sm">{msg.message}</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-cyan-400 font-semibold text-sm">{msg.sender}</span>
                        <span className="text-gray-600 text-xs">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-white text-sm">{msg.message}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-3 bg-[#0a1525] border-t border-cyan-900/40">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                />
                <Button onClick={handleSendMessage} className="bg-cyan-600 hover:bg-cyan-500">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'members' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Show player as the only member for now */}
            <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
              <div className="text-gray-500 font-bold w-6 text-center">1</div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-green-600">
                {Math.min(14, Math.floor(trophies / 150) + 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-yellow-400">{playerName}</span>
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> {trophies.toLocaleString()}
                </p>
              </div>
            </div>
            
            <p className="text-gray-500 text-center py-4 text-sm">
              Invite friends to join your clan!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
