import { useState, useEffect, useCallback } from 'react';
import { PlayerProgress, ChestReward, DeckSlot } from '@/types/game';
import { allCards, starterCardIds } from '@/data/cards';
import { starterBannerIds, getRandomBanner } from '@/data/banners';

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
  chestsAvailable: 0,
  lastFreeChestDate: null,
  // Player profile defaults
  playerName: 'Player',
  bannerId: 'banner-blue',
  ownedBannerIds: [...starterBannerIds],
  gold: 100 // Starting gold
};

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function canClaimFreeChest(lastDate: string | null): boolean {
  if (!lastDate) return true;
  return lastDate !== getTodayDateString();
}

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
        
        // Migration: add lastFreeChestDate if missing
        if (parsed.lastFreeChestDate === undefined) {
          parsed.lastFreeChestDate = null;
        }
        
        // Migration: add player profile fields if missing
        if (!parsed.playerName) {
          parsed.playerName = 'Player';
        }
        if (!parsed.bannerId) {
          parsed.bannerId = 'banner-blue';
        }
        if (!parsed.ownedBannerIds) {
          parsed.ownedBannerIds = [...starterBannerIds];
        }
        
        // Migration: add gold if missing
        if (parsed.gold === undefined) {
          parsed.gold = 100;
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
        
        // Check and grant daily free chest
        if (canClaimFreeChest(parsed.lastFreeChestDate)) {
          parsed.chestsAvailable = (parsed.chestsAvailable || 0) + 1;
          parsed.lastFreeChestDate = getTodayDateString();
        }
        
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
    
    // For new players, give them the first free chest
    return {
      ...initialProgress,
      chestsAvailable: 1,
      lastFreeChestDate: getTodayDateString()
    };
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

  const setActiveDeck = useCallback((deckId: string) => {
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

  const updateDeckSlot = useCallback((deckId: string, cardIds: string[]) => {
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

  const addDeckSlot = useCallback(() => {
    setProgress(prev => {
      const nextId = String(prev.deckSlots.length + 1);
      const newSlot: DeckSlot = {
        id: nextId,
        name: `Deck ${nextId}`,
        cardIds: []
      };
      return {
        ...prev,
        deckSlots: [...prev.deckSlots, newSlot]
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

    const rewards: ChestReward = { cards: [], goldEarned: 0 };
    const unownedCards = allCards.filter(c => !progress.ownedCardIds.includes(c.id));
    
    // 20% chance to unlock a new banner
    const bannerReward = getRandomBanner(progress.ownedBannerIds);
    if (bannerReward && Math.random() < 0.2) {
      rewards.bannerId = bannerReward.id;
    }
    
    // Give 50-150 gold from chest
    rewards.goldEarned = 50 + Math.floor(Math.random() * 101);
    
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

    // Update progress with new cards, banner, and gold
    const newOwnedIds = [...progress.ownedCardIds];
    rewards.cards.forEach(reward => {
      if (reward.isNew && !newOwnedIds.includes(reward.cardId)) {
        newOwnedIds.push(reward.cardId);
      }
    });
    
    const newOwnedBanners = [...progress.ownedBannerIds];
    if (rewards.bannerId && !newOwnedBanners.includes(rewards.bannerId)) {
      newOwnedBanners.push(rewards.bannerId);
    }

    setProgress(prev => ({
      ...prev,
      ownedCardIds: newOwnedIds,
      ownedBannerIds: newOwnedBanners,
      gold: prev.gold + (rewards.goldEarned || 0),
      chestsAvailable: prev.chestsAvailable - 1
    }));

    return rewards;
  }, [progress]);

  const updatePlayerName = useCallback((name: string) => {
    setProgress(prev => ({
      ...prev,
      playerName: name
    }));
  }, []);

  const updateBanner = useCallback((bannerId: string) => {
    setProgress(prev => ({
      ...prev,
      bannerId
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(initialProgress);
  }, []);

  const addGold = useCallback((amount: number) => {
    setProgress(prev => ({
      ...prev,
      gold: prev.gold + amount
    }));
  }, []);

  const spendGold = useCallback((amount: number): boolean => {
    if (progress.gold < amount) return false;
    setProgress(prev => ({
      ...prev,
      gold: prev.gold - amount
    }));
    return true;
  }, [progress.gold]);

  const addCard = useCallback((cardId: string) => {
    setProgress(prev => {
      if (prev.ownedCardIds.includes(cardId)) return prev;
      return {
        ...prev,
        ownedCardIds: [...prev.ownedCardIds, cardId]
      };
    });
  }, []);

  return {
    progress,
    updateDeck,
    setActiveDeck,
    updateDeckSlot,
    addDeckSlot,
    recordWin,
    recordLoss,
    openChest,
    updatePlayerName,
    updateBanner,
    resetProgress,
    addGold,
    spendGold,
    addCard
  };
}
