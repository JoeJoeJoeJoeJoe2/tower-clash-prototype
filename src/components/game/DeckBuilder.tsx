import { useState, useEffect, useRef } from 'react';
import { CardDefinition, DeckSlot } from '@/types/game';
import { allCards } from '@/data/cards';
import { GameCard } from './GameCard';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Swords, Check, X, Info, ArrowLeft, Plus, TrendingDown } from 'lucide-react';

export interface CardBalanceInfo {
  cardId: string;
  nerfLevel: number;
  winStreak: number;
  lastNerfedStat: 'damage' | 'speed' | 'health' | 'attackSpeed' | null;
}

interface DeckBuilderProps {
  ownedCardIds: string[];
  deckSlots: DeckSlot[];
  activeDeckId: string;
  onSaveDeck: (deckId: string, cardIds: string[]) => void;
  onSetActiveDeck: (deckId: string) => void;
  onAddDeck: () => void;
  onStartBattle: () => void;
  onBack: () => void;
  cardBalanceInfo?: CardBalanceInfo[];
}

export function DeckBuilder({ 
  ownedCardIds, 
  deckSlots, 
  activeDeckId,
  onSaveDeck, 
  onSetActiveDeck,
  onAddDeck,
  onStartBattle,
  onBack,
  cardBalanceInfo = []
}: DeckBuilderProps) {
  const [editingDeckId, setEditingDeckId] = useState<string>(activeDeckId);
  const currentSlot = deckSlots.find(s => s.id === editingDeckId);
  const [selectedDeck, setSelectedDeck] = useState<string[]>(currentSlot?.cardIds || []);
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      
      const scrollAmount = 100;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        containerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        containerRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync when switching deck tabs
  useEffect(() => {
    const slot = deckSlots.find(s => s.id === editingDeckId);
    setSelectedDeck(slot?.cardIds || []);
  }, [editingDeckId, deckSlots]);

  const ownedCards = allCards.filter(c => ownedCardIds.includes(c.id));
  const deckCards = selectedDeck.map(id => allCards.find(c => c.id === id)!).filter(Boolean);

  // Get balance info for a card
  const getBalanceInfo = (cardId: string): CardBalanceInfo | undefined => {
    return cardBalanceInfo.find(b => b.cardId === cardId);
  };

  const toggleCard = (cardId: string) => {
    if (selectedDeck.includes(cardId)) {
      setSelectedDeck(prev => prev.filter(id => id !== cardId));
    } else if (selectedDeck.length < 8) {
      setSelectedDeck(prev => [...prev, cardId]);
    }
    // If deck is full and card not in deck, do nothing (block add)
  };

  const handleSave = () => {
    if (selectedDeck.length === 8) {
      onSaveDeck(editingDeckId, selectedDeck);
    }
  };

  const handleSetActive = () => {
    if (selectedDeck.length === 8) {
      onSaveDeck(editingDeckId, selectedDeck);
      onSetActiveDeck(editingDeckId);
    }
  };

  const avgElixir = deckCards.length > 0 
    ? (deckCards.reduce((sum, c) => sum + c.elixirCost, 0) / deckCards.length).toFixed(1)
    : '0.0';

  const isActiveDeck = activeDeckId === editingDeckId;
  const canBattle = deckSlots.find(s => s.id === activeDeckId)?.cardIds.length === 8;

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-auto bg-background flex flex-col items-center p-4 gap-4 pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 text-center">
          <h1 className="game-title text-3xl text-primary">Battle Decks</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Deck Tabs */}
      <ScrollArea className="w-full max-w-md">
        <div className="flex gap-2 pb-2">
          {deckSlots.map(slot => {
            const isComplete = slot.cardIds.length === 8;
            const isEditing = editingDeckId === slot.id;
            const isActive = activeDeckId === slot.id;
            
            return (
              <button
                key={slot.id}
                onClick={() => setEditingDeckId(slot.id)}
                className={cn(
                  'min-w-[80px] py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium flex-shrink-0',
                  isEditing 
                    ? 'border-primary bg-primary/20 text-primary' 
                    : 'border-border bg-card/50 text-muted-foreground hover:bg-card',
                  isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{slot.name}</span>
                  <span className={cn(
                    'text-[10px]',
                    isComplete ? 'text-green-400' : 'text-muted-foreground'
                  )}>
                    {isComplete ? '✓ Ready' : `${slot.cardIds.length}/8`}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-primary font-bold">ACTIVE</span>
                  )}
                </div>
              </button>
            );
          })}
          <button
            onClick={onAddDeck}
            className="min-w-[60px] py-2 px-3 rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card/30 text-muted-foreground hover:bg-card hover:border-primary hover:text-primary transition-all flex-shrink-0"
          >
            <div className="flex flex-col items-center gap-1">
              <Plus className="w-4 h-4" />
              <span className="text-[10px]">Add</span>
            </div>
          </button>
        </div>
      </ScrollArea>

      {/* Current Deck */}
      <div className="bg-card/50 rounded-xl p-4 border border-border w-full max-w-md">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">Deck {editingDeckId} ({selectedDeck.length}/8)</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Avg: ⚡{avgElixir}</span>
            {selectedDeck.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setSelectedDeck([])}
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 min-h-[200px]">
          {[...Array(8)].map((_, idx) => {
            const card = deckCards[idx];
            return (
              <div 
                key={idx}
                className={cn(
                  'rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center p-1',
                  !card && 'bg-muted/20 aspect-[3/4]'
                )}
              >
                {card ? (
                  <div className="relative flex flex-col items-center">
                    <GameCard 
                      card={card} 
                      size="small"
                      onClick={() => toggleCard(card.id)}
                    />
                    <button
                      onClick={() => toggleCard(card.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {/* Nerf indicator on deck cards */}
                    {(() => {
                      const balance = getBalanceInfo(card.id);
                      if (balance && balance.nerfLevel > 0) {
                        return (
                          <div className="absolute -top-1 -left-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center" title={`Nerfed ${balance.nerfLevel}x`}>
                            <TrendingDown className="w-2.5 h-2.5 text-white" />
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="mt-1 text-center w-full">
                      <div className="text-[8px] text-muted-foreground flex justify-center gap-1">
                        <span>❤️{card.health}</span>
                        <span>⚔️{card.damage}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-2xl">+</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Collection - Now fully visible, no internal scroll */}
      <div className="bg-card/30 rounded-xl p-4 border border-border w-full max-w-md">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">Your Cards ({ownedCards.length})</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2 p-1">
          {ownedCards.map(card => {
            const inDeck = selectedDeck.includes(card.id);
            const balance = getBalanceInfo(card.id);
            const isNerfed = balance && balance.nerfLevel > 0;
            
            return (
              <button 
                key={card.id}
                type="button"
                className="relative cursor-pointer bg-transparent border-none p-0"
                onMouseEnter={() => setSelectedCard(card)}
                onMouseLeave={() => setSelectedCard(null)}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleCard(card.id);
                }}
              >
                <GameCard 
                  card={card} 
                  size="small"
                  isSelected={inDeck}
                />
                {/* Check mark for cards in deck */}
                {inDeck && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center z-10">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                {/* Nerf indicator */}
                {isNerfed && (
                  <div 
                    className="absolute top-0 left-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 z-10 shadow-lg"
                    title={`Stats reduced by ${balance.nerfLevel * 10}% (${balance.lastNerfedStat || 'random stat'})`}
                  >
                    <TrendingDown className="w-2.5 h-2.5 text-white" />
                    <span className="text-[8px] font-bold text-white">-{balance.nerfLevel * 10}%</span>
                  </div>
                )}
                {/* Win streak indicator (close to nerf) */}
                {balance && balance.winStreak > 0 && balance.winStreak < 3 && !isNerfed && (
                  <div 
                    className="absolute bottom-0 left-0 bg-yellow-500/90 rounded-full px-1 py-0.5 flex items-center gap-0.5 z-10"
                    title={`${balance.winStreak}/3 wins to nerf`}
                  >
                    <span className="text-[7px] font-bold text-yellow-900">🔥{balance.winStreak}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          {selectedDeck.length >= 8 ? 'Deck full! Remove a card first.' : 'Double-click to add/remove cards • Use ↑↓ arrows to scroll'}
        </p>
      </div>

      {/* Card Info Tooltip */}
      {selectedCard && (() => {
        const balance = getBalanceInfo(selectedCard.id);
        const isNerfed = balance && balance.nerfLevel > 0;
        const nerfMultiplier = isNerfed ? (1 - balance.nerfLevel * 0.1) : 1;
        
        return (
          <div className="fixed bottom-36 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg p-3 shadow-lg min-w-64 z-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{selectedCard.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{selectedCard.name}</h3>
                  {isNerfed && (
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <TrendingDown className="w-2.5 h-2.5" />
                      -{balance.nerfLevel * 10}%
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-xs capitalize',
                  selectedCard.rarity === 'common' && 'text-slate-400',
                  selectedCard.rarity === 'rare' && 'text-blue-400',
                  selectedCard.rarity === 'epic' && 'text-purple-400',
                  selectedCard.rarity === 'legendary' && 'text-amber-400'
                )}>
                  {selectedCard.rarity}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{selectedCard.description}</p>
            
            {/* Stats with nerf indication */}
            <div className="flex gap-4 text-xs">
              <span className={isNerfed ? 'text-orange-400' : ''}>
                ❤️ {isNerfed ? Math.round(selectedCard.health * nerfMultiplier) : selectedCard.health}
                {isNerfed && <span className="text-[9px] text-muted-foreground line-through ml-1">{selectedCard.health}</span>}
              </span>
              <span className={isNerfed ? 'text-orange-400' : ''}>
                ⚔️ {isNerfed ? Math.round(selectedCard.damage * nerfMultiplier) : selectedCard.damage}
                {isNerfed && <span className="text-[9px] text-muted-foreground line-through ml-1">{selectedCard.damage}</span>}
              </span>
              <span>⚡ {selectedCard.elixirCost}</span>
            </div>
            
            {/* Nerf details */}
            {isNerfed && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-[10px] text-orange-400">
                  ⚠️ This card was nerfed {balance.nerfLevel} time{balance.nerfLevel > 1 ? 's' : ''} for winning too many games
                </p>
              </div>
            )}
            
            {/* Win streak warning */}
            {balance && balance.winStreak > 0 && !isNerfed && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-[10px] text-yellow-500">
                  🔥 Win streak: {balance.winStreak}/3 - will be nerfed after {3 - balance.winStreak} more MVP wins
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleSave}
            disabled={selectedDeck.length !== 8}
          >
            Save Deck {editingDeckId}
          </Button>
          {!isActiveDeck && (
            <Button 
              variant="secondary"
              className="flex-1"
              onClick={handleSetActive}
              disabled={selectedDeck.length !== 8}
            >
              Set as Active
            </Button>
          )}
        </div>
        <Button 
          className="w-full gap-2"
          onClick={onStartBattle}
          disabled={!canBattle}
        >
          <Swords className="w-4 h-4" />
          Battle with Deck {activeDeckId}!
        </Button>
      </div>

      {selectedDeck.length !== 8 && (
        <p className="text-destructive text-sm flex items-center gap-1">
          <Info className="w-4 h-4" />
          Select {8 - selectedDeck.length} more card{8 - selectedDeck.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
