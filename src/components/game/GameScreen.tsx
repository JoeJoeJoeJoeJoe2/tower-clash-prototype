import { useState, useCallback } from 'react';
import { ChestReward } from '@/types/game';
import { useProgression } from '@/hooks/useProgression';
import { useCardBalance } from '@/hooks/useCardBalance';
import { getCardLevel } from '@/lib/cardLevels';
import { HomeNavigator } from './HomeNavigator';
import { LoadingScreen } from './LoadingScreen';
import { MatchmakingScreen } from './MatchmakingScreen';
import { GameUI } from './GameUI';
import { ChestReward as ChestRewardModal } from './ChestReward';
import { PlayerProfile } from './PlayerProfile';

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

type Screen = 'home' | 'loading' | 'matchmaking' | 'battle';

export function GameScreen() {
  const [screen, setScreen] = useState<Screen>('home');
  const [showChestModal, setShowChestModal] = useState(false);
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
    resetProgress,
    spendGold,
    addCard
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
          onSpendGold={spendGold}
          onAddCard={addCard}
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
          cardLevels={getCardLevelsFromCopies(progress.cardCopies)}
          towerLevels={getTowerLevelsFromCopies(progress.towerCopies)}
          onGameEnd={handleGameEnd}
          onBack={() => setScreen('home')}
          onTrackDamage={trackDamage}
          getBalancedCardStats={getBalancedCardStats}
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
