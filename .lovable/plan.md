
# Fix Battle Hotbar (Card Hand) Visibility

## Problem Identified

Looking at your screenshot, the elixir bar is visible at the bottom but the **4 card slots are not showing**. After investigating the code:

1. **Layout Issue**: The fixed controls container in `GameUI.tsx` positions everything at `bottom-0`, but the Hand component containing your 4 cards is being rendered **below the visible viewport** or is being clipped.

2. **The Hand component renders correctly** - it maps over `gameState.playerHand` which gets 4 cards from `drawHand()`, but visually it's cut off.

## Root Cause

The fixed container structure stacks:
- ElixirBar (~48px tall)
- Hand cards (~88px tall)  
- Optional helper text (~20px)
- Padding (24px total)

The total height (~180px) combined with `bottom-0` positioning is causing the cards to render outside the viewport on your device/screen size.

## Solution

Restructure the battle UI layout to ensure the card hotbar is always visible:

### Changes to `src/components/game/GameUI.tsx`

1. **Reorder components**: Place the Hand (cards) ABOVE the ElixirBar in the visual stack, since cards are more important to see
2. **Add explicit min-height**: Ensure the container has enough space for all elements
3. **Add overflow protection**: Use `overflow-visible` to prevent clipping
4. **Increase safe area padding**: Add more padding at the bottom to account for mobile notches/home bars

```text
Current Order (bottom to top):
├── safe-area padding
├── ElixirBar  ← visible in your screenshot
├── Hand (cards) ← CUT OFF
└── Helper text

New Order (bottom to top):
├── safe-area padding  
├── ElixirBar
├── Hand (cards) ← NOW VISIBLE
└── (more reliable positioning)
```

### Technical Implementation

```tsx
// Fixed controls container - increase min-height and adjust structure
<div className="fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-md px-4 z-50">
  <div 
    className="bg-card/95 backdrop-blur-md border border-border rounded-t-xl p-3 flex flex-col items-center gap-3 shadow-lg"
    style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
  >
    {/* Cards FIRST (most important to see) */}
    <Hand
      cards={gameState.playerHand}
      elixir={gameState.playerElixir}
      selectedIndex={gameState.selectedCardIndex}
      onCardSelect={handleCardSelect}
    />
    
    {/* Then elixir bar */}
    <ElixirBar 
      elixir={gameState.playerElixir} 
      isSuddenDeath={gameState.isSuddenDeath}
    />

    {/* Helper text at bottom */}
    {gameState.selectedCardIndex !== null && (
      <p className="text-sm animate-pulse text-muted-foreground">
        Tap on your side of the arena to deploy!
      </p>
    )}
  </div>
</div>
```

### Additional Safety Measures

1. **Increase parent padding**: Change `pb-48` to `pb-56` (224px) to ensure arena content doesn't get hidden behind the controls
2. **Debug logging** (optional): Add a console log to verify `playerHand` has 4 cards when rendering

## Expected Result

After this fix:
- Your 4 playable cards will appear in the hotbar above the elixir bar
- The layout will properly respect mobile safe areas (iPhone home bar, notch, etc.)
- Cards will be visible and tappable to select before placing on the arena
