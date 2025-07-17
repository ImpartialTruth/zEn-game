import React, { useState } from 'react';
import './CoinFlipGame.css';

const CoinFlipGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('idle'); // idle, flipping, result
  const [betAmount, setBetAmount] = useState('');
  const [selectedSide, setSelectedSide] = useState('');
  const [result, setResult] = useState(null);
  const [isWin, setIsWin] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);

  const flipCoin = () => {
    if (!betAmount || !selectedSide) return;
    
    setGameState('flipping');
    
    // Random coin flip
    const coinResult = Math.random() > 0.5 ? 'heads' : 'tails';
    setResult(coinResult);
    
    // Animate coin rotation
    setCoinRotation(prev => prev + 1800); // 5 full rotations
    
    setTimeout(() => {
      const playerWins = selectedSide === coinResult;
      setIsWin(playerWins);
      setGameState('result');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setGameState('idle');
        setResult(null);
        setIsWin(false);
        setCoinRotation(0);
      }, 3000);
    }, 2000);
  };

  const handleQuickBet = (amount) => {
    setBetAmount(amount.toString());
  };

  return (
    <div className="coin-flip-game">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Games
        </button>
        <h1>Coin Flip</h1>
      </div>

      <div className="game-content">
        <div className="coin-container">
          <div 
            className={`coin ${gameState === 'flipping' ? 'flipping' : ''}`}
            style={{ transform: `rotateY(${coinRotation}deg)` }}
          >
            <div className="coin-front">
              <div className="coin-symbol">👑</div>
            </div>
            <div className="coin-back">
              <div className="coin-symbol">🪙</div>
            </div>
          </div>
        </div>

        <div className="game-controls">
          <div className="side-selection">
            <button 
              className={`side-btn ${selectedSide === 'heads' ? 'active' : ''}`}
              onClick={() => setSelectedSide('heads')}
              disabled={gameState !== 'idle'}
            >
              👑 Heads
            </button>
            <button 
              className={`side-btn ${selectedSide === 'tails' ? 'active' : ''}`}
              onClick={() => setSelectedSide('tails')}
              disabled={gameState !== 'idle'}
            >
              🪙 Tails
            </button>
          </div>

          <div className="bet-controls">
            <div className="bet-input">
              <label>Bet Amount:</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter bet amount"
                min="1"
                max="1000"
                disabled={gameState !== 'idle'}
              />
            </div>

            <div className="quick-bets">
              <button onClick={() => handleQuickBet(10)}>10</button>
              <button onClick={() => handleQuickBet(50)}>50</button>
              <button onClick={() => handleQuickBet(100)}>100</button>
              <button onClick={() => handleQuickBet(500)}>500</button>
            </div>
          </div>

          <button 
            className="flip-button"
            onClick={flipCoin}
            disabled={gameState !== 'idle' || !betAmount || !selectedSide}
          >
            {gameState === 'idle' ? 'Flip Coin' : 
             gameState === 'flipping' ? 'Flipping...' : 
             'Game Over'}
          </button>
        </div>

        {gameState === 'result' && (
          <div className={`result-display ${isWin ? 'win' : 'lose'}`}>
            <h2>{isWin ? 'You Won!' : 'You Lost!'}</h2>
            <p>Result: {result === 'heads' ? '👑 Heads' : '🪙 Tails'}</p>
            <p>Your choice: {selectedSide === 'heads' ? '👑 Heads' : '🪙 Tails'}</p>
            {isWin && <p>Winnings: {parseFloat(betAmount) * 2} coins</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinFlipGame;