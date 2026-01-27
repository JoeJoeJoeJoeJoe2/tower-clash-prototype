import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Tower, Unit, CardDefinition, Position } from '@/types/game';
import { createDeck, drawHand, allCards } from '@/data/cards';

const ARENA_WIDTH = 400;
const ARENA_HEIGHT = 600;
const ELIXIR_REGEN_RATE = 0.018; // Slowed from 0.03
const GAME_DURATION = 180;

function createInitialTowers(): { playerTowers: Tower[], enemyTowers: Tower[] } {
  const playerTowers: Tower[] = [
    {
      id: 'player-king',
      type: 'king',
      owner: 'player',
      position: { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 50 },
      health: 400,
      maxHealth: 400,
      attackDamage: 15,
      attackRange: 100,
      attackCooldown: 1200,
      lastAttackTime: 0
    },
    {
      id: 'player-princess-left',
      type: 'princess',
      owner: 'player',
      position: { x: 80, y: ARENA_HEIGHT - 120 },
      health: 200,
      maxHealth: 200,
      attackDamage: 10,
      attackRange: 120,
      attackCooldown: 1000,
      lastAttackTime: 0
    },
    {
      id: 'player-princess-right',
      type: 'princess',
      owner: 'player',
      position: { x: ARENA_WIDTH - 80, y: ARENA_HEIGHT - 120 },
      health: 200,
      maxHealth: 200,
      attackDamage: 10,
      attackRange: 120,
      attackCooldown: 1000,
      lastAttackTime: 0
    }
  ];

  const enemyTowers: Tower[] = [
    {
      id: 'enemy-king',
      type: 'king',
      owner: 'enemy',
      position: { x: ARENA_WIDTH / 2, y: 50 },
      health: 400,
      maxHealth: 400,
      attackDamage: 15,
      attackRange: 100,
      attackCooldown: 1200,
      lastAttackTime: 0
    },
    {
      id: 'enemy-princess-left',
      type: 'princess',
      owner: 'enemy',
      position: { x: 80, y: 120 },
      health: 200,
      maxHealth: 200,
      attackDamage: 10,
      attackRange: 120,
      attackCooldown: 1000,
      lastAttackTime: 0
    },
    {
      id: 'enemy-princess-right',
      type: 'princess',
      owner: 'enemy',
      position: { x: ARENA_WIDTH - 80, y: 120 },
      health: 200,
      maxHealth: 200,
      attackDamage: 10,
      attackRange: 120,
      attackCooldown: 1000,
      lastAttackTime: 0
    }
  ];

  return { playerTowers, enemyTowers };
}

function getDistance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function createInitialState(playerDeckIds: string[]): GameState {
  const { playerTowers, enemyTowers } = createInitialTowers();
  const playerDeck = createDeck(playerDeckIds);
  const enemyDeck = createDeck(allCards.slice(0, 8).map(c => c.id));
  const { hand: playerHand, remainingDeck: playerRemainingDeck } = drawHand(playerDeck);
  const { hand: enemyHand, remainingDeck: enemyRemainingDeck } = drawHand(enemyDeck);

  return {
    playerElixir: 5,
    enemyElixir: 5,
    playerTowers,
    enemyTowers,
    playerUnits: [],
    enemyUnits: [],
    playerDeck: playerRemainingDeck,
    playerHand,
    enemyDeck: enemyRemainingDeck,
    enemyHand,
    timeRemaining: GAME_DURATION,
    gameStatus: 'playing',
    selectedCardIndex: null
  };
}

