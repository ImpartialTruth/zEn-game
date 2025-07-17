import React, { useState } from 'react';
import './CoinFlipGame.css';

const CoinFlipGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('idle'); // idle, flipping, result
  const [betAmount, setBetAmount] = useState('');
  const [selectedSide, setSelectedSide] = useState('');\n  const [result, setResult] = useState(null);
  const [isWin, setIsWin] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);

  const flipCoin = () => {
    if (!betAmount || !selectedSide) return;
    
    setGameState('flipping');
    
    // Random result
    const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
    const rotations = Math.floor(Math.random() * 5) + 8; // 8-12 rotations
    
    setCoinRotation(rotations * 360 + (coinResult === 'heads' ? 0 : 180));
    
    setTimeout(() => {
      setResult(coinResult);
      setIsWin(coinResult === selectedSide);
      setGameState('result');
    }, 2000);
  };

  const resetGame = () => {
    setGameState('idle');
    setResult(null);
    setIsWin(false);
    setCoinRotation(0);
    setBetAmount('');
    setSelectedSide('');
  };

  return (
    <div className="coin-flip-game">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Games
        </button>
        <h2 className="game-title">Coin Flip</h2>
      </div>

      <div className="game-content">
        <div className="coin-display">
          <div className="coin-container">
            <div 
              className={`coin ${gameState === 'flipping' ? 'flipping' : ''}`}
              style={{ transform: `rotateY(${coinRotation}deg)` }}
            >
              <div className="coin-side heads">
                <div className="coin-face">
                  <div className="coin-symbol">Z</div>
                  <div className="coin-text">HEADS</div>
                </div>
              </div>
              <div className="coin-side tails">
                <div className="coin-face">
                  <div className="coin-symbol">🧘</div>
                  <div className="coin-text">TAILS</div>
                </div>
              </div>
            </div>
          </div>
          
          {gameState === 'result' && (
            <div className={`result-display ${isWin ? 'win' : 'lose'}`}>
              <div className="result-icon">
                {isWin ? '🎉' : '😔'}
              </div>
              <div className="result-text">
                {isWin ? 'You Win!' : 'You Lose!'}
              </div>
              <div className="result-amount">
                {isWin ? `+${(parseFloat(betAmount) * 2).toFixed(2)}` : `-${betAmount}`} 🪙
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
                  min="5"
                  max="500"
                  disabled={gameState !== 'idle'}
                />
                <span className="currency-symbol">🪙</span>
              </div>
            </div>

            <div className="side-selection">
              <label>Choose Side</label>
              <div className="side-buttons">
                <button 
                  className={`side-button heads ${selectedSide === 'heads' ? 'selected' : ''}`}
                  onClick={() => setSelectedSide('heads')}
                  disabled={gameState !== 'idle'}
                >
                  <div className="side-icon">Z</div>
                  <div className="side-label">Heads</div>
                </button>
                <button 
                  className={`side-button tails ${selectedSide === 'tails' ? 'selected' : ''}`}
                  onClick={() => setSelectedSide('tails')}
                  disabled={gameState !== 'idle'}
                >
                  <div className="side-icon">🧘</div>
                  <div className="side-label">Tails</div>
                </button>
              </div>
            </div>
          </div>

          <div className="action-section">
            {gameState === 'idle' && (
              <button 
                className="flip-button"
                onClick={flipCoin}
                disabled={!betAmount || !selectedSide}
              >
                <span className="flip-icon">🪙</span>
                Flip Coin
              </button>
            )}
            
            {gameState === 'flipping' && (
              <button className="flip-button flipping" disabled>
                <div className="loading-spinner"></div>
                Flipping...
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
                <span className="info-title">Game Rules</span>
              </div>
              <div className="info-content">
                <ul className="rules-list">
                  <li>Choose Heads or Tails</li>
                  <li>Place your bet (5-500 coins)</li>
                  <li>Win 2x your bet if correct</li>
                  <li>50/50 chance for each side</li>
                </ul>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-label">Payout:</span>
                <span className="stat-value">2:1</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Your Bet:</span>
                <span className="stat-value">{betAmount || '0'} 🪙</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Potential Win:</span>
                <span className="stat-value">
                  {betAmount ? (parseFloat(betAmount) * 2).toFixed(2) : '0'} 🪙
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinFlipGame;