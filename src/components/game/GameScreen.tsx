import { useState } from 'react';
import { ChestReward } from '@/types/game';
import { useProgression } from '@/hooks/useProgression';
import { useCardBalance } from '@/hooks/useCardBalance';
import { HomeNavigator } from './HomeNavigator';
import { LoadingScreen } from './LoadingScreen';
import { MatchmakingScreen } from './MatchmakingScreen';
import { GameUI } from './GameUI';
import { ChestReward as ChestRewardModal } from './ChestReward';
import { PlayerProfile } from './PlayerProfile';

type Screen = 'home' | 'loading' | 'matchmaking' | 'battle';

export function GameScreen() {
  const [screen, setScreen] = useState<Screen>('home');
  const [chestReward, setChestReward] = useState<ChestReward | null>(null);
  const [showProfile, setShowProfile] = useState(false);
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
    resetProgress 
  } = useProgression();
  
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
    
    if (result === 'win') {
      recordWin();
    } else if (result === 'loss') {
      recordLoss();
    }
    setScreen('home');
  };

  const handleOpenChest = () => {
    const reward = openChest();
    if (reward) {
      setChestReward(reward);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetProgress();
    }
  };

  return (
    <>
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
        />
      )}

      {screen === 'loading' && (
        <LoadingScreen onComplete={() => setScreen('matchmaking')} />
      )}

      {screen === 'matchmaking' && (
        <MatchmakingScreen
          progress={progress}
          onReady={() => setScreen('battle')}
        />
      )}

      {screen === 'battle' && (
        <GameUI
          playerDeck={progress.currentDeck}
          onGameEnd={handleGameEnd}
          onBack={() => setScreen('home')}
          onTrackDamage={trackDamage}
          getBalancedCardStats={getBalancedCardStats}
        />
      )}

      {chestReward && (
        <ChestRewardModal
          reward={chestReward}
          onClose={() => setChestReward(null)}
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
