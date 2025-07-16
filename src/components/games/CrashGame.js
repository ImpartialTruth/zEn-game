import React, { useState, useEffect } from 'react';
import './CrashGame.css';

const CrashGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, crashed
  const [multiplier, setMultiplier] = useState(1.00);
  const [betAmount, setBetAmount] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [cashOutAt, setCashOutAt] = useState('');
  const [gameHistory, setGameHistory] = useState([2.34, 1.56, 8.92, 1.23, 5.67]);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let interval;
    
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setMultiplier(prev => {
          const newMultiplier = prev + 0.01;
          
          // Random crash logic
          const crashChance = Math.random();
          const crashProbability = 0.002 + (newMultiplier - 1) * 0.001;
          
          if (crashChance < crashProbability) {
            setGameState('crashed');
            setIsPlaying(false);
            
            // Add to history
            setGameHistory(prev => [newMultiplier, ...prev.slice(0, 4)]);
            
            // Start new game after delay
            setTimeout(() => {
              setMultiplier(1.00);
              setGameState('waiting');
              setCountdown(5);
            }, 3000);
            
            return newMultiplier;
          }
          
          return newMultiplier;
        });
      }, 50);
    }
    
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    let countdownInterval;
    
    if (countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(countdownInterval);
  }, [countdown]);

  const handlePlaceBet = () => {
    if (betAmount && gameState === 'waiting') {
      setIsPlaying(true);
      setGameState('playing');
    }
  };

  const handleCashOut = () => {
    if (isPlaying && gameState === 'playing') {
      setIsPlaying(false);
      // Calculate winnings
      const winnings = parseFloat(betAmount) * multiplier;
      // Add win logic here
      console.log(`Cashed out at ${multiplier.toFixed(2)}x for ${winnings.toFixed(2)} coins`);
    }
  };

  const getMultiplierColor = () => {
    if (gameState === 'crashed') return '#ff6b6b';
    if (multiplier < 2) return '#00BCD4';
    if (multiplier < 5) return '#FFC107';
    return '#4CAF50';
  };

  return (
    <div className="crash-game">
      <div className="game-header">
        <h2 className="game-title">🚀 Crash Game</h2>
      </div>

      <div className="game-content">
        <div className="game-display">
          <div className="multiplier-display">
            <div className="multiplier-container">
              <div 
                className={`multiplier-value ${gameState}`}
                style={{ color: getMultiplierColor() }}
              >
                {multiplier.toFixed(2)}x
              </div>
              {gameState === 'crashed' && (
                <div className="crashed-text">CRASHED!</div>
              )}
              {countdown > 0 && (
                <div className="countdown-text">
                  Starting in {countdown}...
                </div>
              )}
            </div>
            
            <div className="graph-container">
              <svg className="crash-chart" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                  </pattern>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)"/>
                
                {/* Crash line path */}
                <path
                  ref={pathRef => {
                    if (pathRef) {
                      const progress = Math.min((multiplier - 1) * 80, 350);
                      const curve = Math.log(multiplier) * 30;
                      const path = `M 20 180 Q ${progress / 2} ${180 - curve / 2} ${progress} ${180 - curve}`;
                      pathRef.setAttribute('d', path);
                    }
                  }}
                  stroke={getMultiplierColor()}
                  strokeWidth="3"
                  fill="none"
                  filter="url(#glow)"
                  className={`crash-line ${gameState}`}
                />
                
                {/* Airplane at the end of line */}
                {gameState === 'playing' && (
                  <g 
                    transform={`translate(${Math.min((multiplier - 1) * 80 + 20, 370)}, ${180 - Math.log(multiplier) * 30})`}
                    className="airplane"
                  >
                    <path
                      d="M-8,-2 L-3,-1 L8,0 L-3,1 L-8,2 L-5,0 Z"
                      fill={getMultiplierColor()}
                      className="airplane-body"
                    />
                    <circle cx="0" cy="0" r="8" fill="rgba(255,255,255,0.2)" className="airplane-glow"/>
                  </g>
                )}
                
                {/* Crash explosion effect */}
                {gameState === 'crashed' && (
                  <g 
                    transform={`translate(${Math.min((multiplier - 1) * 80 + 20, 370)}, ${180 - Math.log(multiplier) * 30})`}
                    className="crash-explosion"
                  >
                    <circle cx="0" cy="0" r="15" fill="#ff6b6b" opacity="0.8" className="explosion-circle"/>
                    <circle cx="0" cy="0" r="25" fill="#ff6b6b" opacity="0.4" className="explosion-circle-2"/>
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">💥</text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          <div className="game-history">
            <h3 className="history-title">Recent Games</h3>
            <div className="history-list">
              {gameHistory.map((mult, index) => (
                <div key={index} className="history-item">
                  <span className="history-multiplier">{mult.toFixed(2)}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="game-controls">
          <div className="betting-section">
            <div className="bet-input-group">
              <label htmlFor="bet-amount">Bet Amount</label>
              <div className="input-wrapper">
                <input
                  id="bet-amount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter bet amount"
                  min="10"
                  max="1000"
                  disabled={gameState === 'playing'}
                />
                <span className="currency-symbol">🪙</span>
              </div>
            </div>

            <div className="auto-cashout-group">
              <label htmlFor="cash-out-at">Auto Cash Out At</label>
              <div className="input-wrapper">
                <input
                  id="cash-out-at"
                  type="number"
                  value={cashOutAt}
                  onChange={(e) => setCashOutAt(e.target.value)}
                  placeholder="2.00"
                  min="1.01"
                  step="0.01"
                  disabled={gameState === 'playing'}
                />
                <span className="multiplier-symbol">x</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            {!isPlaying ? (
              <button 
                className="bet-button"
                onClick={handlePlaceBet}
                disabled={!betAmount || gameState === 'playing'}
              >
                {gameState === 'waiting' ? 'Place Bet' : 'Next Round'}
              </button>
            ) : (
              <button 
                className="cashout-button"
                onClick={handleCashOut}
                disabled={gameState === 'crashed'}
              >
                Cash Out ({(parseFloat(betAmount) * multiplier).toFixed(2)} 🪙)
              </button>
            )}
          </div>

          <div className="game-info">
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`info-value ${gameState}`}>
                {gameState === 'waiting' ? 'Waiting...' : 
                 gameState === 'playing' ? 'Playing' : 'Crashed'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Your Bet:</span>
              <span className="info-value">{betAmount || '0'} 🪙</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;