import { useState } from 'react';
import { ChestReward } from '@/types/game';
import { useProgression } from '@/hooks/useProgression';
import { HomeNavigator } from './HomeNavigator';
import { GameUI } from './GameUI';
import { ChestReward as ChestRewardModal } from './ChestReward';
import { PlayerProfile } from './PlayerProfile';

type Screen = 'home' | 'battle';

export function GameScreen() {
  const [screen, setScreen] = useState<Screen>('home');
  const [chestReward, setChestReward] = useState<ChestReward | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const { 
    progress, 
    updateDeck, 
    updateDeckSlot,
    setActiveDeck,
    recordWin, 
    recordLoss, 
    openChest, 
    updatePlayerName,
    updateBanner,
    resetProgress 
  } = useProgression();

  const handleGameEnd = (result: 'win' | 'loss' | 'draw') => {
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
          onBattle={() => setScreen('battle')}
          onOpenChest={handleOpenChest}
          onReset={handleReset}
          onOpenProfile={() => setShowProfile(true)}
          onSaveDeck={(deckId, cardIds) => updateDeckSlot(deckId as 'A' | 'B' | 'C', cardIds)}
          onSetActiveDeck={setActiveDeck}
        />
      )}

      {screen === 'battle' && (
        <GameUI
          playerDeck={progress.currentDeck}
          onGameEnd={handleGameEnd}
          onBack={() => setScreen('home')}
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
