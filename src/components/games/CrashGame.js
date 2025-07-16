import React, { useState, useEffect, useRef } from 'react';
import './CrashGame.css';

const CrashGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, crashed
  const [multiplier, setMultiplier] = useState(1.00);
  const [betAmount, setBetAmount] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [cashOutAt, setCashOutAt] = useState('');
  const [gameHistory, setGameHistory] = useState([2.34, 1.56, 8.92, 1.23, 5.67]);
  const [countdown, setCountdown] = useState(0);
  const [userCashedOut, setUserCashedOut] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [autoCashOutEnabled, setAutoCashOutEnabled] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [flightPath, setFlightPath] = useState([]);
  const [airplanePosition, setAirplanePosition] = useState({ x: 50, y: 400 });

  // Initialize game with 10-second countdown on first load
  useEffect(() => {
    setCountdown(10);
  }, []);

  // Auto-start game cycle every 10 seconds
  useEffect(() => {
    if (gameState === 'waiting' && countdown === 0) {
      setCountdown(10);
    }
  }, [gameState, countdown]);

  useEffect(() => {
    let interval;
    
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setMultiplier(prev => {
          const newMultiplier = prev + 0.005 + (prev - 1) * 0.001;
          
          // Auto cash out logic
          if (autoCashOutEnabled && cashOutAt && parseFloat(cashOutAt) <= newMultiplier && isPlaying) {
            handleCashOut();
            return newMultiplier;
          }
          
          // Enhanced crash logic - more realistic
          const crashChance = Math.random();
          let crashProbability = 0.001;
          
          if (newMultiplier > 1.5) crashProbability += 0.0008;
          if (newMultiplier > 2.0) crashProbability += 0.002;
          if (newMultiplier > 5.0) crashProbability += 0.005;
          if (newMultiplier > 10.0) crashProbability += 0.01;
          
          if (crashChance < crashProbability) {
            setGameState('crashed');
            setIsPlaying(false);
            setUserCashedOut(false);
            
            // Add to history
            setGameHistory(prev => [newMultiplier, ...prev.slice(0, 4)]);
            
            // Start new game after delay
            setTimeout(() => {
              setMultiplier(1.00);
              setGameState('waiting');
              setFlightPath([]);
              setAirplanePosition({ x: 50, y: 400 });
              setWinnings(0);
            }, 3000);
            
            return newMultiplier;
          }
          
          // Update flight path - vertical movement in center
          const xPos = 50; // Always in center
          const yPos = 400 - (newMultiplier - 1) * 60; // Move up as multiplier increases
          
          setFlightPath(prev => [...prev, { x: xPos, y: yPos }]);
          setAirplanePosition({ x: xPos, y: yPos });
          
          return newMultiplier;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [gameState, autoCashOutEnabled, cashOutAt, isPlaying]);

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

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Simple grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw simple flight path
    if (flightPath.length > 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      
      // Scale coordinates for canvas
      const scaledPath = flightPath.map(point => ({
        x: (point.x / 100) * width,
        y: height - ((point.y - 200) / 200) * height
      }));
      
      // Draw simple line
      ctx.beginPath();
      ctx.moveTo(scaledPath[0].x, scaledPath[0].y);
      for (let i = 1; i < scaledPath.length; i++) {
        ctx.lineTo(scaledPath[i].x, scaledPath[i].y);
      }
      ctx.stroke();
    }
    
  }, [flightPath, multiplier, gameState]);

  const handlePlaceBet = () => {
    if (betAmount && gameState === 'waiting') {
      setIsPlaying(true);
      setUserCashedOut(false);
      setWinnings(0);
      setAutoCashOutEnabled(cashOutAt && parseFloat(cashOutAt) > 1.0);
      setFlightPath([{ x: 50, y: 400 }]);
      setAirplanePosition({ x: 50, y: 400 });
    }
  };

  const handleCashOut = () => {
    if (isPlaying && gameState === 'playing') {
      setIsPlaying(false);
      setUserCashedOut(true);
      // Calculate winnings
      const calculatedWinnings = parseFloat(betAmount) * multiplier;
      setWinnings(calculatedWinnings);
      console.log(`Cashed out at ${multiplier.toFixed(2)}x for ${calculatedWinnings.toFixed(2)} coins`);
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
        <h2 className="game-title">✈️ Aviator</h2>
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
              <canvas 
                ref={canvasRef}
                className="aviator-canvas"
                width="800"
                height="400"
              />
              <div className="flight-overlay">
                <div className="sky-gradient"></div>
                <div 
                  className={`airplane ${gameState}`}
                  style={{
                    left: `${airplanePosition.x}%`,
                    bottom: `${Math.min((airplanePosition.y - 200) / 200 * 100, 90)}%`,
                    transform: `translateX(-50%)`
                  }}
                >
                  <div className="airplane-body">
                    <div className="airplane-wing"></div>
                    <div className="airplane-tail"></div>
                  </div>
                </div>
                
                {gameState === 'crashed' && (
                  <div 
                    className="crash-explosion"
                    style={{
                      left: `${airplanePosition.x}%`,
                      bottom: `${Math.min((airplanePosition.y - 200) / 200 * 100, 90)}%`
                    }}
                  >
                    <div className="explosion-effect">💥</div>
                    <div className="explosion-ring"></div>
                    <div className="explosion-particles"></div>
                  </div>
                )}
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
              <div className="auto-cashout-header">
                <label htmlFor="cash-out-at">Auto Cash Out At</label>
                <div className="auto-cashout-toggle">
                  <input
                    type="checkbox"
                    id="auto-cashout-toggle"
                    checked={autoCashOutEnabled}
                    onChange={(e) => setAutoCashOutEnabled(e.target.checked)}
                    disabled={gameState === 'playing'}
                  />
                  <label htmlFor="auto-cashout-toggle" className="toggle-label">
                    {autoCashOutEnabled ? 'ON' : 'OFF'}
                  </label>
                </div>
              </div>
              <div className="input-wrapper">
                <input
                  id="cash-out-at"
                  type="number"
                  value={cashOutAt}
                  onChange={(e) => setCashOutAt(e.target.value)}
                  placeholder="2.00"
                  min="1.01"
                  step="0.01"
                  disabled={gameState === 'playing' || !autoCashOutEnabled}
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
                {gameState === 'waiting' ? '🚀 Place Bet' : '🎯 Next Round'}
              </button>
            ) : (
              <button 
                className="cashout-button"
                onClick={handleCashOut}
                disabled={gameState === 'crashed'}
              >
                💰 Cash Out ({(parseFloat(betAmount || 0) * multiplier).toFixed(2)} 🪙)
              </button>
            )}
            
            {gameState === 'crashed' && !userCashedOut && isPlaying && (
              <div className="crash-message">
                ❌ Too late! The plane crashed at {multiplier.toFixed(2)}x
              </div>
            )}
            
            {userCashedOut && winnings > 0 && (
              <div className="win-message">
                🎉 You won {winnings.toFixed(2)} 🪙 at {multiplier.toFixed(2)}x!
              </div>
            )}
          </div>

          <div className="game-info">
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`info-value ${gameState}`}>
                {gameState === 'waiting' ? 'Waiting...' : 
                 gameState === 'playing' ? 'Flying' : 'Crashed'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Your Bet:</span>
              <span className="info-value">{betAmount || '0'} 🪙</span>
            </div>
            {userCashedOut && winnings > 0 && (
              <div className="info-item win-info">
                <span className="info-label">You Won:</span>
                <span className="info-value win-amount">{winnings.toFixed(2)} 🪙</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;