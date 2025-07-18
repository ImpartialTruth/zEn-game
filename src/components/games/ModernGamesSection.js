import React, { useState, useEffect, useMemo } from 'react';
import { GAME_TYPES } from '../../utils/constants';
import CrashGame from './CrashGame';
import CoinFlipGame from './CoinFlipGame';
import LuckyWheelGame from './LuckyWheelGame';
import MinesGame from './MinesGame';
import RouletteGame from './RouletteGame';
import DiceGame from './DiceGame';
import './ModernGamesSection.css';

// Import game images with error handling
const loadGameImage = (imagePath) => {
  try {
    return require(`../../assets/images/games/${imagePath}`);
  } catch (error) {
    console.warn(`Game image not found: ${imagePath}`);
    return null;
  }
};

const crashGameImg = loadGameImage('crash-game.jpg');
const coinFlipImg = loadGameImage('coin-flip.jpg');
const luckyWheelImg = loadGameImage('lucky-wheel.jpg');
const minesGameImg = loadGameImage('mines-game.jpg');
const rouletteImg = loadGameImage('roulette-game.jpg');
const diceGameImg = loadGameImage('dice-game.jpg');

const ModernGamesSection = ({ onGameSelect, onGameExit, exitGame }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  
  // Memoize cosmic particles to avoid recalculation on every render
  const cosmicParticles = useMemo(() => 
    [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 10,
      animationDuration: 15 + Math.random() * 10
    })), []
  );
  
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
      background: crashGameImg ? `url(${crashGameImg}) center/cover no-repeat` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      background: rouletteImg ? `url(${rouletteImg}) center/cover no-repeat` : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
      background: minesGameImg ? `url(${minesGameImg}) center/cover no-repeat` : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
      background: diceGameImg ? `url(${diceGameImg}) center/cover no-repeat` : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(250, 112, 154, 0.9), rgba(254, 225, 64, 0.9))',
      minBet: 1,
      maxBet: 100,
      status: 'active',
      multiplier: '99x',
      particles: ['🎯', '🔥', '⚡']
    },
    {
      id: GAME_TYPES.COIN_FLIP,
      name: 'COIN FLIP',
      description: 'Heads or tails - classic coin flip',
      icon: '🪙',
      secondaryIcon: '🎆',
      background: coinFlipImg ? `url(${coinFlipImg}) center/cover no-repeat` : 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(255, 193, 7, 0.9), rgba(255, 152, 0, 0.9))',
      minBet: 1,
      maxBet: 1000,
      status: 'active',
      multiplier: '2x',
      particles: ['🪙', '✨', '🎆']
    },
    {
      id: GAME_TYPES.LUCKY_WHEEL,
      name: 'LUCKY WHEEL',
      description: 'Spin the wheel of fortune',
      icon: '🎰',
      secondaryIcon: '🍀',
      background: luckyWheelImg ? `url(${luckyWheelImg}) center/cover no-repeat` : 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(139, 195, 74, 0.9))',
      minBet: 5,
      maxBet: 500,
      status: 'active',
      multiplier: '10x',
      particles: ['🍀', '🎆', '✨']
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

  // Memoize game card particles - now that games is defined
  const gamesWithParticles = useMemo(() => 
    games.map(game => ({
      ...game,
      particlePositions: game.particles.map((particle, i) => ({
        particle,
        left: 20 + (i * 25),
        top: 15 + (i * 20),
        animationDelay: i * 0.5
      }))
    })), []
  );

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
      {/* Background Effects - Removed cosmic-background for now */}
      {/* <div className="cosmic-background">
        <div className="stars-layer"></div>
        <div className="nebula-layer"></div>
        <div className="floating-particles">
          {cosmicParticles.map(particle => (
            <div 
              key={particle.id}
              className="cosmic-particle"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.animationDelay}s`,
                animationDuration: `${particle.animationDuration}s`
              }}
            />
          ))}
        </div>
      </div> */}

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
          {gamesWithParticles.map((game, index) => (
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
                {game.particlePositions.map((particleData, i) => (
                  <div 
                    key={i}
                    className="floating-particle"
                    style={{
                      left: `${particleData.left}%`,
                      top: `${particleData.top}%`,
                      animationDelay: `${particleData.animationDelay}s`
                    }}
                  >
                    {particleData.particle}
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