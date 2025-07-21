import React, { useState, useRef, useEffect } from 'react';
import './CoinFlipGame.css';

const CoinFlipGame = ({ onBack }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedSide, setSelectedSide] = useState('');
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [result, setResult] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  const [coinRotation, setCoinRotation] = useState({ x: 0, y: 0, z: 0 });
  const coinRef = useRef(null);

  const flipCoin = () => {
    if (isFlipping || !selectedSide || betAmount > balance || betAmount < 1) return;

    setIsFlipping(true);
    setBalance(balance - betAmount);
    setResult(null);
    setLastWin(0);

    // Generate random result
    const coinResult = Math.random() > 0.5 ? 'heads' : 'tails';
    
    // 3D Coin animation - realistic flip with multiple rotations
    const flipDuration = 3000;
    const rotations = 8 + Math.random() * 4; // 8-12 rotations
    
    if (coinRef.current) {
      // Reset coin position
      coinRef.current.style.transition = 'none';
      coinRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
      
      setTimeout(() => {
        coinRef.current.style.transition = `transform ${flipDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
        
        // Calculate final position based on result
        const finalY = coinResult === 'heads' ? 0 : 180;
        const finalX = 360 * rotations;
        const finalZ = 360 * (rotations / 2);
        
        setCoinRotation({ x: finalX, y: finalY, z: finalZ });
        coinRef.current.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg) rotateZ(${finalZ}deg)`;
      }, 100);
    }

    // Calculate results after animation
    setTimeout(() => {
      const isWin = selectedSide === coinResult;
      const winAmount = isWin ? betAmount * 2 : 0;
      
      setResult({
        outcome: coinResult,
        isWin,
        winAmount,
        playerChoice: selectedSide
      });
      
      if (isWin) {
        setBalance(prev => prev + winAmount);
        setLastWin(winAmount);
      }
      
      // Add to history
      setGameHistory(prev => [{
        outcome: coinResult,
        playerChoice: selectedSide,
        isWin,
        betAmount,
        winAmount
      }, ...prev.slice(0, 9)]);
      
      setIsFlipping(false);
    }, flipDuration + 500);
  };

  const resetGame = () => {
    setResult(null);
    setSelectedSide('');
    setCoinRotation({ x: 0, y: 0, z: 0 });
    setLastWin(0);
    if (coinRef.current) {
      coinRef.current.style.transition = 'transform 0.5s ease';
      coinRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
    }
  };

  return (
    <div className="coin-flip-game">
      {/* Header */}
      <div className="coin-flip-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="game-title">Coin Flip</h1>
        <div className="balance-display">
          Balance: {balance}🪙
        </div>
      </div>

      <div className="coin-flip-container">
        {/* 3D Coin Display */}
        <div className="coin-display-area">
          <div className="coin-stage">
            <div className="coin-container-3d">
              <div 
                ref={coinRef}
                className={`coin-3d ${isFlipping ? 'flipping' : ''}`}
              >
                {/* Heads Side */}
                <div className="coin-face heads">
                  <div className="coin-inner">
                    <div className="coin-symbol">👑</div>
                    <div className="coin-text">HEADS</div>
                  </div>
                </div>
                
                {/* Tails Side */}
                <div className="coin-face tails">
                  <div className="coin-inner">
                    <div className="coin-symbol">💰</div>
                    <div className="coin-text">TAILS</div>
                  </div>
                </div>
                
                {/* Coin Edge */}
                <div className="coin-edge"></div>
              </div>
            </div>
            
            {/* Table Surface */}
            <div className="table-surface"></div>
          </div>
          
          {/* Result Display */}
          {result && (
            <div className={`result-display ${result.isWin ? 'win' : 'lose'}`}>
              <div className="result-header">
                <div className={`result-icon ${result.outcome}`}>
                  {result.outcome === 'heads' ? '👑' : '💰'}
                </div>
                <div className="result-text">
                  {result.isWin ? 'YOU WON!' : 'YOU LOST!'}
                </div>
              </div>
              <div className="result-details">
                <div>Result: {result.outcome === 'heads' ? '👑 Heads' : '💰 Tails'}</div>
                <div>Your Choice: {result.playerChoice === 'heads' ? '👑 Heads' : '💰 Tails'}</div>
                {result.isWin && (
                  <div className="win-amount">Won: {result.winAmount}🪙</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="game-controls-panel">
          {/* Side Selection */}
          <div className="side-selection">
            <label>Choose Your Side:</label>
            <div className="side-buttons">
              <button
                className={`side-btn heads ${selectedSide === 'heads' ? 'selected' : ''}`}
                onClick={() => setSelectedSide('heads')}
                disabled={isFlipping}
              >
                <div className="side-icon">👑</div>
                <div className="side-label">HEADS</div>
                <div className="side-payout">2x</div>
              </button>
              <button
                className={`side-btn tails ${selectedSide === 'tails' ? 'selected' : ''}`}
                onClick={() => setSelectedSide('tails')}
                disabled={isFlipping}
              >
                <div className="side-icon">💰</div>
                <div className="side-label">TAILS</div>
                <div className="side-payout">2x</div>
              </button>
            </div>
          </div>

          {/* Bet Controls */}
          <div className="bet-controls">
            <label>Bet Amount:</label>
            <div className="bet-amount-controls">
              <button 
                onClick={() => setBetAmount(Math.max(1, betAmount - 5))}
                disabled={isFlipping}
              >
                -5
              </button>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={balance}
                disabled={isFlipping}
              />
              <button 
                onClick={() => setBetAmount(Math.min(balance, betAmount + 5))}
                disabled={isFlipping}
              >
                +5
              </button>
            </div>
            
            {/* Quick Bet Buttons */}
            <div className="quick-bets">
              {[10, 25, 50, 100].map(amount => (
                <button
                  key={amount}
                  className="quick-bet-btn"
                  onClick={() => setBetAmount(Math.min(balance, amount))}
                  disabled={isFlipping || amount > balance}
                >
                  {amount}🪙
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="flip-btn"
              onClick={flipCoin}
              disabled={isFlipping || !selectedSide || betAmount > balance || betAmount < 1}
            >
              {isFlipping ? 'Flipping...' : 'FLIP COIN'}
            </button>
            
            {result && (
              <button
                className="reset-btn"
                onClick={resetGame}
                disabled={isFlipping}
              >
                Play Again
              </button>
            )}
          </div>

          {/* Game Stats */}
          <div className="game-stats">
            <div className="stat-item">
              <span>Potential Win:</span>
              <span className="stat-value">{betAmount * 2}🪙</span>
            </div>
            <div className="stat-item">
              <span>Win Chance:</span>
              <span className="stat-value">50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game History */}
      <div className="game-history">
        <h3>Recent Flips</h3>
        <div className="history-items">
          {gameHistory.map((flip, index) => (
            <div key={index} className={`history-item ${flip.isWin ? 'win' : 'lose'}`}>
              <div className="flip-result">
                {flip.outcome === 'heads' ? '👑' : '💰'}
              </div>
              <div className="flip-details">
                <div className="flip-outcome">{flip.outcome}</div>
                <div className={`flip-status ${flip.isWin ? 'win' : 'lose'}`}>
                  {flip.isWin ? `+${flip.winAmount}🪙` : `-${flip.betAmount}🪙`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoinFlipGame;