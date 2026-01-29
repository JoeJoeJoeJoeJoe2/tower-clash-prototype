import { useState, useCallback } from 'react';
import { ChestReward } from '@/types/game';
import { useProgression } from '@/hooks/useProgression';
import { useCardBalance } from '@/hooks/useCardBalance';
import { useAuth } from '@/hooks/useAuth';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { useBattleRequests } from '@/hooks/useBattleRequests';
import { getCardLevel } from '@/lib/cardLevels';
import { HomeNavigator } from './HomeNavigator';
import { LoadingScreen } from './LoadingScreen';
import { MatchmakingScreen } from './MatchmakingScreen';
import { GameUI } from './GameUI';
import { ChestReward as ChestRewardModal } from './ChestReward';
import { PlayerProfile } from './PlayerProfile';
import { AuthScreen } from './AuthScreen';
import { BattleRequestModal } from './BattleRequestModal';
import { getBannerById } from '@/data/banners';

// Convert cardCopies to cardLevels
function getCardLevelsFromCopies(cardCopies: Record<string, number>): Record<string, number> {
  const levels: Record<string, number> = {};
  for (const [cardId, copies] of Object.entries(cardCopies)) {
    levels[cardId] = getCardLevel(copies);
  }
  return levels;
}

// Convert towerCopies to towerLevels
function getTowerLevelsFromCopies(towerCopies: Record<string, number>): { princess: number; king: number } {
  return {
    princess: getCardLevel(towerCopies.princess || 1),
    king: getCardLevel(towerCopies.king || 1)
  };
}

type Screen = 'auth' | 'home' | 'loading' | 'matchmaking' | 'battle';

export function GameScreen() {
  const [screen, setScreen] = useState<Screen>('home');
  const [showChestModal, setShowChestModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isFriendlyBattle, setIsFriendlyBattle] = useState(false);
  
  // Auth and multiplayer hooks
  const { user, loading: authLoading, signOut } = useAuth();
  
  const { 
    progress, 
    updateDeck, 
    updateDeckSlot,
    setActiveDeck,
    addDeckSlot,
    recordWin, 
    recordLoss, 
    openChest, 
    updatePlayerName,
    updateBanner,
    resetProgress,
    spendGold,
    addCard
  } = useProgression();
  
  const playerLevel = Math.max(1, Math.floor(progress.wins / 5) + 1);
  const trophies = progress.wins * 30;
  
  // Online presence - only active when authenticated
  const { onlinePlayers } = useOnlinePresence(
    user,
    progress.playerName,
    progress.bannerId,
    trophies,
    playerLevel
  );
  
  // Battle requests
  const {
    incomingRequests,
    outgoingRequests,
    acceptedBattle,
    sendBattleRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    clearAcceptedBattle
  } = useBattleRequests(user, progress.playerName);
  
  const {
    balanceState,
    trackDamage,
    processGameEnd,
    getBalancedCardStats,
    resetBalance
  } = useCardBalance();
  
  // Convert balance state to CardBalanceInfo array for DeckBuilder
  const cardBalanceInfo = balanceState.performances.map(p => ({
    cardId: p.cardId,
    nerfLevel: p.nerfLevel,
    winStreak: p.winStreak,
    lastNerfedStat: p.lastNerfedStat
  }));

  const handleGameEnd = (result: 'win' | 'loss' | 'draw') => {
    // Process card balance (track MVP and apply nerfs)
    const mvpCard = processGameEnd(result === 'win', progress.currentDeck);
    if (mvpCard) {
      console.log(`🏆 Game MVP: ${mvpCard}`);
    }
    
    // For friendly battles, don't record wins/losses
    if (!isFriendlyBattle) {
      if (result === 'win') {
        recordWin();
      } else if (result === 'loss') {
        recordLoss();
      }
    }
    
    setIsFriendlyBattle(false);
    setScreen('home');
  };

  const handleOpenChest = () => {
    if (progress.chestsAvailable > 0) {
      setShowChestModal(true);
    }
  };

  const handleGenerateReward = useCallback((stars: number): ChestReward | null => {
    return openChest(stars);
  }, [openChest]);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetProgress();
    }
  };

  const handleStartFriendlyBattle = () => {
    setIsFriendlyBattle(true);
    clearAcceptedBattle();
    setScreen('loading');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Show auth screen if user wants to sign in
  if (screen === 'auth') {
    return <AuthScreen onSuccess={() => setScreen('home')} />;
  }

  return (
    <>
      {/* Battle Request Modal */}
      {acceptedBattle && (
        <BattleRequestModal
          battle={acceptedBattle}
          isChallenger={acceptedBattle.from_user_id === user?.id}
          onStartBattle={handleStartFriendlyBattle}
        />
      )}

      {screen === 'home' && (
        <HomeNavigator
          progress={progress}
          onBattle={() => setScreen('loading')}
          onOpenChest={handleOpenChest}
          onReset={handleReset}
          onOpenProfile={() => setShowProfile(true)}
          onSaveDeck={(deckId, cardIds) => updateDeckSlot(deckId, cardIds)}
          onSetActiveDeck={setActiveDeck}
          onAddDeck={addDeckSlot}
          cardBalanceInfo={cardBalanceInfo}
          onSpendGold={spendGold}
          onAddCard={addCard}
          // Multiplayer props
          user={user}
          onlinePlayers={onlinePlayers}
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          onSendRequest={sendBattleRequest}
          onAcceptRequest={acceptRequest}
          onDeclineRequest={declineRequest}
          onCancelRequest={cancelRequest}
          onSignOut={handleSignOut}
          onSignIn={() => setScreen('auth')}
        />
      )}

      {screen === 'loading' && (
        <LoadingScreen onComplete={() => setScreen('matchmaking')} />
      )}

      {screen === 'matchmaking' && (
        <MatchmakingScreen
          progress={progress}
          onReady={() => setScreen('battle')}
          isFriendlyBattle={isFriendlyBattle}
        />
      )}

      {screen === 'battle' && (
        <GameUI
          playerDeck={progress.currentDeck}
          cardLevels={getCardLevelsFromCopies(progress.cardCopies)}
          towerLevels={getTowerLevelsFromCopies(progress.towerCopies)}
          playerName={progress.playerName}
          playerBannerEmoji={getBannerById(progress.bannerId)?.emoji || '🛡️'}
          playerLevel={playerLevel}
          onGameEnd={handleGameEnd}
          onBack={() => setScreen('home')}
          onTrackDamage={trackDamage}
          getBalancedCardStats={getBalancedCardStats}
          isFriendlyBattle={isFriendlyBattle}
        />
      )}

      {showChestModal && (
        <ChestRewardModal
          onGenerateReward={handleGenerateReward}
          onClose={() => setShowChestModal(false)}
        />
      )}

      <PlayerProfile
        open={showProfile}
        onOpenChange={setShowProfile}
        progress={progress}
        onUpdateName={updatePlayerName}
        onUpdateBanner={updateBanner}
      />
    </>
  );
}
