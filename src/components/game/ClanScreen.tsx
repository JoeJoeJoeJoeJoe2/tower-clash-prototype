import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Users, Crown, Shield, MessageSquare, Send, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClanScreenProps {
  playerName: string;
  trophies: number;
  onBack: () => void;
}

interface ClanMember {
  id: string;
  name: string;
  role: 'leader' | 'co-leader' | 'elder' | 'member';
  trophies: number;
  level: number;
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

// No mock members - clan starts empty until real multiplayer is implemented

const mockChatMessages: ChatMessage[] = [
  { id: '1', sender: 'DragonSlayer', message: 'Good game everyone! 🎮', timestamp: new Date(Date.now() - 300000) },
  { id: '2', sender: 'ShadowKnight', message: 'Anyone want to practice?', timestamp: new Date(Date.now() - 180000) },
  { id: '3', sender: 'System', message: 'IceQueen joined the clan!', timestamp: new Date(Date.now() - 60000), isSystem: true },
];

type Tab = 'chat' | 'members' | 'search';

export function ClanScreen({ playerName, trophies, onBack }: ClanScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isInClan, setIsInClan] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const getRoleIcon = (role: ClanMember['role']) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'co-leader': return <Shield className="w-4 h-4 text-purple-400" />;
      case 'elder': return <Shield className="w-4 h-4 text-blue-400" />;
      default: return null;
    }
  };

  const getRoleColor = (role: ClanMember['role']) => {
    switch (role) {
      case 'leader': return 'text-yellow-400';
      case 'co-leader': return 'text-purple-400';
      case 'elder': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (!isInClan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a3a5c] via-[#0d2840] to-[#0a1f33] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#0d1b2a] to-[#152238] px-3 py-3 flex items-center gap-3 border-b border-cyan-900/50">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Find a Clan</h1>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search clans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Create Clan Button */}
        <div className="px-4 mb-4">
          <Button 
            className="w-full bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600"
            onClick={() => setIsInClan(true)}
          >
            <Users className="w-5 h-5 mr-2" />
            Create New Clan
          </Button>
        </div>

        {/* Suggested Clans */}
        <div className="flex-1 px-4">
          <h2 className="text-gray-400 text-sm font-semibold mb-3">SUGGESTED CLANS</h2>
          <div className="space-y-2">
            {['League of Cards', 'Royal Warriors', 'Epic Fighters'].map((clan, idx) => (
              <button
                key={clan}
                onClick={() => setIsInClan(true)}
                className="w-full bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-600/30 rounded-lg p-3 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold">{clan}</p>
                  <p className="text-gray-400 text-sm">{40 + idx * 5}/50 members • {4000 + idx * 500} 🏆</p>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-500">Join</Button>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-lg font-bold text-white">League of Cards</h1>
            <p className="text-gray-400 text-xs flex items-center gap-1">
              <Trophy className="w-3 h-3" /> 23,500 • 45/50 members
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          {(['chat', 'members', 'search'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all capitalize",
                activeTab === tab
                  ? "bg-cyan-600/40 text-cyan-300 border border-cyan-500/50"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {tab === 'chat' && <MessageSquare className="w-4 h-4 inline mr-1" />}
              {tab === 'members' && <Users className="w-4 h-4 inline mr-1" />}
              {tab === 'search' && <Search className="w-4 h-4 inline mr-1" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
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

        {activeTab === 'search' && (
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search for players..."
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500"
              />
            </div>
            <p className="text-gray-500 text-center py-8">Search for players to invite to your clan</p>
          </div>
        )}
      </div>
    </div>
  );
}
