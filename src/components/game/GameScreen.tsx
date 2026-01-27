import { useState } from 'react';
import { ChestReward } from '@/types/game';
import { useProgression } from '@/hooks/useProgression';
import { MainMenu } from './MainMenu';
import { DeckBuilder } from './DeckBuilder';
import { GameUI } from './GameUI';
import { ChestReward as ChestRewardModal } from './ChestReward';

type Screen = 'menu' | 'deck-builder' | 'battle';

export function GameScreen() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [chestReward, setChestReward] = useState<ChestReward | null>(null);
  const { progress, updateDeck, recordWin, recordLoss, openChest, resetProgress } = useProgression();

  const handleGameEnd = (result: 'win' | 'loss' | 'draw') => {
    if (result === 'win') {
      recordWin();
    } else if (result === 'loss') {
      recordLoss();
    }
    setScreen('menu');
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
      {screen === 'menu' && (
        <MainMenu
          progress={progress}
          onBattle={() => setScreen('battle')}
          onDeckBuilder={() => setScreen('deck-builder')}
          onOpenChest={handleOpenChest}
          onReset={handleReset}
        />
      )}

      {screen === 'deck-builder' && (
        <DeckBuilder
          ownedCardIds={progress.ownedCardIds}
          currentDeck={progress.currentDeck}
          onSaveDeck={(deck) => {
            updateDeck(deck);
          }}
          onStartBattle={() => setScreen('battle')}
        />
      )}

      {screen === 'battle' && (
        <GameUI
          playerDeck={progress.currentDeck}
          onGameEnd={handleGameEnd}
          onBack={() => setScreen('menu')}
        />
      )}

      {chestReward && (
        <ChestRewardModal
          reward={chestReward}
          onClose={() => setChestReward(null)}
        />
      )}
    </>
  );
}
