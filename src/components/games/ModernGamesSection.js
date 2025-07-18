import React, { useState, useEffect, useMemo } from 'react';
import { GAME_TYPES } from '../../utils/constants';
import CrashGame from './CrashGame';
import CoinFlipGame from './CoinFlipGame';
import LuckyWheelGame from './LuckyWheelGame';
import MinesGame from './MinesGame';
import RouletteGame from './RouletteGame';
import DiceGame from './DiceGame';
import ErrorBoundary from '../common/ErrorBoundary';
import './ModernGamesSection.css';

// Define fallback gradients for each game type
const gameAssets = {
  crash: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🚀',
    colors: ['#667eea', '#764ba2']
  },
  roulette: {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '🎯', 
    colors: ['#f093fb', '#f5576c']
  },
  plinko: {
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    icon: '⚪',
    colors: ['#a8edea', '#fed6e3']
  },
  mines: {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '💎',
    colors: ['#4facfe', '#00f2fe']
  },
  dice: {
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: '🎲',
    colors: ['#fa709a', '#fee140']
  },
  coinFlip: {
    gradient: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
    icon: '🪙',
    colors: ['#feca57', '#ff9ff3']
  },
  luckyWheel: {
    gradient: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
    icon: '🎰',
    colors: ['#48dbfb', '#0abde3']
  }
};

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
      background: gameAssets.crash.gradient,
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
      background: gameAssets.roulette.gradient,
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
      background: gameAssets.plinko.gradient,
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
      background: gameAssets.mines.gradient,
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
      background: gameAssets.dice.gradient,
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
      background: gameAssets.coinFlip.gradient,
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
      background: gameAssets.luckyWheel.gradient,
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
          <ErrorBoundary onBack={handleBackToSelection}>
            {renderGameComponent()}
          </ErrorBoundary>
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