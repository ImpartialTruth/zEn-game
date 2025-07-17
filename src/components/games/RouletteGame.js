import React, { useState, useCallback } from 'react';
import './RouletteGame.css';

const RouletteGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, spinning, result
  const [betAmount, setBetAmount] = useState('10');
  const [selectedBets, setSelectedBets] = useState([]);
  const [spinResult, setSpinResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);

  // Roulette numbers with colors
  const rouletteNumbers = [
    { number: 0, color: 'green' },
    { number: 32, color: 'red' }, { number: 15, color: 'black' }, { number: 19, color: 'red' },
    { number: 4, color: 'black' }, { number: 21, color: 'red' }, { number: 2, color: 'black' },
    { number: 25, color: 'red' }, { number: 17, color: 'black' }, { number: 34, color: 'red' },
    { number: 6, color: 'black' }, { number: 27, color: 'red' }, { number: 13, color: 'black' },
    { number: 36, color: 'red' }, { number: 11, color: 'black' }, { number: 30, color: 'red' },
    { number: 8, color: 'black' }, { number: 23, color: 'red' }, { number: 10, color: 'black' },
    { number: 5, color: 'red' }, { number: 24, color: 'black' }, { number: 16, color: 'red' },
    { number: 33, color: 'black' }, { number: 1, color: 'red' }, { number: 20, color: 'black' },
    { number: 14, color: 'red' }, { number: 31, color: 'black' }, { number: 9, color: 'red' },
    { number: 22, color: 'black' }, { number: 18, color: 'red' }, { number: 29, color: 'black' },
    { number: 7, color: 'red' }, { number: 28, color: 'black' }, { number: 12, color: 'red' },
    { number: 35, color: 'black' }, { number: 3, color: 'red' }, { number: 26, color: 'black' }
  ];

  const betTypes = [
    { id: 'red', name: 'Red', payout: 2, color: '#dc3545' },
    { id: 'black', name: 'Black', payout: 2, color: '#000' },
    { id: 'even', name: 'Even', payout: 2, color: '#6c757d' },
    { id: 'odd', name: 'Odd', payout: 2, color: '#6c757d' },
    { id: '1-18', name: '1-18', payout: 2, color: '#28a745' },
    { id: '19-36', name: '19-36', payout: 2, color: '#28a745' }
  ];

  const placeBet = (betType) => {
    if (gameState !== 'waiting' || !betAmount || parseFloat(betAmount) < 1) return;
    
    const existingBet = selectedBets.find(bet => bet.type === betType.id);
    if (existingBet) {
      // Increase bet amount
      setSelectedBets(prev => 
        prev.map(bet => 
          bet.type === betType.id 
            ? { ...bet, amount: bet.amount + parseFloat(betAmount) }
            : bet
        )
      );
    } else {
      // Add new bet
      setSelectedBets(prev => [...prev, {
        type: betType.id,
        name: betType.name,
        amount: parseFloat(betAmount),
        payout: betType.payout
      }]);
    }
  };

  const clearBets = () => {
    setSelectedBets([]);
  };

  const spin = () => {
    if (selectedBets.length === 0) return;
    
    setGameState('spinning');
    setIsSpinning(true);
    
    // Generate random result
    const resultIndex = Math.floor(Math.random() * rouletteNumbers.length);
    const result = rouletteNumbers[resultIndex];
    
    // Simulate spin duration
    setTimeout(() => {
      setSpinResult(result);
      setIsSpinning(false);
      setGameState('result');
      
      // Calculate winnings
      let totalWinnings = 0;
      selectedBets.forEach(bet => {
        if (checkWin(bet, result)) {
          totalWinnings += bet.amount * bet.payout;
        }
      });
      
      setWinnings(totalWinnings);
      
      // Add to history
      setGameHistory(prev => [result, ...prev.slice(0, 9)]);
      
      // Auto reset after showing result
      setTimeout(() => {
        setGameState('waiting');
        setSelectedBets([]);
        setWinnings(0);
        setSpinResult(null);
      }, 3000);
    }, 3000);
  };

  const checkWin = (bet, result) => {
    switch (bet.type) {
      case 'red':
        return result.color === 'red';
      case 'black':
        return result.color === 'black';
      case 'even':
        return result.number !== 0 && result.number % 2 === 0;
      case 'odd':
        return result.number !== 0 && result.number % 2 === 1;
      case '1-18':
        return result.number >= 1 && result.number <= 18;
      case '19-36':
        return result.number >= 19 && result.number <= 36;
      default:
        return false;
    }
  };

  const totalBetAmount = selectedBets.reduce((sum, bet) => sum + bet.amount, 0);

  return (
    <div className="roulette-game">
      <div className="roulette-header">
        <button className="back-button" onClick={onBack}>
          <span>←</span> Back
        </button>
        
        <div className="game-title">
          <div className="title-icon">🎯</div>
          <h2>Roulette</h2>
        </div>
        
        <div className="game-status">
          {gameState === 'waiting' && <span className="status-waiting">Place Bets</span>}
          {gameState === 'spinning' && <span className="status-spinning">Spinning...</span>}
          {gameState === 'result' && <span className="status-result">Result!</span>}
        </div>
      </div>

      {/* Game History */}
      <div className="game-history">
        {gameHistory.map((result, index) => (
          <div key={index} className={`history-item ${result.color}`}>
            <span className="history-number">{result.number}</span>
          </div>
        ))}
      </div>

      {/* Roulette Wheel */}
      <div className="roulette-container">
        <div className={`roulette-wheel ${isSpinning ? 'spinning' : ''}`}>
          <div className="wheel-center">
            <div className="center-logo">🎯</div>
          </div>
          {rouletteNumbers.map((num, index) => (
            <div 
              key={index}
              className={`wheel-number ${num.color} ${spinResult?.number === num.number ? 'winner' : ''}`}
              style={{
                transform: `rotate(${(360 / rouletteNumbers.length) * index}deg) translateY(-140px)`,
                transformOrigin: '0 140px'
              }}
            >
              {num.number}
            </div>
          ))}
        </div>
        
        <div className="wheel-pointer">▼</div>
        
        {spinResult && (
          <div className="result-display">
            <div className={`result-number ${spinResult.color}`}>
              {spinResult.number}
            </div>
            <div className="result-color">{spinResult.color.toUpperCase()}</div>
          </div>
        )}
      </div>

      {/* Betting Area */}
      <div className="betting-area">
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
        </div>

        <div className="bet-types">
          {betTypes.map(betType => (
            <button
              key={betType.id}
              className="bet-type-btn"
              onClick={() => placeBet(betType)}
              disabled={gameState !== 'waiting'}
              style={{ '--bet-color': betType.color }}
            >
              <span className="bet-name">{betType.name}</span>
              <span className="bet-payout">{betType.payout}:1</span>
            </button>
          ))}
        </div>

        {/* Selected Bets */}
        {selectedBets.length > 0 && (
          <div className="selected-bets">
            <div className="bets-header">
              <h4>Your Bets</h4>
              <span className="total-bet">Total: {totalBetAmount}🪙</span>
            </div>
            <div className="bets-list">
              {selectedBets.map((bet, index) => (
                <div key={index} className="bet-item">
                  <span className="bet-type">{bet.name}</span>
                  <span className="bet-amount">{bet.amount}🪙</span>
                  <span className="bet-potential">→ {bet.amount * bet.payout}🪙</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Controls */}
        <div className="game-controls">
          {gameState === 'waiting' && (
            <>
              <button 
                className="clear-bets-btn"
                onClick={clearBets}
                disabled={selectedBets.length === 0}
              >
                Clear Bets
              </button>
              <button 
                className="spin-btn"
                onClick={spin}
                disabled={selectedBets.length === 0}
              >
                <span className="btn-icon">🎲</span>
                <span>Spin</span>
              </button>
            </>
          )}
          
          {gameState === 'result' && winnings > 0 && (
            <div className="win-message">
              <span className="win-icon">🎉</span>
              <span>You won {winnings}🪙!</span>
            </div>
          )}
          
          {gameState === 'result' && winnings === 0 && (
            <div className="lose-message">
              <span className="lose-icon">😔</span>
              <span>Better luck next time!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouletteGame;