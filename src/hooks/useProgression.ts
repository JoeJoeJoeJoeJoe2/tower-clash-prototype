import { useState, useEffect, useCallback } from 'react';
import { PlayerProgress, ChestReward } from '@/types/game';
import { allCards, starterCardIds } from '@/data/cards';

const STORAGE_KEY = 'clash-game-progress';

const initialProgress: PlayerProgress = {
  ownedCardIds: [...starterCardIds],
  currentDeck: starterCardIds.slice(0, 8),
  wins: 0,
  losses: 0,
  chestsAvailable: 0
};

export function useProgression() {
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Merge starter cards with any existing owned cards to ensure all 8 starters exist
        const existingOwned = parsed.ownedCardIds || [];
        const mergedOwned = [...new Set([...starterCardIds, ...existingOwned])];
        parsed.ownedCardIds = mergedOwned;
        
        // Ensure deck has 8 valid cards from owned cards
        const validDeck = (parsed.currentDeck || []).filter((id: string) => mergedOwned.includes(id));
        if (validDeck.length !== 8) {
          parsed.currentDeck = starterCardIds.slice(0, 8);
        } else {
          parsed.currentDeck = validDeck;
        }
        
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
    return initialProgress;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [progress]);

  const updateDeck = useCallback((newDeck: string[]) => {
    if (newDeck.length !== 8) return;
    setProgress(prev => ({
      ...prev,
      currentDeck: newDeck
    }));
  }, []);

  const recordWin = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      wins: prev.wins + 1,
      chestsAvailable: prev.chestsAvailable + 1
    }));
  }, []);

  const recordLoss = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      losses: prev.losses + 1
    }));
  }, []);

  const openChest = useCallback((): ChestReward | null => {
    if (progress.chestsAvailable <= 0) return null;

    const rewards: ChestReward = { cards: [] };
    const unownedCards = allCards.filter(c => !progress.ownedCardIds.includes(c.id));
    
    // Give 2-4 random cards
    const cardCount = 2 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < cardCount; i++) {
      // 30% chance to unlock a new card if any available
      if (unownedCards.length > 0 && Math.random() < 0.3) {
        const randomIndex = Math.floor(Math.random() * unownedCards.length);
        const newCard = unownedCards[randomIndex];
        rewards.cards.push({ cardId: newCard.id, isNew: true });
        unownedCards.splice(randomIndex, 1);
      } else {
        // Give a duplicate of owned card
        const ownedIndex = Math.floor(Math.random() * progress.ownedCardIds.length);
        rewards.cards.push({ cardId: progress.ownedCardIds[ownedIndex], isNew: false });
      }
    }

    // Update progress with new cards
    const newOwnedIds = [...progress.ownedCardIds];
    rewards.cards.forEach(reward => {
      if (reward.isNew && !newOwnedIds.includes(reward.cardId)) {
        newOwnedIds.push(reward.cardId);
      }
    });

    setProgress(prev => ({
      ...prev,
      ownedCardIds: newOwnedIds,
      chestsAvailable: prev.chestsAvailable - 1
    }));

    return rewards;
  }, [progress]);

  const resetProgress = useCallback(() => {
    setProgress(initialProgress);
  }, []);

  return {
    progress,
    updateDeck,
    recordWin,
    recordLoss,
    openChest,
    resetProgress
  };
}
