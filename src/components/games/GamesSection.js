import React, { useState } from 'react';
import { GAME_TYPES } from '../../utils/constants';
import CrashGame from './CrashGame';
import CoinFlipGame from './CoinFlipGame';
import LuckyWheelGame from './LuckyWheelGame';
import './GamesSection.css';

const GamesSection = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: GAME_TYPES.CRASH,
      name: 'Crash',
      description: 'Watch the multiplier rise and cash out before it crashes',
      icon: '📈',
      gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      minBet: 10,
      maxBet: 1000,
      status: 'active'
    },
    {
      id: GAME_TYPES.COIN_FLIP,
      name: 'Coin Flip',
      description: 'Simple heads or tails with 50/50 odds',
      icon: '🪙',
      gradient: 'linear-gradient(135deg, #feca57, #ff9ff3)',
      minBet: 5,
      maxBet: 500,
      status: 'active'
    },
    {
      id: GAME_TYPES.LUCKY_WHEEL,
      name: 'Lucky Wheel',
      description: 'Spin the wheel and win amazing prizes',
      icon: '🎡',
      gradient: 'linear-gradient(135deg, #48dbfb, #0abde3)',
      minBet: 20,
      maxBet: 200,
      status: 'active'
    }
  ];

  const handleGameSelect = (gameId) => {
    setSelectedGame(gameId);
  };

  const handleBackToSelection = () => {
    setSelectedGame(null);
  };

  const renderGameComponent = () => {
    switch (selectedGame) {
      case GAME_TYPES.CRASH:
        return <CrashGame onBack={handleBackToSelection} />;
      case GAME_TYPES.COIN_FLIP:
        return <CoinFlipGame onBack={handleBackToSelection} />;
      case GAME_TYPES.LUCKY_WHEEL:
        return <LuckyWheelGame onBack={handleBackToSelection} />;
      default:
        return null;
    }
  };

  if (selectedGame) {
    return (
      <div className="games-section fullscreen-game">
        <div className="game-container fullscreen">
          {renderGameComponent()}
        </div>
      </div>
    );
  }

  return (
    <div className="games-section">
      <div className="games-grid">
        {games.map(game => (
          <div 
            key={game.id} 
            className="game-card"
            onClick={() => handleGameSelect(game.id)}
          >
            <div className="game-card-inner">
              <div className="game-icon-container">
                <div 
                  className="game-icon-bg"
                  style={{ background: game.gradient }}
                >
                  <div className="game-icon">{game.icon}</div>
                </div>
                <div className="icon-glow"></div>
              </div>
              
              <div className="game-info">
                <h3 className="game-name">{game.name}</h3>
                <p className="game-description">{game.description}</p>
                
                <div className="game-stats">
                  <div className="stat-item">
                    <span className="stat-label">Min Bet</span>
                    <span className="stat-value">{game.minBet} 🪙</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Max Bet</span>
                    <span className="stat-value">{game.maxBet} 🪙</span>
                  </div>
                </div>
              </div>
              
              <div className="game-status">
                <div className={`status-indicator ${game.status}`}>
                  <div className="status-dot"></div>
                  <span className="status-text">
                    {game.status === 'active' ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>
              
              <div className="play-button">
                <button className="play-btn">
                  <span className="play-icon">▶</span>
                  <span className="play-text">Play Now</span>
                </button>
              </div>
            </div>
            
            <div className="card-effects">
              <div className="card-glow"></div>
              <div className="card-shimmer"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="games-info">
        <div className="info-card">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <h4 className="info-title">How to Play</h4>
            <p className="info-text">
              Choose a game, place your bet, and find your zen! 
              Each game has different rules and winning possibilities.
            </p>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-icon">🎯</div>
          <div className="info-content">
            <h4 className="info-title">Fair Play</h4>
            <p className="info-text">
              All games use provably fair algorithms to ensure 
              transparent and random outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesSection;