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
  const animationRef = useRef(null);
  const [flightPath, setFlightPath] = useState([]);
  const [airplanePosition, setAirplanePosition] = useState({ x: 5, y: 10 });

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
                x: prev.x + 8,
                y: prev.y + 6
              }));
            }, 30);
            
            // Stop animation and start new game after delay
            setTimeout(() => {
              clearInterval(flyAwayAnimation);
              setMultiplier(1.00);
              setGameState('waiting');
              setFlightPath([]);
              setAirplanePosition({ x: 5, y: 10 });
              setWinnings(0);
              setCountdown(10);
              setUserCashedOut(false);
            }, 1500);
            
            return newMultiplier;
          }
          
          // Update flight path - airplane should follow the red line exactly
          const progress = Math.min((newMultiplier - 1) / 8, 1);
          const xPos = 5 + progress * 85;
          const yPos = 10 + Math.pow(progress, 0.7) * 75;
          
          setFlightPath(prev => [...prev, { x: xPos, y: yPos }]);
          setAirplanePosition({ x: xPos, y: yPos });
          
          return newMultiplier;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [gameState, autoCashOutEnabled, cashOutAt, isPlaying, userCashedOut, generateCrashPoint, playSound]);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 0.5;
    
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
    
    // Draw flight path with red filled area
    if (flightPath.length > 1) {
      const scaledPath = flightPath.map(point => ({
        x: (point.x / 100) * width,
        y: height - ((point.y) / 100) * height
      }));
      
      // Draw filled red area under curve
      ctx.fillStyle = 'rgba(220, 38, 38, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(scaledPath[0].x, scaledPath[0].y);
      
      for (let i = 1; i < scaledPath.length; i++) {
        ctx.lineTo(scaledPath[i].x, scaledPath[i].y);
      }
      
      ctx.lineTo(scaledPath[scaledPath.length - 1].x, height);
      ctx.lineTo(0, height);
      ctx.fill();
      
      // Draw curve line
      ctx.strokeStyle = 'rgba(220, 38, 38, 1)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(scaledPath[0].x, scaledPath[0].y);
      
      for (let i = 1; i < scaledPath.length; i++) {
        ctx.lineTo(scaledPath[i].x, scaledPath[i].y);
      }
      
      ctx.stroke();
    }
    
  }, [flightPath]);

  const handlePlaceBet = () => {
    if (betAmount && parseFloat(betAmount) > 0 && gameState === 'waiting' && countdown === 0) {
      setIsPlaying(true);
      setUserCashedOut(false);
      setWinnings(0);
      setFlightPath([{ x: 5, y: 10 }]);
      setAirplanePosition({ x: 5, y: 10 });
    }
  };

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
      <div className="game-display game-section">
        {/* Top row with previous multiplier results */}
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

        {/* Full-screen graph container */}
        <div className="graph-container">
          <canvas 
            ref={canvasRef}
            className="aviator-canvas"
            width="800"
            height="400"
          />
          
          {/* Flight overlay with airplane */}
          <div className="flight-overlay">
            <div className="sky-gradient"></div>
            <div className="stars">
              <div className="star star-1">⭐</div>
              <div className="star star-2">✨</div>
              <div className="star star-3">⭐</div>
              <div className="star star-4">✨</div>
              <div className="star star-5">⭐</div>
            </div>
            <div className="clouds">
              <div className="cloud cloud-1">☁️</div>
              <div className="cloud cloud-2">☁️</div>
              <div className="cloud cloud-3">☁️</div>
              <div className="cloud cloud-4">☁️</div>
            </div>
            <div 
              className={`airplane ${gameState}`}
              style={{
                left: `${airplanePosition.x}%`,
                bottom: `${airplanePosition.y}%`,
                transform: `rotate(${Math.min((airplanePosition.x - 5) * 0.5, 25)}deg)`,
                transition: gameState === 'crashed' ? 'all 0.5s ease-out' : 'none'
              }}
            >
              <div className="airplane-emoji">✈️</div>
              <div className="airplane-trail"></div>
            </div>
            
          </div>

          {/* Centered large multiplier display */}
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
      
      {/* Bottom control panel */}
      <div className="game-controls bet-section">
        <div className="control-tabs">
          <div className="tab active">Bet</div>
          <div className="tab">Auto</div>
        </div>
        
        <div className="betting-section">
          <div className="bet-display">
            <div className="bet-amount-display">
              {betAmount} 🪙
              <div className="bet-actions">
                <button 
                  className="bet-action-btn" 
                  onClick={() => handleBetChange(Math.max(1, parseFloat(betAmount) - 1).toString())}
                  disabled={gameState === 'playing'}
                >-</button>
                <button 
                  className="bet-action-btn" 
                  onClick={() => handleBetChange(Math.min(1000, parseFloat(betAmount) + 1).toString())}
                  disabled={gameState === 'playing'}
                >+</button>
              </div>
            </div>
          </div>
          
          <div className="auto-cashout-section">
            <div className="auto-cashout-header">
              <label>Auto Cash Out</label>
              <div className="auto-cashout-toggle">
                <input 
                  type="checkbox" 
                  id="autoCashOut" 
                  checked={autoCashOutEnabled}
                  onChange={(e) => setAutoCashOutEnabled(e.target.checked)}
                  disabled={gameState === 'playing'}
                />
                <label htmlFor="autoCashOut" className="toggle-label">
                  {autoCashOutEnabled ? 'ON' : 'OFF'}
                </label>
              </div>
            </div>
            {autoCashOutEnabled && (
              <div className="auto-cashout-input">
                <input
                  type="number"
                  placeholder="2.00"
                  value={cashOutAt}
                  onChange={(e) => setCashOutAt(e.target.value)}
                  disabled={gameState === 'playing'}
                  min="1.01"
                  max="1000"
                  step="0.01"
                  className="cashout-input"
                />
                <span className="multiplier-symbol">x</span>
              </div>
            )}
          </div>
          
          <div className="bet-quick-amounts">
            <button className="quick-bet-btn" onClick={() => handleBetChange('5')} disabled={gameState === 'playing'}>5 🪙</button>
            <button className="quick-bet-btn" onClick={() => handleBetChange('10')} disabled={gameState === 'playing'}>10 🪙</button>
            <button className="quick-bet-btn" onClick={() => handleBetChange('25')} disabled={gameState === 'playing'}>25 🪙</button>
            <button className="quick-bet-btn" onClick={() => handleBetChange('50')} disabled={gameState === 'playing'}>50 🪙</button>
            <button className="quick-bet-btn" onClick={() => handleBetChange('100')} disabled={gameState === 'playing'}>100 🪙</button>
          </div>
        </div>

        <div className="action-section">
          {!isPlaying ? (
            <button 
              className="bet-button"
              onClick={handlePlaceBet}
              disabled={!betAmount || parseFloat(betAmount) < 1 || gameState !== 'waiting' || countdown > 0}
            >
              {gameState === 'waiting' ? (countdown > 0 ? `Wait ${countdown}s` : 'Place Bet') : 'Next Round'}
            </button>
          ) : (
            <button 
              className="cashout-button"
              onClick={handleCashOut}
              disabled={gameState === 'crashed' || userCashedOut}
            >
              <div className="cashout-text">CASH OUT</div>
              <div className="cashout-amount">{(parseFloat(betAmount || 0) * multiplier).toFixed(2)} 🪙</div>
            </button>
          )}
        </div>
        
        {gameState === 'crashed' && !userCashedOut && (
          <div className="crash-message">
            ❌ Crashed at {multiplier.toFixed(2)}x! Better luck next time.
          </div>
        )}
        
        {userCashedOut && winnings > 0 && (
          <div className="win-message">
            🎉 You won {winnings.toFixed(2)} 🪙 at {multiplier.toFixed(2)}x!
          </div>
        )}
        
        {/* Game Statistics */}
        <div className="game-stats">
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Games:</span>
              <span className="stat-value">{gameStats.totalGames}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Best:</span>
              <span className="stat-value">{gameStats.bestMultiplier.toFixed(2)}x</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Won:</span>
              <span className="stat-value">{gameStats.totalWinnings.toFixed(0)} 🪙</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;