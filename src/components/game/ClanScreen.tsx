import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Crown, Shield, MessageSquare, Send, Trophy, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@supabase/supabase-js';
import { OnlinePlayer } from '@/hooks/useOnlinePresence';
import { BattleRequest } from '@/hooks/useBattleRequests';
import { OnlinePlayersPanel } from './OnlinePlayersPanel';
import { useChat } from '@/hooks/useChat';

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
  onSignIn: () => void;
}

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
  onSignOut,
  onSignIn
}: ClanScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('online');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages: chatMessages, loading: chatLoading, sendMessage } = useChat(user);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !user) return;
    
    setSending(true);
    const success = await sendMessage(newMessage, playerName);
    if (success) {
      setNewMessage('');
    }
    setSending(false);
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
              <div className="text-center py-8 px-4">
                <WifiOff className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-white text-xl font-bold mb-3">Sign in to play with friends!</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                  Create an account to see online players and challenge them to friendly battles!
                </p>
                
                {/* Sign In Button */}
                <Button
                  onClick={onSignIn}
                  className="w-full max-w-xs mx-auto mb-6 h-12 text-lg font-bold bg-gradient-to-b from-green-500 via-green-600 to-green-700 hover:from-green-400 hover:via-green-500 hover:to-green-600 border-b-4 border-green-900"
                >
                  Sign In / Create Account
                </Button>
                
                {/* How it works section */}
                <div className="bg-gray-800/50 rounded-xl p-4 max-w-sm mx-auto text-left border border-gray-700/50">
                  <h4 className="text-cyan-400 font-semibold mb-3 text-center">📋 How to Play with Friends</h4>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">1</span>
                      <span className="text-gray-300">
                        <strong className="text-white">Create an account</strong> using your email and a password (minimum 6 characters)
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">2</span>
                      <span className="text-gray-300">
                        <strong className="text-white">Find your friend</strong> in the online players list
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">3</span>
                      <span className="text-gray-300">
                        <strong className="text-white">Send a battle request</strong> by tapping the ⚔️ button next to their name
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">4</span>
                      <span className="text-gray-300">
                        <strong className="text-white">Wait for them to accept</strong> and the battle will begin!
                      </span>
                    </li>
                  </ol>
                  <p className="text-gray-500 text-xs mt-4 text-center">
                    💡 Tip: Both players need to be signed in and online at the same time!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {!user ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">Sign in to chat with other players!</p>
                  <Button
                    onClick={onSignIn}
                    className="mt-4 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600"
                  >
                    Sign In
                  </Button>
                </div>
              ) : chatLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">No messages yet. Be the first to say something!</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "rounded-lg p-2",
                      msg.user_id === user?.id 
                        ? "bg-cyan-900/30 border border-cyan-600/30" 
                        : "bg-gray-800/50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "font-semibold text-sm",
                        msg.user_id === user?.id ? "text-cyan-300" : "text-cyan-400"
                      )}>
                        {msg.player_name}
                        {msg.user_id === user?.id && " (you)"}
                      </span>
                      <span className="text-gray-600 text-xs">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white text-sm">{msg.message}</p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {user && (
              <div className="p-3 bg-[#0a1525] border-t border-cyan-900/40">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={sending}
                    className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 disabled:opacity-50"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={sending || !newMessage.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            )}
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