export function useGameState(playerDeckIds: string[]) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(playerDeckIds));
  const gameLoopRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const unitIdCounter = useRef(0);

  const spawnUnit = useCallback((card: CardDefinition, position: Position, owner: 'player' | 'enemy'): Unit => {
    return {
      id: `unit-${unitIdCounter.current++}`,
      cardId: card.id,
      owner,
      position: { ...position },
      health: card.health,
      maxHealth: card.health,
      damage: card.damage,
      attackSpeed: card.attackSpeed,
      moveSpeed: card.moveSpeed,
      range: card.range,
      lastAttackTime: 0,
      targetId: null,
      state: 'idle',
      animationFrame: 0,
      direction: owner === 'player' ? 'up' : 'down'
    };
  }, []);

  const playCard = useCallback((cardIndex: number, position: Position) => {
    setGameState(prev => {
      const card = prev.playerHand[cardIndex];
      if (!card || prev.playerElixir < card.elixirCost) return prev;
      if (position.y < ARENA_HEIGHT / 2) return prev;

      const newUnit = spawnUnit(card, position, 'player');
      
      const newHand = [...prev.playerHand];
      const nextCard = prev.playerDeck[0];
      newHand[cardIndex] = nextCard;
      const newDeck = [...prev.playerDeck.slice(1), card];

      return {
        ...prev,
        playerElixir: prev.playerElixir - card.elixirCost,
        playerUnits: [...prev.playerUnits, newUnit],
        playerHand: newHand,
        playerDeck: newDeck,
        selectedCardIndex: null
      };
    });
  }, [spawnUnit]);

  const selectCard = useCallback((index: number | null) => {
    setGameState(prev => ({
      ...prev,
      selectedCardIndex: index
    }));
  }, []);

  // Slower AI logic
  const runAI = useCallback((state: GameState, now: number): GameState => {
    if (state.enemyElixir < 4) return state; // Wait for more elixir
    
    // Much lower chance to play (was 0.02, now 0.008)
    if (Math.random() > 0.008) return state;
    
    const affordableCards = state.enemyHand
      .map((card, idx) => ({ card, idx }))
      .filter(({ card }) => card.elixirCost <= state.enemyElixir);
    
    if (affordableCards.length === 0) return state;
    
    const { card, idx } = affordableCards[Math.floor(Math.random() * affordableCards.length)];
    
    const position: Position = {
      x: 50 + Math.random() * (ARENA_WIDTH - 100),
      y: 150 + Math.random() * 100
    };

    const newUnit: Unit = {
      id: `unit-${unitIdCounter.current++}`,
      cardId: card.id,
      owner: 'enemy',
      position,
      health: card.health,
      maxHealth: card.health,
      damage: card.damage,
      attackSpeed: card.attackSpeed,
      moveSpeed: card.moveSpeed,
      range: card.range,
      lastAttackTime: 0,
      targetId: null,
      state: 'idle',
      animationFrame: 0,
      direction: 'down'
    };

    const newHand = [...state.enemyHand];
    const nextCard = state.enemyDeck[0];
    newHand[idx] = nextCard;
    const newDeck = [...state.enemyDeck.slice(1), card];

    return {
      ...state,
      enemyElixir: state.enemyElixir - card.elixirCost,
      enemyUnits: [...state.enemyUnits, newUnit],
      enemyHand: newHand,
      enemyDeck: newDeck
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setGameState(prev => {
        if (prev.gameStatus !== 'playing') return prev;

        let state = { ...prev };

        state.playerElixir = Math.min(10, state.playerElixir + ELIXIR_REGEN_RATE);
        state.enemyElixir = Math.min(10, state.enemyElixir + ELIXIR_REGEN_RATE);
        state.timeRemaining = Math.max(0, state.timeRemaining - delta);

        state = runAI(state, now);

        // Update player units
        state.playerUnits = state.playerUnits.map(unit => {
          if (unit.health <= 0) return unit;

          const enemies = [
            ...state.enemyUnits.filter(u => u.health > 0),
            ...state.enemyTowers.filter(t => t.health > 0)
          ];

          let closestEnemy = null;
          let closestDist = Infinity;

          for (const enemy of enemies) {
            const dist = getDistance(unit.position, enemy.position);
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = enemy;
            }
          }

          const newUnit = { ...unit };

          if (closestEnemy) {
            if (closestDist <= unit.range) {
              newUnit.state = 'attacking';
              if (now - unit.lastAttackTime > 1000 / unit.attackSpeed) {
                newUnit.lastAttackTime = now;
                newUnit.animationFrame = (unit.animationFrame + 1) % 4;
              }
            } else {
              newUnit.state = 'moving';
              const dx = closestEnemy.position.x - unit.position.x;
              const dy = closestEnemy.position.y - unit.position.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              
              newUnit.position = {
                x: unit.position.x + (dx / len) * unit.moveSpeed,
                y: unit.position.y + (dy / len) * unit.moveSpeed
              };
              newUnit.direction = dy < 0 ? 'up' : 'down';
              newUnit.animationFrame = (unit.animationFrame + 1) % 8;
            }
          } else {
            newUnit.state = 'idle';
          }

          return newUnit;
        });

        // Update enemy units
        state.enemyUnits = state.enemyUnits.map(unit => {
          if (unit.health <= 0) return unit;

          const enemies = [
            ...state.playerUnits.filter(u => u.health > 0),
            ...state.playerTowers.filter(t => t.health > 0)
          ];

          let closestEnemy = null;
          let closestDist = Infinity;

          for (const enemy of enemies) {
            const dist = getDistance(unit.position, enemy.position);
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = enemy;
            }
          }

          const newUnit = { ...unit };

          if (closestEnemy) {
            if (closestDist <= unit.range) {
              newUnit.state = 'attacking';
              if (now - unit.lastAttackTime > 1000 / unit.attackSpeed) {
                newUnit.lastAttackTime = now;
                newUnit.animationFrame = (unit.animationFrame + 1) % 4;
              }
            } else {
              newUnit.state = 'moving';
              const dx = closestEnemy.position.x - unit.position.x;
              const dy = closestEnemy.position.y - unit.position.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              
              newUnit.position = {
                x: unit.position.x + (dx / len) * unit.moveSpeed,
                y: unit.position.y + (dy / len) * unit.moveSpeed
              };
              newUnit.direction = dy < 0 ? 'up' : 'down';
              newUnit.animationFrame = (unit.animationFrame + 1) % 8;
            }
          } else {
            newUnit.state = 'idle';
          }

          return newUnit;
        });

        // Apply damage
        state.playerUnits.forEach(unit => {
          if (unit.health <= 0 || unit.state !== 'attacking') return;
          if (now - unit.lastAttackTime < 50) {
            const enemies = [...state.enemyUnits, ...state.enemyTowers];
            for (const enemy of enemies) {
              if (enemy.health > 0 && getDistance(unit.position, enemy.position) <= unit.range) {
                enemy.health -= unit.damage;
                break;
              }
            }
          }
        });

        state.enemyUnits.forEach(unit => {
          if (unit.health <= 0 || unit.state !== 'attacking') return;
          if (now - unit.lastAttackTime < 50) {
            const enemies = [...state.playerUnits, ...state.playerTowers];
            for (const enemy of enemies) {
              if (enemy.health > 0 && getDistance(unit.position, enemy.position) <= unit.range) {
                enemy.health -= unit.damage;
                break;
              }
            }
          }
        });

        // Tower attacks
        state.playerTowers.forEach(tower => {
          if (tower.health <= 0) return;
          if (now - tower.lastAttackTime > tower.attackCooldown) {
            const enemies = state.enemyUnits.filter(u => 
              u.health > 0 && getDistance(tower.position, u.position) <= tower.attackRange
            );
            if (enemies.length > 0) {
              enemies[0].health -= tower.attackDamage;
              tower.lastAttackTime = now;
            }
          }
        });

        state.enemyTowers.forEach(tower => {
          if (tower.health <= 0) return;
          if (now - tower.lastAttackTime > tower.attackCooldown) {
            const enemies = state.playerUnits.filter(u => 
              u.health > 0 && getDistance(tower.position, u.position) <= tower.attackRange
            );
            if (enemies.length > 0) {
              enemies[0].health -= tower.attackDamage;
              tower.lastAttackTime = now;
            }
          }
        });

        // Remove dead units
        state.playerUnits = state.playerUnits.filter(u => u.health > 0);
        state.enemyUnits = state.enemyUnits.filter(u => u.health > 0);

        // Check win conditions
        const playerKing = state.playerTowers.find(t => t.type === 'king');
        const enemyKing = state.enemyTowers.find(t => t.type === 'king');

        if (enemyKing && enemyKing.health <= 0) {
          state.gameStatus = 'player-wins';
        } else if (playerKing && playerKing.health <= 0) {
          state.gameStatus = 'enemy-wins';
        } else if (state.timeRemaining <= 0) {
          const playerTowersAlive = state.playerTowers.filter(t => t.health > 0).length;
          const enemyTowersAlive = state.enemyTowers.filter(t => t.health > 0).length;
          const playerTowersDestroyed = 3 - enemyTowersAlive;
          const enemyTowersDestroyed = 3 - playerTowersAlive;

          if (playerTowersDestroyed > enemyTowersDestroyed) {
            state.gameStatus = 'player-wins';
          } else if (enemyTowersDestroyed > playerTowersDestroyed) {
            state.gameStatus = 'enemy-wins';
          } else {
            state.gameStatus = 'draw';
          }
        }

        return state;
      });

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [runAI]);

  const resetGame = useCallback(() => {
    setGameState(createInitialState(playerDeckIds));
  }, [playerDeckIds]);

  return {
    gameState,
    playCard,
    selectCard,
    resetGame,
    ARENA_WIDTH,
    ARENA_HEIGHT
  };
}
