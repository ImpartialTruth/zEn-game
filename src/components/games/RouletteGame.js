import React, { useState, useEffect, useRef } from 'react';
import './RouletteGame.css';

const RouletteGame = ({ onBack }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [winningNumber, setWinningNumber] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [totalBet, setTotalBet] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const wheelRef = useRef(null);

  // Roulette numbers in European order
  const rouletteNumbers = [
    { number: 0, color: 'green' },
    { number: 32, color: 'red' },
    { number: 15, color: 'black' },
    { number: 19, color: 'red' },
    { number: 4, color: 'black' },
    { number: 21, color: 'red' },
    { number: 2, color: 'black' },
    { number: 25, color: 'red' },
    { number: 17, color: 'black' },
    { number: 34, color: 'red' },
    { number: 6, color: 'black' },
    { number: 27, color: 'red' },
    { number: 13, color: 'black' },
    { number: 36, color: 'red' },
    { number: 11, color: 'black' },
    { number: 30, color: 'red' },
    { number: 8, color: 'black' },
    { number: 23, color: 'red' },
    { number: 10, color: 'black' },
    { number: 5, color: 'red' },
    { number: 24, color: 'black' },
    { number: 16, color: 'red' },
    { number: 33, color: 'black' },
    { number: 1, color: 'red' },
    { number: 20, color: 'black' },
    { number: 14, color: 'red' },
    { number: 31, color: 'black' },
    { number: 9, color: 'red' },
    { number: 22, color: 'black' },
    { number: 18, color: 'red' },
    { number: 29, color: 'black' },
    { number: 7, color: 'red' },
    { number: 28, color: 'black' },
    { number: 12, color: 'red' },
    { number: 35, color: 'black' },
    { number: 3, color: 'red' },
    { number: 26, color: 'black' }
  ];

  // Betting options
  const bettingOptions = [
    { name: 'Red', type: 'color', value: 'red', multiplier: 2 },
    { name: 'Black', type: 'color', value: 'black', multiplier: 2 },
    { name: 'Even', type: 'even', value: 'even', multiplier: 2 },
    { name: 'Odd', type: 'odd', value: 'odd', multiplier: 2 },
    { name: '1-18', type: 'range', value: 'low', multiplier: 2 },
    { name: '19-36', type: 'range', value: 'high', multiplier: 2 },
    { name: '1st 12', type: 'dozen', value: 'first', multiplier: 3 },
    { name: '2nd 12', type: 'dozen', value: 'second', multiplier: 3 },
    { name: '3rd 12', type: 'dozen', value: 'third', multiplier: 3 }
  ];

  const handleNumberSelect = (number) => {
    if (isSpinning) return;
    
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
      setTotalBet(totalBet - betAmount);
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
      setTotalBet(totalBet + betAmount);
    }
  };

  const handleBetTypeSelect = (betType) => {
    if (isSpinning) return;
    
    if (selectedNumbers.includes(betType)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== betType));
      setTotalBet(totalBet - betAmount);
    } else {
      setSelectedNumbers([...selectedNumbers, betType]);
      setTotalBet(totalBet + betAmount);
    }
  };

  const spinWheel = () => {
    if (isSpinning || selectedNumbers.length === 0 || totalBet > balance) return;

    setIsSpinning(true);
    setBalance(balance - totalBet);
    setWinningNumber(null);
    setLastWin(0);

    // Generate random winning number
    const randomIndex = Math.floor(Math.random() * rouletteNumbers.length);
    const winning = rouletteNumbers[randomIndex];

    // Animate wheel spin
    if (wheelRef.current) {
      const rotation = 360 * 5 + (randomIndex * (360 / rouletteNumbers.length));
      wheelRef.current.style.transform = `rotate(${rotation}deg)`;
    }

    // Calculate winnings after animation
    setTimeout(() => {
      setWinningNumber(winning);
      let totalWinnings = 0;

      selectedNumbers.forEach(bet => {
        if (typeof bet === 'number') {
          // Direct number bet
          if (bet === winning.number) {
            totalWinnings += betAmount * 36;
          }
        } else if (typeof bet === 'object') {
          // Bet type
          let isWin = false;
          
          if (bet.type === 'color' && winning.color === bet.value) {
            isWin = true;
          } else if (bet.type === 'even' && winning.number % 2 === 0 && winning.number !== 0) {
            isWin = true;
          } else if (bet.type === 'odd' && winning.number % 2 === 1) {
            isWin = true;
          } else if (bet.type === 'range') {
            if (bet.value === 'low' && winning.number >= 1 && winning.number <= 18) {
              isWin = true;
            } else if (bet.value === 'high' && winning.number >= 19 && winning.number <= 36) {
              isWin = true;
            }
          } else if (bet.type === 'dozen') {
            if (bet.value === 'first' && winning.number >= 1 && winning.number <= 12) {
              isWin = true;
            } else if (bet.value === 'second' && winning.number >= 13 && winning.number <= 24) {
              isWin = true;
            } else if (bet.value === 'third' && winning.number >= 25 && winning.number <= 36) {
              isWin = true;
            }
          }

          if (isWin) {
            totalWinnings += betAmount * bet.multiplier;
          }
        }
      });

      setLastWin(totalWinnings);
      setBalance(prev => prev + totalWinnings);
      setGameHistory([winning, ...gameHistory.slice(0, 9)]);
      setSelectedNumbers([]);
      setTotalBet(0);
      setIsSpinning(false);
    }, 3000);
  };

  const clearBets = () => {
    if (isSpinning) return;
    setSelectedNumbers([]);
    setTotalBet(0);
  };

  return (
    <div className="roulette-game">
      <div className="roulette-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="game-title">European Roulette</h1>
        <div className="balance-display">
          Balance: {balance}🪙
        </div>
      </div>

      <div className="roulette-container">
        {/* Roulette Wheel */}
        <div className="wheel-container">
          <div className="wheel-wrapper">
            <div className="wheel-pointer">▼</div>
            <div
              ref={wheelRef}
              className={`roulette-wheel ${isSpinning ? 'spinning' : ''}`}
            >
              {rouletteNumbers.map((item, index) => (
                <div
                  key={index}
                  className={`wheel-number ${item.color}`}
                  style={{
                    transform: `rotate(${index * (360 / rouletteNumbers.length)}deg)`
                  }}
                >
                  {item.number}
                </div>
              ))}
            </div>
          </div>
          
          {winningNumber && (
            <div className="winning-display">
              <div className={`winning-number ${winningNumber.color}`}>
                {winningNumber.number}
              </div>
              {lastWin > 0 && (
                <div className="win-amount">
                  Won: {lastWin}🪙
                </div>
              )}
            </div>
          )}
        </div>

        {/* Betting Board */}
        <div className="betting-board">
          {/* Number Grid */}
          <div className="numbers-grid">
            <div className="zero-section">
              <button
                className={`number-btn green ${selectedNumbers.includes(0) ? 'selected' : ''}`}
                onClick={() => handleNumberSelect(0)}
              >
                0
              </button>
            </div>
            
            <div className="numbers-section">
              {Array.from({ length: 36 }, (_, i) => i + 1).map(number => {
                const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(number);
                return (
                  <button
                    key={number}
                    className={`number-btn ${isRed ? 'red' : 'black'} ${selectedNumbers.includes(number) ? 'selected' : ''}`}
                    onClick={() => handleNumberSelect(number)}
                  >
                    {number}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outside Bets */}
          <div className="outside-bets">
            {bettingOptions.map((option, index) => (
              <button
                key={index}
                className={`bet-btn ${selectedNumbers.includes(option) ? 'selected' : ''}`}
                onClick={() => handleBetTypeSelect(option)}
              >
                {option.name}
                <span className="multiplier">{option.multiplier}x</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="game-controls">
        <div className="bet-controls">
          <label>Bet Amount:</label>
          <div className="bet-amount-controls">
            <button onClick={() => setBetAmount(Math.max(1, betAmount - 5))}>-5</button>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="100"
            />
            <button onClick={() => setBetAmount(betAmount + 5)}>+5</button>
          </div>
        </div>

        <div className="bet-info">
          <div>Total Bet: {totalBet}🪙</div>
          <div>Selected: {selectedNumbers.length} bets</div>
        </div>

        <div className="action-buttons">
          <button 
            className="clear-btn" 
            onClick={clearBets}
            disabled={isSpinning}
          >
            Clear Bets
          </button>
          <button 
            className="spin-btn" 
            onClick={spinWheel}
            disabled={isSpinning || selectedNumbers.length === 0 || totalBet > balance}
          >
            {isSpinning ? 'Spinning...' : 'SPIN'}
          </button>
        </div>
      </div>

      {/* Game History */}
      <div className="game-history">
        <h3>Recent Numbers</h3>
        <div className="history-numbers">
          {gameHistory.map((result, index) => (
            <div key={index} className={`history-number ${result.color}`}>
              {result.number}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouletteGame;