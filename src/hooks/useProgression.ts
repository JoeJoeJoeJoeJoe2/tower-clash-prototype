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

  const openChest = useCallback((starCount: number = 1): ChestReward | null => {
    if (progress.chestsAvailable <= 0) return null;

    const rewards: ChestReward = { cards: [], goldEarned: 0, stars: starCount };
    const unownedCards = allCards.filter(c => !progress.ownedCardIds.includes(c.id));
    
    // Base new card chance increases with stars: 30% base + 10% per star
    const newCardChance = 0.3 + (starCount * 0.1);
    
    // Banner chance increases with stars: 20% base + 15% per star
    const bannerChance = 0.2 + (starCount * 0.15);
    const bannerReward = getRandomBanner(progress.ownedBannerIds);
    if (bannerReward && Math.random() < bannerChance) {
      rewards.bannerId = bannerReward.id;
    }
    
    // Gold: 500-1125 range, stars increase the average
    // Base range: 500-625, each star adds up to 125 more
    const baseGold = 500;
    const maxExtraGold = 625; // 500 + 625 = 1125 max
    const starBonus = (starCount / 5) * maxExtraGold * 0.6; // Stars guarantee some extra gold
    const randomGold = Math.floor(Math.random() * (maxExtraGold - starBonus));
    rewards.goldEarned = Math.floor(baseGold + starBonus + randomGold);
    
    // Card count: 2-4 base, +1 for 3+ stars, +1 for 5 stars
    let cardCount = 2 + Math.floor(Math.random() * 3);
    if (starCount >= 3) cardCount++;
    if (starCount >= 5) cardCount++;
    
    // Filter cards by rarity based on stars
    const getAvailableCards = (owned: boolean) => {
      const pool = owned ? allCards.filter(c => progress.ownedCardIds.includes(c.id)) : unownedCards;
      if (starCount >= 4) {
        // 4+ stars: higher chance of epic/legendary
        const rarePool = pool.filter(c => c.rarity === 'epic' || c.rarity === 'legendary');
        if (rarePool.length > 0 && Math.random() < 0.5) return rarePool;
      }
      if (starCount >= 2) {
        // 2+ stars: higher chance of rare+
        const rarePool = pool.filter(c => c.rarity !== 'common');
        if (rarePool.length > 0 && Math.random() < 0.3 + starCount * 0.1) return rarePool;
      }
      return pool;
    };
    
    for (let i = 0; i < cardCount; i++) {
      const availableUnowned = getAvailableCards(false);
      if (availableUnowned.length > 0 && Math.random() < newCardChance) {
        const randomIndex = Math.floor(Math.random() * availableUnowned.length);
        const newCard = availableUnowned[randomIndex];
        rewards.cards.push({ cardId: newCard.id, isNew: true });
        // Remove from unownedCards to avoid duplicates
        const unownedIdx = unownedCards.findIndex(c => c.id === newCard.id);
        if (unownedIdx !== -1) unownedCards.splice(unownedIdx, 1);
      } else {
        // Give a duplicate of owned card (prefer rarer cards with more stars)
        const availableOwned = getAvailableCards(true);
        if (availableOwned.length > 0) {
          const ownedIndex = Math.floor(Math.random() * availableOwned.length);
          rewards.cards.push({ cardId: availableOwned[ownedIndex].id, isNew: false });
        } else {
          const ownedIndex = Math.floor(Math.random() * progress.ownedCardIds.length);
          rewards.cards.push({ cardId: progress.ownedCardIds[ownedIndex], isNew: false });
        }
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
