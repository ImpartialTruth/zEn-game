import React, { useState, useRef } from 'react';
import './LuckyWheelGame.css';

const LuckyWheelGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('idle'); // idle, spinning, result
  const [betAmount, setBetAmount] = useState('');
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  const wheelSections = [
    { id: 1, label: '2x', multiplier: 2, color: '#ff6b6b', angle: 0 },
    { id: 2, label: '1.5x', multiplier: 1.5, color: '#feca57', angle: 45 },
    { id: 3, label: '0.5x', multiplier: 0.5, color: '#48dbfb', angle: 90 },
    { id: 4, label: '3x', multiplier: 3, color: '#ff9ff3', angle: 135 },
    { id: 5, label: '1x', multiplier: 1, color: '#54a0ff', angle: 180 },
    { id: 6, label: '5x', multiplier: 5, color: '#5f27cd', angle: 225 },
    { id: 7, label: '0x', multiplier: 0, color: '#222f3e', angle: 270 },
    { id: 8, label: '10x', multiplier: 10, color: '#00d2d3', angle: 315 }
  ];

  const spinWheel = () => {
    if (!betAmount || isSpinning) return;
    
    setIsSpinning(true);
    setGameState('spinning');
    
    // Random result
    const randomIndex = Math.floor(Math.random() * wheelSections.length);
    const winningSection = wheelSections[randomIndex];
    
    // Calculate rotation
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const targetAngle = 360 - winningSection.angle; // Invert because wheel spins clockwise
    const finalRotation = rotation + (spins * 360) + targetAngle;
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      setResult(winningSection);
      setIsSpinning(false);
      setGameState('result');
    }, 4000);
  };

  const resetGame = () => {
    setGameState('idle');
    setResult(null);
    setBetAmount('');
  };

  const calculateWinnings = () => {
    if (!result || !betAmount) return 0;
    return parseFloat(betAmount) * result.multiplier;
  };

  return (
    <div className="lucky-wheel-game">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Games
        </button>
        <h2 className="game-title">Lucky Wheel</h2>
      </div>

      <div className="game-content">
        <div className="wheel-display">
          <div className="wheel-container">
            <div className="wheel-pointer">
              <div className="pointer-triangle"></div>
            </div>
            <div 
              ref={wheelRef}
              className={`wheel ${isSpinning ? 'spinning' : ''}`}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {wheelSections.map((section, index) => (
                <div
                  key={section.id}
                  className="wheel-section"
                  style={{
                    backgroundColor: section.color,
                    transform: `rotate(${section.angle}deg)`,
                    zIndex: wheelSections.length - index
                  }}
                >
                  <div className="section-content">
                    <div className="section-label">{section.label}</div>
                  </div>
                </div>
              ))}
              <div className="wheel-center">
                <div className="center-logo">🎡</div>
              </div>
            </div>
          </div>
          
          {gameState === 'result' && result && (
            <div className="result-display">
              <div className="result-section" style={{ backgroundColor: result.color }}>
                <div className="result-multiplier">{result.label}</div>
              </div>
              <div className="result-text">
                {result.multiplier > 0 ? 'You Win!' : 'Better Luck Next Time!'}
              </div>
              <div className="result-amount">
                {result.multiplier > 0 ? '+' : ''}{calculateWinnings().toFixed(2)} 🪙
              </div>
            </div>
          )}
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
                  min="20"
                  max="200"
                  disabled={gameState !== 'idle'}
                />
                <span className="currency-symbol">🪙</span>
              </div>
            </div>

            <div className="wheel-prizes">
              <h3 className="prizes-title">Wheel Prizes</h3>
              <div className="prizes-grid">
                {wheelSections.map(section => (
                  <div key={section.id} className="prize-item">
                    <div 
                      className="prize-color"
                      style={{ backgroundColor: section.color }}
                    ></div>
                    <span className="prize-label">{section.label}</span>
                    <span className="prize-amount">
                      {betAmount ? (parseFloat(betAmount) * section.multiplier).toFixed(2) : '0'} 🪙
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="action-section">
            {gameState === 'idle' && (
              <button 
                className="spin-button"
                onClick={spinWheel}
                disabled={!betAmount}
              >
                <span className="spin-icon">🎡</span>
                Spin Wheel
              </button>
            )}
            
            {gameState === 'spinning' && (
              <button className="spin-button spinning" disabled>
                <div className="loading-spinner"></div>
                Spinning...
              </button>
            )}
            
            {gameState === 'result' && (
              <button 
                className="play-again-button"
                onClick={resetGame}
              >
                Play Again
              </button>
            )}
          </div>

          <div className="game-info">
            <div className="info-card">
              <div className="info-header">
                <span className="info-title">How to Play</span>
              </div>
              <div className="info-content">
                <ul className="rules-list">
                  <li>Place your bet (20-200 coins)</li>
                  <li>Spin the wheel</li>
                  <li>Win based on where it lands</li>
                  <li>Multipliers range from 0x to 10x</li>
                </ul>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-label">Your Bet:</span>
                <span className="stat-value">{betAmount || '0'} 🪙</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max Win:</span>
                <span className="stat-value">
                  {betAmount ? (parseFloat(betAmount) * 10).toFixed(2) : '0'} 🪙
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status:</span>
                <span className={`stat-value ${gameState}`}>
                  {gameState === 'idle' ? 'Ready' : 
                   gameState === 'spinning' ? 'Spinning' : 'Complete'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyWheelGame;