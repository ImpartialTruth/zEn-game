import React, { useState, useEffect } from 'react';
import { GAME_TYPES } from '../../utils/constants';
import CrashGame from './CrashGame';
import CoinFlipGame from './CoinFlipGame';
import LuckyWheelGame from './LuckyWheelGame';
import MinesGame from './MinesGame';
import RouletteGame from './RouletteGame';
import DiceGame from './DiceGame';
import ErrorBoundary from '../common/ErrorBoundary';
import './ModernGamesSection.css';

const ModernGamesSection = ({ onGameSelect, onGameExit, exitGame }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Game data with proper assets
  const games = [
    {
      id: GAME_TYPES.CRASH,
      name: 'CRASH',
      description: 'Watch the multiplier rise and cash out before it crashes!',
      icon: '🚀',
      backgroundImage: '/assets/images/games/crash-game.jpg',
      minBet: 10,
      maxBet: 1000,
      status: 'active',
      multiplier: '2.45x',
      category: 'multiplier'
    },
    {
      id: 'roulette',
      name: 'ROULETTE',
      description: 'Classic European roulette with 37 numbers',
      icon: '🎯',
      backgroundImage: '/assets/images/games/roulette-game.jpg',
      minBet: 5,
      maxBet: 500,
      status: 'active',
      multiplier: '36x',
      category: 'table'
    },
    {
      id: GAME_TYPES.MINES,
      name: 'MINES',
      description: 'Find diamonds while avoiding dangerous mines',
      icon: '💎',
      backgroundImage: '/assets/images/games/mines-game.jpg',
      minBet: 5,
      maxBet: 1000,
      status: 'active',
      multiplier: '24.75x',
      category: 'skill'
    },
    {
      id: 'dice',
      name: 'DICE',
      description: 'Roll the dice and predict the outcome',
      icon: '🎲',
      backgroundImage: '/assets/images/games/dice-game.jpg',
      minBet: 1,
      maxBet: 100,
      status: 'active',
      multiplier: '99x',
      category: 'prediction'
    },
    {
      id: GAME_TYPES.COIN_FLIP,
      name: 'COIN FLIP',
      description: 'Simple heads or tails - 50/50 chance',
      icon: '🪙',
      backgroundImage: '/assets/images/games/coin-flip.jpg',
      minBet: 1,
      maxBet: 1000,
      status: 'active',
      multiplier: '2x',
      category: 'simple'
    },
    {
      id: GAME_TYPES.LUCKY_WHEEL,
      name: 'LUCKY WHEEL',
      description: 'Spin the wheel and win amazing prizes',
      icon: '🎰',
      backgroundImage: '/assets/images/games/lucky-wheel.jpg',
      minBet: 5,
      maxBet: 500,
      status: 'active',
      multiplier: '10x',
      category: 'wheel'
    },
    {
      id: 'plinko',
      name: 'PLINKO',
      description: 'Drop the ball and watch it bounce to glory',
      icon: '⚪',
      backgroundImage: '/assets/images/games/lucky-wheel.jpg',
      minBet: 20,
      maxBet: 200,
      status: 'coming-soon',
      multiplier: '1000x',
      category: 'physics'
    },
    {
      id: 'towers',
      name: 'TOWERS',
      description: 'Climb the tower of fortune step by step',
      icon: '🏰',
      backgroundImage: '/assets/images/games/crash-game.jpg',
      minBet: 10,
      maxBet: 500,
      status: 'coming-soon',
      multiplier: '10.24x',
      category: 'progression'
    }
  ];

  // Listen for external exit game signal
  useEffect(() => {
    if (exitGame) {
      setSelectedGame(null);
    }
  }, [exitGame]);

  const handleGameSelect = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (game?.status === 'coming-soon') {
      return;
    }
    setSelectedGame(gameId);
    if (onGameSelect) {
      onGameSelect(gameId);
    }
  };

  const handleBackToSelection = () => {
    setSelectedGame(null);
    if (onGameExit) {
      onGameExit();
    }
  };

  const renderGameComponent = () => {
    switch (selectedGame) {
      case GAME_TYPES.CRASH:
        return <CrashGame onBack={handleBackToSelection} />;
      case GAME_TYPES.COIN_FLIP:
        return <CoinFlipGame onBack={handleBackToSelection} />;
      case GAME_TYPES.LUCKY_WHEEL:
        return <LuckyWheelGame onBack={handleBackToSelection} />;
      case GAME_TYPES.MINES:
        return <MinesGame onBack={handleBackToSelection} />;
      case 'roulette':
        return <RouletteGame onBack={handleBackToSelection} />;
      case 'dice':
        return <DiceGame onBack={handleBackToSelection} />;
      default:
        return null;
    }
  };

  // If game is selected, show the game component
  if (selectedGame) {
    return (
      <div className="modern-games-section fullscreen-game">
        <div className="game-container">
          <ErrorBoundary onBack={handleBackToSelection}>
            {renderGameComponent()}
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-games-section">
      <div className="games-grid-container">
        <div className="games-grid">
          {games.map((game) => (
            <div
              key={game.id}
              className={`game-card ${game.status} ${hoveredCard === game.id ? 'hovered' : ''}`}
              onClick={() => handleGameSelect(game.id)}
              onMouseEnter={() => setHoveredCard(game.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Game Background Image */}
              <div
                className="card-background"
                style={{
                  backgroundImage: `url(${game.backgroundImage})`
                }}
              />

              {/* Card Content */}
              <div className="card-content">
                <div className="card-header">
                  <div className="game-icon-main">{game.icon}</div>
                  {game.status === 'coming-soon' ? (
                    <div className="coming-soon-badge">Coming Soon</div>
                  ) : (
                    <div className="multiplier-badge">{game.multiplier}</div>
                  )}
                </div>

                <div className="card-body">
                  <h3 className="game-title">{game.name}</h3>
                  <p className="game-description">{game.description}</p>
                </div>

                <div className="card-footer">
                  <div className="bet-range">
                    <span className="bet-min">{game.minBet}🪙</span>
                    <span> - </span>
                    <span className="bet-max">{game.maxBet}🪙</span>
                  </div>

                  {game.status === 'active' ? (
                    <button className="play-button">
                      PLAY NOW
                    </button>
                  ) : (
                    <div className="soon-indicator">
                      🔜 Soon
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModernGamesSection;