import React, { useState, useRef, useCallback } from 'react';
import './DiceGame.css';

const DiceGame = ({ onBack }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [dice1Result, setDice1Result] = useState(1);
  const [dice2Result, setDice2Result] = useState(1);
  const [prediction, setPrediction] = useState({ type: 'sum', value: 7 });
  const [gameHistory, setGameHistory] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  const dice1Ref = useRef(null);
  const dice2Ref = useRef(null);

  // Dice betting options
  const bettingOptions = [
    // Sum bets
    { type: 'sum', value: 7, name: 'Sum = 7', odds: 6, chance: 16.67 },
    { type: 'sum', value: 6, name: 'Sum = 6', odds: 7.2, chance: 13.89 },
    { type: 'sum', value: 8, name: 'Sum = 8', odds: 7.2, chance: 13.89 },
    { type: 'sum', value: 5, name: 'Sum = 5', odds: 9, chance: 11.11 },
    { type: 'sum', value: 9, name: 'Sum = 9', odds: 9, chance: 11.11 },
    { type: 'sum', value: 4, name: 'Sum = 4', odds: 12, chance: 8.33 },
    { type: 'sum', value: 10, name: 'Sum = 10', odds: 12, chance: 8.33 },
    { type: 'sum', value: 3, name: 'Sum = 3', odds: 18, chance: 5.56 },
    { type: 'sum', value: 11, name: 'Sum = 11', odds: 18, chance: 5.56 },
    { type: 'sum', value: 2, name: 'Sum = 2', odds: 36, chance: 2.78 },
    { type: 'sum', value: 12, name: 'Sum = 12', odds: 36, chance: 2.78 },
    
    // Range bets
    { type: 'range', value: 'low', name: 'Low (2-6)', odds: 2.2, chance: 41.67 },
    { type: 'range', value: 'high', name: 'High (8-12)', odds: 2.2, chance: 41.67 },
    { type: 'range', value: 'even', name: 'Even', odds: 2, chance: 50 },
    { type: 'range', value: 'odd', name: 'Odd', odds: 2, chance: 50 },
    
    // Special bets
    { type: 'double', value: 'any', name: 'Any Double', odds: 6, chance: 16.67 },
    { type: 'triple', value: 'specific', name: 'Specific Double', odds: 36, chance: 2.78 }
  ];

  // Get dice face rotation for 3D effect
  const getDiceRotation = (number) => {
    const rotations = {
      1: { x: 0, y: 0, z: 0 },
      2: { x: 0, y: 90, z: 0 },
      3: { x: 0, y: 0, z: 90 },
      4: { x: 0, y: 0, z: -90 },
      5: { x: 0, y: -90, z: 0 },
      6: { x: 180, y: 0, z: 0 }
    };
    return rotations[number] || rotations[1];
  };

  const rollDice = () => {
    if (isRolling || betAmount > balance || betAmount < 1) return;

    setIsRolling(true);
    setBalance(balance - betAmount);
    setLastWin(0);

    // Generate random dice results
    const result1 = Math.floor(Math.random() * 6) + 1;
    const result2 = Math.floor(Math.random() * 6) + 1;

    // Animate dice with multiple rotations
    const animateDice = (diceRef, finalResult) => {
      if (diceRef.current) {
        // Reset position
        diceRef.current.style.transition = 'none';
        diceRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
        
        setTimeout(() => {
          diceRef.current.style.transition = 'transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
          
          // Multiple rotations + final position
          const rotations = 8 + Math.random() * 4;
          const finalRotation = getDiceRotation(finalResult);
          
          diceRef.current.style.transform = `
            rotateX(${360 * rotations + finalRotation.x}deg) 
            rotateY(${360 * rotations + finalRotation.y}deg) 
            rotateZ(${360 * rotations + finalRotation.z}deg)
          `;
        }, 100);
      }
    };

    // Start animations
    animateDice(dice1Ref, result1);
    animateDice(dice2Ref, result2);

    // Calculate results after animation
    setTimeout(() => {
      setDice1Result(result1);
      setDice2Result(result2);
      
      const sum = result1 + result2;
      let isWin = false;
      let winMultiplier = 0;

      // Check winning conditions
      if (prediction.type === 'sum') {
        isWin = sum === prediction.value;
        const option = bettingOptions.find(opt => opt.type === 'sum' && opt.value === prediction.value);
        winMultiplier = option ? option.odds : 0;
      } else if (prediction.type === 'range') {
        if (prediction.value === 'low') {
          isWin = sum >= 2 && sum <= 6;
        } else if (prediction.value === 'high') {
          isWin = sum >= 8 && sum <= 12;
        } else if (prediction.value === 'even') {
          isWin = sum % 2 === 0;
        } else if (prediction.value === 'odd') {
          isWin = sum % 2 === 1;
        }
        const option = bettingOptions.find(opt => opt.type === 'range' && opt.value === prediction.value);
        winMultiplier = option ? option.odds : 0;
      } else if (prediction.type === 'double') {
        if (prediction.value === 'any') {
          isWin = result1 === result2;
          winMultiplier = 6;
        } else if (prediction.value === result1 && result1 === result2) {
          isWin = true;
          winMultiplier = 36;
        }
      }

      const winAmount = isWin ? betAmount * winMultiplier : 0;
      
      if (isWin) {
        setBalance(prev => prev + winAmount);
        setLastWin(winAmount);
      }

      // Add to history
      setGameHistory(prev => [{
        dice1: result1,
        dice2: result2,
        sum,
        prediction,
        isWin,
        winAmount,
        betAmount
      }, ...prev.slice(0, 9)]);

      setIsRolling(false);
    }, 3000);
  };

  const getCurrentOption = () => {
    return bettingOptions.find(opt => 
      opt.type === prediction.type && opt.value === prediction.value
    );
  };

  const currentOption = getCurrentOption();

  return (
    <div className="dice-game">
      {/* Header */}
      <div className="dice-game-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="game-title">3D Dice</h1>
        <div className="balance-display">
          Balance: {balance}🪙
        </div>
      </div>

      <div className="dice-game-container">
        {/* 3D Dice Display */}
        <div className="dice-display-area">
          <div className="dice-table">
            <div className="dice-arena">
              {/* Dice 1 */}
              <div className="dice-wrapper">
                <div 
                  ref={dice1Ref}
                  className={`dice-3d ${isRolling ? 'rolling' : ''}`}
                >
                  <div className="dice-face front">⚀</div>
                  <div className="dice-face back">⚅</div>
                  <div className="dice-face right">⚁</div>
                  <div className="dice-face left">⚄</div>
                  <div className="dice-face top">⚂</div>
                  <div className="dice-face bottom">⚃</div>
                </div>
              </div>

              {/* Dice 2 */}
              <div className="dice-wrapper">
                <div 
                  ref={dice2Ref}
                  className={`dice-3d ${isRolling ? 'rolling' : ''}`}
                >
                  <div className="dice-face front">⚀</div>
                  <div className="dice-face back">⚅</div>
                  <div className="dice-face right">⚁</div>
                  <div className="dice-face left">⚄</div>
                  <div className="dice-face top">⚂</div>
                  <div className="dice-face bottom">⚃</div>
                </div>
              </div>
            </div>

            {/* Result Display */}
            {!isRolling && dice1Result && dice2Result && (
              <div className="dice-result-display">
                <div className="result-summary">
                  <div className="dice-values">
                    <span className="dice-value">{dice1Result}</span>
                    <span className="plus">+</span>
                    <span className="dice-value">{dice2Result}</span>
                    <span className="equals">=</span>
                    <span className="sum-value">{dice1Result + dice2Result}</span>
                  </div>
                  
                  {lastWin > 0 && (
                    <div className="win-display">
                      <div className="win-text">YOU WON!</div>
                      <div className="win-amount">{lastWin}🪙</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Controls */}
        <div className="dice-controls-panel">
          {/* Betting Options */}
          <div className="betting-section">
            <h3>Choose Your Bet:</h3>
            
            {/* Sum Bets */}
            <div className="bet-category">
              <h4>Sum Bets</h4>
              <div className="bet-grid">
                {bettingOptions.filter(opt => opt.type === 'sum').map((option, index) => (
                  <button
                    key={index}
                    className={`bet-option ${prediction.type === 'sum' && prediction.value === option.value ? 'selected' : ''}`}
                    onClick={() => setPrediction({ type: 'sum', value: option.value })}
                    disabled={isRolling}
                  >
                    <div className="bet-name">{option.name}</div>
                    <div className="bet-odds">{option.odds}x</div>
                    <div className="bet-chance">{option.chance}%</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Range Bets */}
            <div className="bet-category">
              <h4>Range Bets</h4>
              <div className="bet-grid">
                {bettingOptions.filter(opt => opt.type === 'range').map((option, index) => (
                  <button
                    key={index}
                    className={`bet-option ${prediction.type === 'range' && prediction.value === option.value ? 'selected' : ''}`}
                    onClick={() => setPrediction({ type: 'range', value: option.value })}
                    disabled={isRolling}
                  >
                    <div className="bet-name">{option.name}</div>
                    <div className="bet-odds">{option.odds}x</div>
                    <div className="bet-chance">{option.chance}%</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Bets */}
            <div className="bet-category">
              <h4>Special Bets</h4>
              <div className="bet-grid">
                <button
                  className={`bet-option ${prediction.type === 'double' && prediction.value === 'any' ? 'selected' : ''}`}
                  onClick={() => setPrediction({ type: 'double', value: 'any' })}
                  disabled={isRolling}
                >
                  <div className="bet-name">Any Double</div>
                  <div className="bet-odds">6x</div>
                  <div className="bet-chance">16.67%</div>
                </button>
              </div>
            </div>
          </div>

          {/* Bet Controls */}
          <div className="bet-controls">
            <label>Bet Amount:</label>
            <div className="bet-amount-controls">
              <button 
                onClick={() => setBetAmount(Math.max(1, betAmount - 5))}
                disabled={isRolling}
              >
                -5
              </button>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={balance}
                disabled={isRolling}
              />
              <button 
                onClick={() => setBetAmount(Math.min(balance, betAmount + 5))}
                disabled={isRolling}
              >
                +5
              </button>
            </div>

            {/* Quick Bets */}
            <div className="quick-bets">
              {[10, 25, 50, 100].map(amount => (
                <button
                  key={amount}
                  className="quick-bet-btn"
                  onClick={() => setBetAmount(Math.min(balance, amount))}
                  disabled={isRolling || amount > balance}
                >
                  {amount}🪙
                </button>
              ))}
            </div>
          </div>

          {/* Game Info */}
          {currentOption && (
            <div className="game-info">
              <div className="info-item">
                <span>Current Bet:</span>
                <span>{currentOption.name}</span>
              </div>
              <div className="info-item">
                <span>Win Chance:</span>
                <span>{currentOption.chance}%</span>
              </div>
              <div className="info-item">
                <span>Multiplier:</span>
                <span>{currentOption.odds}x</span>
              </div>
              <div className="info-item">
                <span>Potential Win:</span>
                <span className="potential-win">{betAmount * currentOption.odds}🪙</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="action-section">
            <button
              className="roll-btn"
              onClick={rollDice}
              disabled={isRolling || betAmount > balance || betAmount < 1}
            >
              {isRolling ? 'Rolling Dice...' : 'ROLL DICE'}
            </button>
          </div>
        </div>
      </div>

      {/* Game History */}
      <div className="game-history">
        <h3>Recent Rolls</h3>
        <div className="history-items">
          {gameHistory.map((roll, index) => (
            <div key={index} className={`history-item ${roll.isWin ? 'win' : 'lose'}`}>
              <div className="roll-dice">
                <span className="dice-result">{roll.dice1}</span>
                <span className="dice-result">{roll.dice2}</span>
              </div>
              <div className="roll-sum">Sum: {roll.sum}</div>
              <div className={`roll-status ${roll.isWin ? 'win' : 'lose'}`}>
                {roll.isWin ? `+${roll.winAmount}🪙` : `-${roll.betAmount}🪙`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiceGame;