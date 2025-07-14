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
        <button className="back-button" onClick={onBack}>
          ← Back to Games
        </button>
        <h2 className="game-title">Crash Game</h2>
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
              <div className="graph-line">
                <div 
                  className="graph-path"
                  style={{ 
                    width: `${Math.min((multiplier - 1) * 20, 100)}%`,
                    backgroundColor: getMultiplierColor()
                  }}
                ></div>
              </div>
              <div className="graph-grid">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid-line"></div>
                ))}
              </div>
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