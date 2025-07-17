import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CrashGame.css';

const CrashGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, crashed
  const [multiplier, setMultiplier] = useState(1.00);
  const [betAmount, setBetAmount] = useState('10');
  const [isPlaying, setIsPlaying] = useState(false);
  const [cashOutAt, setCashOutAt] = useState('');
  const [gameHistory, setGameHistory] = useState([2.34, 1.56, 8.92, 1.23, 5.67]);
  const [countdown, setCountdown] = useState(10);
  const [userCashedOut, setUserCashedOut] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [autoCashOutEnabled, setAutoCashOutEnabled] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalWinnings: 0,
    bestMultiplier: 0,
    winRate: 0
  });
  const canvasRef = useRef(null);
  const [flightPath, setFlightPath] = useState([]);
  const [airplanePosition, setAirplanePosition] = useState({ x: 15, y: 15 });

  // Enhanced crash point generation
  const generateCrashPoint = useCallback(() => {
    const random = Math.random();
    
    // Simple but effective crash logic
    if (random < 0.5) return 1.01 + Math.random() * 0.5; // 50% chance of early crash (1.01-1.5x)
    if (random < 0.8) return 1.5 + Math.random() * 2; // 30% chance of medium crash (1.5-3.5x)
    if (random < 0.95) return 3.5 + Math.random() * 6.5; // 15% chance of high crash (3.5-10x)
    return 10 + Math.random() * 90; // 5% chance of very high crash (10-100x)
  }, []);

  // Sound system
  const playSound = useCallback((type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const sounds = {
        cashout: { frequency: 800, duration: 0.3 },
        crash: { frequency: 200, duration: 0.5 },
        tick: { frequency: 1000, duration: 0.1 }
      };
      
      const sound = sounds[type];
      if (sound) {
        oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
      }
    } catch (error) {
      console.log('Sound play failed:', error);
    }
  }, []);

  // Cash out handler
  const handleCashOut = useCallback(() => {
    if (isPlaying && gameState === 'playing' && !userCashedOut) {
      setIsPlaying(false);
      setUserCashedOut(true);
      
      // Calculate winnings
      const calculatedWinnings = parseFloat(betAmount || 0) * multiplier;
      setWinnings(calculatedWinnings);
      
      // Update stats
      setGameStats(prev => ({
        ...prev,
        totalGames: prev.totalGames + 1,
        totalWinnings: prev.totalWinnings + calculatedWinnings,
        bestMultiplier: Math.max(prev.bestMultiplier, multiplier),
        winRate: (prev.totalGames + 1) > 0 ? (prev.totalGames + 1) / (prev.totalGames + 1) : 1
      }));
      
      // Play cash out sound
      playSound('cashout');
      
      console.log(`Cashed out at ${multiplier.toFixed(2)}x for ${calculatedWinnings.toFixed(2)} coins`);
    }
  }, [isPlaying, gameState, userCashedOut, betAmount, multiplier, playSound]);

  // Countdown timer
  useEffect(() => {
    let countdownInterval;
    
    if (gameState === 'waiting' && countdown > 0) {
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
  }, [gameState, countdown]);

  // Main game loop
  useEffect(() => {
    let interval;
    let crashPoint;
    
    if (gameState === 'playing') {
      // Generate crash point when game starts
      crashPoint = generateCrashPoint();
      console.log('Game started - Crash point:', crashPoint.toFixed(2) + 'x');
      
      interval = setInterval(() => {
        setMultiplier(prev => {
          const newMultiplier = prev + 0.01 + (prev - 1) * 0.002;
          
          // Auto cash out logic
          if (autoCashOutEnabled && 
              cashOutAt && 
              parseFloat(cashOutAt) <= newMultiplier && 
              isPlaying && 
              !userCashedOut) {
            handleCashOut();
            return newMultiplier;
          }
          
          // Check if crash point reached
          if (newMultiplier >= crashPoint) {
            setGameState('crashed');
            setIsPlaying(false);
            
            // Update stats
            setGameStats(prev => ({
              ...prev,
              totalGames: prev.totalGames + 1,
              winRate: prev.totalGames > 0 ? (prev.totalGames - 1) / prev.totalGames : 0
            }));
            
            // Play crash sound
            playSound('crash');
            
            // Add to history
            setGameHistory(prev => [newMultiplier, ...prev.slice(0, 4)]);
            
            // Animate plane flying away quickly
            const flyAwayAnimation = setInterval(() => {
              setAirplanePosition(prev => ({
                x: prev.x + 6,
                y: prev.y + 4
              }));
            }, 40);
            
            // Stop animation and start new game after delay
            setTimeout(() => {
              clearInterval(flyAwayAnimation);
              setMultiplier(1.00);
              setGameState('waiting');
              setFlightPath([]);
              setAirplanePosition({ x: 15, y: 15 });
              setWinnings(0);
              setCountdown(10);
              setUserCashedOut(false);
            }, 1500);
            
            return newMultiplier;
          }
          
          // Update flight path - airplane moves from left-center to center-right
          const progress = Math.min((newMultiplier - 1) / 8, 1);
          const xPos = 15 + progress * 50; // 15% to 65% (wider center area)
          const yPos = 15 + Math.pow(progress, 0.6) * 60; // 15% to 75%
          
          setFlightPath(prev => [...prev, { x: xPos, y: yPos }]);
          setAirplanePosition({ x: xPos, y: yPos });
          
          return newMultiplier;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [gameState, autoCashOutEnabled, cashOutAt, isPlaying, userCashedOut, generateCrashPoint, playSound, handleCashOut]);

  // Canvas drawing effect - simple dashed line
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw simple grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Few horizontal lines
    for (let y = height * 0.2; y <= height * 0.8; y += height * 0.2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Few vertical lines
    for (let x = width * 0.2; x <= width * 0.8; x += width * 0.2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw simple dashed line path
    if (flightPath.length > 1) {
      ctx.setLineDash([8, 4]);
      ctx.strokeStyle = '#00BCD4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const scaledPath = flightPath.map(point => ({
        x: (point.x / 100) * width,
        y: height - ((point.y) / 100) * height
      }));
      
      ctx.moveTo(scaledPath[0].x, scaledPath[0].y);
      for (let i = 1; i < scaledPath.length; i++) {
        ctx.lineTo(scaledPath[i].x, scaledPath[i].y);
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
  }, [flightPath]);

  const handlePlaceBet = () => {
    if (betAmount && parseFloat(betAmount) > 0 && gameState === 'waiting') {
      setIsPlaying(true);
      setUserCashedOut(false);
      setWinnings(0);
      setFlightPath([{ x: 15, y: 15 }]);
      setAirplanePosition({ x: 15, y: 15 });
    }
  };

  const getMultiplierColor = () => {
    if (gameState === 'crashed') return '#ff6b6b';
    if (multiplier < 2) return '#00BCD4';
    if (multiplier < 5) return '#FFC107';
    return '#4CAF50';
  };

  const handleBetChange = (value) => {
    const numValue = parseFloat(value);
    if (numValue >= 1 && numValue <= 1000) {
      setBetAmount(value);
    }
  };

  return (
    <div className="crash-game">
      <div className="game-display">
        {/* Game history */}
        <div className="game-history">
          <div className="history-list">
            {gameHistory.map((mult, index) => {
              const getMultiplierClass = (multiplier) => {
                if (multiplier < 1.5) return 'low';
                if (multiplier < 3) return 'medium';
                if (multiplier < 10) return 'high';
                return 'very-high';
              };
              
              return (
                <div key={index} className={`history-item ${getMultiplierClass(mult)}`}>
                  <span className="history-multiplier">{mult.toFixed(2)}x</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graph container */}
        <div className="graph-container">
          <canvas 
            ref={canvasRef}
            className="game-canvas"
            width="800"
            height="400"
          />
          
          {/* Airplane */}
          <div 
            className={`airplane ${gameState}`}
            style={{
              left: `${airplanePosition.x}%`,
              bottom: `${airplanePosition.y}%`,
              transform: `rotate(${Math.min((airplanePosition.x - 15) * 1.5, 45)}deg) scale(2.2)`,
              transition: gameState === 'crashed' ? 'all 0.3s ease-out' : 'none'
            }}
          >
            <div className="airplane-emoji">✈️</div>
            <div className="airplane-trail"></div>
          </div>

          {/* Multiplier display */}
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
              {countdown > 0 && gameState === 'waiting' && (
                <div className="countdown-text">
                  Starting in {countdown}...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Compact betting controls */}
      <div className="betting-controls">
        {/* Bet amount section */}
        <div className="bet-section">
          <div className="bet-amount-container">
            <div className="bet-amount-display">
              <span className="bet-label">Bet:</span>
              <span className="bet-value">{betAmount} 🪙</span>
              <div className="bet-actions">
                <button 
                  className="bet-btn minus"
                  onClick={() => handleBetChange(Math.max(1, parseFloat(betAmount) - 5).toString())}
                  disabled={gameState === 'playing'}
                >-</button>
                <button 
                  className="bet-btn plus"
                  onClick={() => handleBetChange(Math.min(1000, parseFloat(betAmount) + 5).toString())}
                  disabled={gameState === 'playing'}
                >+</button>
              </div>
            </div>
          </div>
          
          {/* Quick amounts */}
          <div className="quick-amounts">
            <button className="quick-btn" onClick={() => handleBetChange('10')} disabled={gameState === 'playing'}>10</button>
            <button className="quick-btn" onClick={() => handleBetChange('50')} disabled={gameState === 'playing'}>50</button>
            <button className="quick-btn" onClick={() => handleBetChange('100')} disabled={gameState === 'playing'}>100</button>
          </div>
        </div>

        {/* Auto cash out */}
        <div className="auto-section">
          <div className="auto-header">
            <label>Auto Cash Out</label>
            <div className="auto-toggle">
              <input 
                type="checkbox" 
                id="autoCashOut" 
                checked={autoCashOutEnabled}
                onChange={(e) => setAutoCashOutEnabled(e.target.checked)}
                disabled={gameState === 'playing'}
              />
              <label htmlFor="autoCashOut" className="toggle-btn">
                {autoCashOutEnabled ? 'ON' : 'OFF'}
              </label>
            </div>
          </div>
          {autoCashOutEnabled && (
            <div className="auto-input-container">
              <input
                type="number"
                placeholder="2.00"
                value={cashOutAt}
                onChange={(e) => setCashOutAt(e.target.value)}
                disabled={gameState === 'playing'}
                min="1.01"
                max="1000"
                step="0.01"
                className="auto-input"
              />
              <span className="auto-suffix">x</span>
            </div>
          )}
        </div>

        {/* Main action button */}
        <div className="action-section">
          {!isPlaying ? (
            <button 
              className="main-action-btn bet-btn-main"
              onClick={handlePlaceBet}
              disabled={!betAmount || parseFloat(betAmount) < 1 || gameState !== 'waiting'}
            >
              {gameState === 'waiting' ? (countdown > 0 ? `Wait ${countdown}s` : 'Place Bet') : 'Next Round'}
            </button>
          ) : (
            <button 
              className="main-action-btn cashout-btn-main"
              onClick={handleCashOut}
              disabled={gameState === 'crashed' || userCashedOut}
            >
              <div className="cashout-text">CASH OUT</div>
              <div className="cashout-amount">{(parseFloat(betAmount || 0) * multiplier).toFixed(2)} 🪙</div>
            </button>
          )}
        </div>
        
        {/* Messages */}
        {gameState === 'crashed' && !userCashedOut && (
          <div className="message crash-msg">
            ❌ Crashed at {multiplier.toFixed(2)}x!
          </div>
        )}
        
        {userCashedOut && winnings > 0 && (
          <div className="message win-msg">
            🎉 Won {winnings.toFixed(2)} 🪙 at {multiplier.toFixed(2)}x!
          </div>
        )}
        
        {/* Compact stats */}
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Games:</span>
            <span className="stat-value">{gameStats.totalGames}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Best:</span>
            <span className="stat-value">{gameStats.bestMultiplier.toFixed(2)}x</span>
          </div>
          <div className="stat">
            <span className="stat-label">Won:</span>
            <span className="stat-value">{gameStats.totalWinnings.toFixed(0)} 🪙</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;