import { useState, useEffect } from 'react';
import { CardDefinition, DeckSlot } from '@/types/game';
import { allCards } from '@/data/cards';
import { GameCard } from './GameCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Swords, Check, X, Info, ArrowLeft } from 'lucide-react';

interface DeckBuilderProps {
  ownedCardIds: string[];
  deckSlots: DeckSlot[];
  activeDeckId: 'A' | 'B' | 'C';
  onSaveDeck: (deckId: 'A' | 'B' | 'C', cardIds: string[]) => void;
  onSetActiveDeck: (deckId: 'A' | 'B' | 'C') => void;
  onStartBattle: () => void;
  onBack: () => void;
}

export function DeckBuilder({ 
  ownedCardIds, 
  deckSlots, 
  activeDeckId,
  onSaveDeck, 
  onSetActiveDeck,
  onStartBattle,
  onBack
}: DeckBuilderProps) {
  const [editingDeckId, setEditingDeckId] = useState<'A' | 'B' | 'C'>(activeDeckId);
  const currentSlot = deckSlots.find(s => s.id === editingDeckId)!;
  const [selectedDeck, setSelectedDeck] = useState<string[]>(currentSlot?.cardIds || []);
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);

  // Sync when switching deck tabs
  useEffect(() => {
    const slot = deckSlots.find(s => s.id === editingDeckId);
    setSelectedDeck(slot?.cardIds || []);
  }, [editingDeckId, deckSlots]);

  const ownedCards = allCards.filter(c => ownedCardIds.includes(c.id));
  const deckCards = selectedDeck.map(id => allCards.find(c => c.id === id)!).filter(Boolean);

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
    <div className="min-h-screen bg-background flex flex-col items-center p-4 gap-4">
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
      <div className="flex gap-2 w-full max-w-md">
        {(['A', 'B', 'C'] as const).map(id => {
          const slot = deckSlots.find(s => s.id === id);
          const isComplete = slot && slot.cardIds.length === 8;
          const isEditing = editingDeckId === id;
          const isActive = activeDeckId === id;
          
          return (
            <button
              key={id}
              onClick={() => setEditingDeckId(id)}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium',
                isEditing 
                  ? 'border-primary bg-primary/20 text-primary' 
                  : 'border-border bg-card/50 text-muted-foreground hover:bg-card',
                isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <span>Deck {id}</span>
                <span className={cn(
                  'text-[10px]',
                  isComplete ? 'text-green-400' : 'text-muted-foreground'
                )}>
                  {isComplete ? '✓ Ready' : `${slot?.cardIds.length || 0}/8`}
                </span>
                {isActive && (
                  <span className="text-[10px] text-primary font-bold">ACTIVE</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

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

      {/* Card Collection */}
      <div className="bg-card/30 rounded-xl p-4 border border-border w-full max-w-md flex-1">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">Your Cards ({ownedCards.length})</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2 max-h-[250px] overflow-y-auto p-1">
          {ownedCards.map(card => {
            const inDeck = selectedDeck.includes(card.id);
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
                {inDeck && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center z-10">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {selectedDeck.length >= 8 ? 'Deck full! Remove a card first.' : 'Double-click to add/remove cards'}
        </p>
      </div>

      {/* Card Info Tooltip */}
      {selectedCard && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg p-3 shadow-lg min-w-64 z-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{selectedCard.emoji}</span>
            <div>
              <h3 className="font-bold">{selectedCard.name}</h3>
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
          <div className="flex gap-4 text-xs">
            <span>❤️ {selectedCard.health}</span>
            <span>⚔️ {selectedCard.damage}</span>
            <span>⚡ {selectedCard.elixirCost}</span>
          </div>
        </div>
      )}

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
