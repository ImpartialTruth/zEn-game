import React, { useState, useEffect } from 'react';
import { GAME_TYPES } from '../../utils/constants';
import CrashGame from './CrashGame';
import CoinFlipGame from './CoinFlipGame';
import LuckyWheelGame from './LuckyWheelGame';
import MinesGame from './MinesGame';
import RouletteGame from './RouletteGame';
import DiceGame from './DiceGame';
import './ModernGamesSection.css';

const ModernGamesSection = ({ onGameSelect, onGameExit, exitGame }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Listen for external exit game signal
  useEffect(() => {
    if (exitGame) {
      setSelectedGame(null);
    }
  }, [exitGame]);

  const games = [
    {
      id: GAME_TYPES.CRASH,
      name: 'CRASH',
      description: 'Fly high and cash out before the crash',
      icon: '🚀',
      secondaryIcon: '⭐',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9))',
      minBet: 10,
      maxBet: 1000,
      status: 'active',
      multiplier: '1.47x',
      particles: ['✨', '💫', '⭐']
    },
    {
      id: 'roulette',
      name: 'ROULETTE',
      description: 'Classic casino roulette experience',
      icon: '🎯',
      secondaryIcon: '🪙',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(240, 147, 251, 0.9), rgba(245, 87, 108, 0.9))',
      minBet: 5,
      maxBet: 500,
      status: 'active',
      multiplier: '36x',
      particles: ['🎰', '💰', '🎲']
    },
    {
      id: 'plinko',
      name: 'PLINKO',
      description: 'Drop balls and win big multipliers',
      icon: '⚪',
      secondaryIcon: '🌟',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(168, 237, 234, 0.9), rgba(254, 214, 227, 0.9))',
      minBet: 20,
      maxBet: 200,
      status: 'coming-soon',
      multiplier: '1000x',
      particles: ['🏀', '⚡', '💎']
    },
    {
      id: GAME_TYPES.MINES,
      name: 'MINES',
      description: 'Reveal gems while avoiding mines',
      icon: '💎',
      secondaryIcon: '💣',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(79, 172, 254, 0.9), rgba(0, 242, 254, 0.9))',
      minBet: 5,
      maxBet: 1000,
      status: 'active',
      multiplier: '24.75x',
      particles: ['💎', '⚡', '✨']
    },
    {
      id: 'dice',
      name: 'DICE',
      description: 'Predict the dice roll outcome',
      icon: '🎲',
      secondaryIcon: '📊',
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(250, 112, 154, 0.9), rgba(254, 225, 64, 0.9))',
      minBet: 1,
      maxBet: 100,
      status: 'active',
      multiplier: '99x',
      particles: ['🎯', '🔥', '⚡']
    },
    {
      id: 'towers',
      name: 'TOWERS',
      description: 'Climb the tower for bigger wins',
      icon: '⭐',
      secondaryIcon: '🏆',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(255, 154, 158, 0.9), rgba(254, 207, 239, 0.9))',
      minBet: 10,
      maxBet: 500,
      status: 'coming-soon',
      multiplier: '10.24x',
      particles: ['🏰', '👑', '💫']
    }
  ];

  const handleGameSelect = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (game?.status === 'coming-soon') {
      return; // Don't allow selecting coming soon games
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

  if (selectedGame) {
    return (
      <div className="modern-games-section fullscreen-game">
        <div className="game-container fullscreen">
          {renderGameComponent()}
        </div>
      </div>
    );
  }

  return (
    <div className="modern-games-section">
      {/* Background Effects */}
      <div className="cosmic-background">
        <div className="stars-layer"></div>
        <div className="nebula-layer"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="cosmic-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="modern-header">
        <div className="header-content">
          <div className="brand-section">
            <div className="brand-icon">🎮</div>
            <h1 className="brand-title">ZEN GAMES</h1>
            <p className="brand-subtitle">Next Generation Casino</p>
          </div>
          
          <div className="user-stats">
            <div className="balance-card">
              <div className="balance-icon">💰</div>
              <div className="balance-info">
                <span className="balance-label">Balance</span>
                <span className="balance-amount">12,450 🪙</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="games-grid-container">
        <div className="games-grid">
          {games.map((game, index) => (
            <div 
              key={game.id} 
              className={`game-card ${game.status} ${hoveredCard === game.id ? 'hovered' : ''}`}
              onClick={() => handleGameSelect(game.id)}
              onMouseEnter={() => setHoveredCard(game.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ 
                '--card-gradient': game.cardGradient,
                '--bg-gradient': game.background,
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Card Background */}
              <div className="card-background" style={{ background: game.background }}></div>
              
              {/* Floating Particles */}
              <div className="card-particles">
                {game.particles.map((particle, i) => (
                  <div 
                    key={i}
                    className="floating-particle"
                    style={{
                      left: `${20 + (i * 25)}%`,
                      top: `${15 + (i * 20)}%`,
                      animationDelay: `${i * 0.5}s`
                    }}
                  >
                    {particle}
                  </div>
                ))}
              </div>

              {/* Card Content */}
              <div className="card-content">
                <div className="card-header">
                  <div className="game-icon-main">{game.icon}</div>
                  <div className="game-icon-secondary">{game.secondaryIcon}</div>
                  
                  {game.status === 'coming-soon' && (
                    <div className="coming-soon-badge">SOON</div>
                  )}
                  
                  {game.status === 'active' && (
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
                    <span className="bet-separator">-</span>
                    <span className="bet-max">{game.maxBet}🪙</span>
                  </div>
                  
                  <div className="play-indicator">
                    {game.status === 'active' ? (
                      <div className="play-button">
                        <span className="play-icon">▶</span>
                        <span className="play-text">PLAY</span>
                      </div>
                    ) : (
                      <div className="soon-indicator">
                        <span className="soon-icon">🔜</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3D Effects */}
              <div className="card-shine"></div>
              <div className="card-glow"></div>
              <div className="card-border"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="bottom-info">
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <div className="info-content">
              <h4>Fair Play</h4>
              <p>Provably fair algorithms ensure transparent gaming</p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <div className="info-content">
              <h4>Instant Wins</h4>
              <p>Fast-paced games with immediate payouts</p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">🔒</div>
            <div className="info-content">
              <h4>Secure</h4>
              <p>Your funds and data are always protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernGamesSection;