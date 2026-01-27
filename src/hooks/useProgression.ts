import { useState, useEffect, useCallback } from 'react';
import { PlayerProgress, ChestReward, DeckSlot } from '@/types/game';
import { allCards, starterCardIds } from '@/data/cards';

const STORAGE_KEY = 'clash-game-progress';

const defaultDeckSlots: DeckSlot[] = [
  { id: 'A', name: 'Deck A', cardIds: starterCardIds.slice(0, 8) },
  { id: 'B', name: 'Deck B', cardIds: [] },
  { id: 'C', name: 'Deck C', cardIds: [] }
];

const initialProgress: PlayerProgress = {
  ownedCardIds: [...starterCardIds],
  currentDeck: starterCardIds.slice(0, 8),
  deckSlots: defaultDeckSlots,
  activeDeckId: 'A',
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
        
        // Migration: add deck slots if missing
        if (!parsed.deckSlots) {
          parsed.deckSlots = defaultDeckSlots.map((slot, idx) => ({
            ...slot,
            cardIds: idx === 0 ? (parsed.currentDeck || starterCardIds.slice(0, 8)) : []
          }));
          parsed.activeDeckId = 'A';
        }
        
        // Ensure currentDeck syncs with active deck slot
        const activeSlot = parsed.deckSlots.find((s: DeckSlot) => s.id === parsed.activeDeckId);
        if (activeSlot && activeSlot.cardIds.length === 8) {
          parsed.currentDeck = activeSlot.cardIds;
        } else {
          // Fallback to starter deck if active slot is invalid
          const validDeck = (parsed.currentDeck || []).filter((id: string) => mergedOwned.includes(id));
          if (validDeck.length !== 8) {
            parsed.currentDeck = starterCardIds.slice(0, 8);
          } else {
            parsed.currentDeck = validDeck;
          }
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
    setProgress(prev => {
      const updatedSlots = prev.deckSlots.map(slot =>
        slot.id === prev.activeDeckId ? { ...slot, cardIds: newDeck } : slot
      );
      return {
        ...prev,
        currentDeck: newDeck,
        deckSlots: updatedSlots
      };
    });
  }, []);

  const setActiveDeck = useCallback((deckId: 'A' | 'B' | 'C') => {
    setProgress(prev => {
      const slot = prev.deckSlots.find(s => s.id === deckId);
      const newCurrentDeck = slot && slot.cardIds.length === 8 ? slot.cardIds : prev.currentDeck;
      return {
        ...prev,
        activeDeckId: deckId,
        currentDeck: newCurrentDeck
      };
    });
  }, []);

  const updateDeckSlot = useCallback((deckId: 'A' | 'B' | 'C', cardIds: string[]) => {
    setProgress(prev => {
      const updatedSlots = prev.deckSlots.map(slot =>
        slot.id === deckId ? { ...slot, cardIds } : slot
      );
      const isActiveDeck = prev.activeDeckId === deckId;
      return {
        ...prev,
        deckSlots: updatedSlots,
        currentDeck: isActiveDeck && cardIds.length === 8 ? cardIds : prev.currentDeck
      };
    });
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
    setActiveDeck,
    updateDeckSlot,
    recordWin,
    recordLoss,
    openChest,
    resetProgress
  };
}
