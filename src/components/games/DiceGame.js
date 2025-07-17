import React, { useState, useCallback } from 'react';
import './DiceGame.css';

const DiceGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, rolling, result
  const [betAmount, setBetAmount] = useState('10');
  const [prediction, setPrediction] = useState(50);
  const [rollResult, setRollResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [rollType, setRollType] = useState('over'); // 'over' or 'under'

  // Calculate multiplier based on prediction and roll type
  const calculateMultiplier = useCallback(() => {
    let winChance;
    if (rollType === 'over') {
      winChance = (100 - prediction) / 100;
    } else {
      winChance = prediction / 100;
    }
    
    if (winChance <= 0) return 1;
    
    // House edge of 1% (99% RTP)
    const multiplier = (0.99 / winChance);
    return Math.max(1.01, multiplier);
  }, [prediction, rollType]);

  const rollDice = () => {
    if (!betAmount || parseFloat(betAmount) < 1) return;
    
    setGameState('rolling');
    setIsRolling(true);
    
    // Generate random result (1-100)
    const result = Math.floor(Math.random() * 100) + 1;
    
    // Simulate roll duration
    setTimeout(() => {
      setRollResult(result);
      setIsRolling(false);
      setGameState('result');
      
      // Check if win
      let isWin = false;
      if (rollType === 'over') {
        isWin = result > prediction;
      } else {
        isWin = result < prediction;
      }
      
      const multiplier = calculateMultiplier();
      const totalWinnings = isWin ? parseFloat(betAmount) * multiplier : 0;
      setWinnings(totalWinnings);
      
      // Add to history
      setGameHistory(prev => [
        { result, prediction, rollType, win: isWin, multiplier: isWin ? multiplier : 0 },
        ...prev.slice(0, 9)
      ]);
      
      // Auto reset after showing result
      setTimeout(() => {
        setGameState('waiting');
        setWinnings(0);
        setRollResult(null);
      }, 3000);
    }, 2000);
  };

  const winChance = rollType === 'over' ? (100 - prediction) : prediction;
  const multiplier = calculateMultiplier();

  return (
    <div className="dice-game">
      <div className="dice-header">
        <button className="back-button" onClick={onBack}>
          <span>←</span> Back
        </button>
        
        <div className="game-title">
          <div className="title-icon">🎲</div>
          <h2>Dice</h2>
        </div>
        
        <div className="game-stats">
          <span className="multiplier">{multiplier.toFixed(2)}x</span>
          <span className="win-chance">{winChance}%</span>
        </div>
      </div>

      {/* Game History */}
      <div className="game-history">
        {gameHistory.map((game, index) => (
          <div key={index} className={`history-item ${game.win ? 'win' : 'lose'}`}>
            <span className="history-result">{game.result}</span>
            <span className="history-prediction">{game.rollType === 'over' ? '>' : '<'}{game.prediction}</span>
          </div>
        ))}
      </div>

      {/* Dice Display */}
      <div className="dice-container">
        <div className="dice-area">
          <div className={`dice ${isRolling ? 'rolling' : ''}`}>
            <div className="dice-face">
              {rollResult ? (
                <span className="dice-number">{rollResult}</span>
              ) : (
                <span className="dice-placeholder">?</span>
              )}
            </div>
          </div>
          
          {gameState === 'result' && (
            <div className="result-display">
              <div className={`result-status ${winnings > 0 ? 'win' : 'lose'}`}>
                {winnings > 0 ? 'WIN!' : 'LOSE'}
              </div>
              {winnings > 0 && (
                <div className="result-winnings">
                  +{winnings.toFixed(2)}🪙
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prediction Bar */}
        <div className="prediction-area">
          <div className="prediction-header">
            <span className="prediction-label">
              Roll {rollType === 'over' ? 'Over' : 'Under'}: {prediction}
            </span>
            <button 
              className="switch-type-btn"
              onClick={() => setRollType(rollType === 'over' ? 'under' : 'over')}
              disabled={gameState !== 'waiting'}
            >
              Switch to {rollType === 'over' ? 'Under' : 'Over'}
            </button>
          </div>
          
          <div className="prediction-slider-container">
            <div className="prediction-bar">
              <div 
                className={`prediction-fill ${rollType}`}
                style={{ 
                  width: rollType === 'over' ? `${100 - prediction}%` : `${prediction}%`,
                  [rollType === 'over' ? 'right' : 'left']: 0
                }}
              />
              <input
                type="range"
                min="1"
                max="99"
                value={prediction}
                onChange={(e) => setPrediction(parseInt(e.target.value))}
                className="prediction-slider"
                disabled={gameState !== 'waiting'}
              />
              <div className="prediction-marker" style={{ left: `${prediction}%` }}>
                <div className="marker-line"></div>
                <div className="marker-value">{prediction}</div>
              </div>
            </div>
            
            <div className="range-labels">
              <span className="range-start">1</span>
              <span className="range-end">100</span>
            </div>
          </div>
          
          <div className="prediction-info">
            <div className="info-item">
              <span className="info-label">Win Chance:</span>
              <span className="info-value">{winChance}%</span>
            </div>
            <div className="info-item">
              <span className="info-label">Multiplier:</span>
              <span className="info-value">{multiplier.toFixed(2)}x</span>
            </div>
            <div className="info-item">
              <span className="info-label">Potential Win:</span>
              <span className="info-value">{(parseFloat(betAmount || 0) * multiplier).toFixed(2)}🪙</span>
            </div>
          </div>
        </div>
      </div>

      {/* Betting Controls */}
      <div className="betting-controls">
        <div className="bet-input-section">
          <label>Bet Amount</label>
          <div className="bet-input-container">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              max="1000"
              className="bet-input"
              disabled={gameState !== 'waiting'}
            />
            <span className="currency">🪙</span>
          </div>
          
          <div className="quick-amounts">
            <button 
              className="quick-btn"
              onClick={() => setBetAmount('10')}
              disabled={gameState !== 'waiting'}
            >10</button>
            <button 
              className="quick-btn"
              onClick={() => setBetAmount('50')}
              disabled={gameState !== 'waiting'}
            >50</button>
            <button 
              className="quick-btn"
              onClick={() => setBetAmount('100')}
              disabled={gameState !== 'waiting'}
            >100</button>
          </div>
        </div>

        <div className="game-controls">
          {gameState === 'waiting' && (
            <button 
              className="roll-btn"
              onClick={rollDice}
              disabled={!betAmount || parseFloat(betAmount) < 1}
            >
              <span className="btn-icon">🎲</span>
              <span>Roll Dice</span>
            </button>
          )}
          
          {gameState === 'rolling' && (
            <div className="rolling-status">
              <span className="rolling-icon">🎲</span>
              <span>Rolling...</span>
            </div>
          )}
          
          {gameState === 'result' && (
            <div className="result-message">
              {winnings > 0 ? (
                <div className="win-message">
                  <span className="result-icon">🎉</span>
                  <span>You won {winnings.toFixed(2)}🪙!</span>
                </div>
              ) : (
                <div className="lose-message">
                  <span className="result-icon">😔</span>
                  <span>Better luck next time!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiceGame;