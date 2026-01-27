import { useState } from 'react';
import { CardDefinition } from '@/types/game';
import { allCards } from '@/data/cards';
import { GameCard } from './GameCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Swords, Check, X, Info } from 'lucide-react';

interface DeckBuilderProps {
  ownedCardIds: string[];
  currentDeck: string[];
  onSaveDeck: (deck: string[]) => void;
  onStartBattle: () => void;
}

export function DeckBuilder({ ownedCardIds, currentDeck, onSaveDeck, onStartBattle }: DeckBuilderProps) {
  const [selectedDeck, setSelectedDeck] = useState<string[]>(currentDeck);
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);

  const ownedCards = allCards.filter(c => ownedCardIds.includes(c.id));
  const deckCards = selectedDeck.map(id => allCards.find(c => c.id === id)!).filter(Boolean);

  const toggleCard = (cardId: string) => {
    if (selectedDeck.includes(cardId)) {
      setSelectedDeck(prev => prev.filter(id => id !== cardId));
    } else if (selectedDeck.length < 8) {
      setSelectedDeck(prev => [...prev, cardId]);
    }
  };

  const handleSave = () => {
    if (selectedDeck.length === 8) {
      onSaveDeck(selectedDeck);
    }
  };

  const avgElixir = deckCards.length > 0 
    ? (deckCards.reduce((sum, c) => sum + c.elixirCost, 0) / deckCards.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="game-title text-4xl text-primary mb-2">Battle Deck</h1>
        <p className="text-muted-foreground text-sm">Select 8 cards for battle</p>
      </div>

      {/* Current Deck */}
      <div className="bg-card/50 rounded-xl p-4 border border-border w-full max-w-md">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">Your Deck ({selectedDeck.length}/8)</span>
          <span className="text-xs text-muted-foreground">Avg: ⚡{avgElixir}</span>
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
                    {/* Card stats below */}
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
        
        <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-1">
          {ownedCards.map(card => {
            const inDeck = selectedDeck.includes(card.id);
            return (
              <div 
                key={card.id}
                className="relative cursor-pointer"
                onMouseEnter={() => setSelectedCard(card)}
                onMouseLeave={() => setSelectedCard(null)}
                onDoubleClick={() => toggleCard(card.id)}
              >
                <GameCard 
                  card={card} 
                  size="small"
                  isSelected={inDeck}
                />
                {inDeck && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Info Tooltip */}
      {selectedCard && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg p-3 shadow-lg min-w-64 z-50">
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
      <div className="flex gap-3 w-full max-w-md">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleSave}
          disabled={selectedDeck.length !== 8}
        >
          Save Deck
        </Button>
        <Button 
          className="flex-1 gap-2"
          onClick={onStartBattle}
          disabled={selectedDeck.length !== 8}
        >
          <Swords className="w-4 h-4" />
          Battle!
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
