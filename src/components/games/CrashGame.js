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
  const [airplanePosition, setAirplanePosition] = useState({ x: 5, y: 10 });

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
              setAirplanePosition({ x: 5, y: 10 });
              setWinnings(0);
            }, 3000);
            
            return newMultiplier;
          }
          
          // Update flight path - takeoff from low left angle
          const progress = Math.min((newMultiplier - 1) / 8, 1); // Progress over first 9x
          const xPos = 5 + progress * 85; // Start from 5% (low left), move to 90%
          const yPos = 10 + Math.pow(progress, 0.7) * 75; // Start from low position (10), fly upward to 85
          
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
    
    // Draw white dots on bottom axis
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.arc(x, height - 20, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Draw flight path with red filled area
    if (flightPath.length > 1) {
      // Scale coordinates for canvas - adjusted for upward flight from bottom-left
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
        if (i === 1) {
          ctx.lineTo(scaledPath[i].x, scaledPath[i].y);
        } else {
          const prevPoint = scaledPath[i - 1];
          const currentPoint = scaledPath[i];
          const controlX = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
          const controlY = prevPoint.y;
          ctx.quadraticCurveTo(controlX, controlY, currentPoint.x, currentPoint.y);
        }
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
        if (i === 1) {
          ctx.lineTo(scaledPath[i].x, scaledPath[i].y);
        } else {
          const prevPoint = scaledPath[i - 1];
          const currentPoint = scaledPath[i];
          const controlX = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
          const controlY = prevPoint.y;
          ctx.quadraticCurveTo(controlX, controlY, currentPoint.x, currentPoint.y);
        }
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
      setFlightPath([{ x: 5, y: 10 }]);
      setAirplanePosition({ x: 5, y: 10 });
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
      <div className="game-display game-section">
        {/* Top row with previous multiplier results */}
        <div className="game-history">
          <div className="history-list">
            {gameHistory.map((mult, index) => (
              <div key={index} className="history-item">
                <span className="history-multiplier">{mult.toFixed(2)}x</span>
              </div>
            ))}
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
            <div className="clouds">
              <div className="cloud cloud-1"></div>
              <div className="cloud cloud-2"></div>
              <div className="cloud cloud-3"></div>
            </div>
            <div 
              className={`airplane ${gameState}`}
              style={{
                left: `${airplanePosition.x}%`,
                bottom: `${Math.min((airplanePosition.y) / 100 * 100, 90)}%`,
                transform: `rotate(${Math.min((airplanePosition.x - 5) * 0.8, 30)}deg)`
              }}
            >
              <div className="airplane-body">
                <div className="airplane-wing"></div>
                <div className="airplane-tail"></div>
                <div className="airplane-propeller"></div>
              </div>
              <div className="airplane-trail"></div>
            </div>
            
            {gameState === 'crashed' && (
              <div 
                className="crash-explosion"
                style={{
                  left: `${airplanePosition.x}%`,
                  bottom: `${Math.min((airplanePosition.y) / 100 * 100, 90)}%`
                }}
              >
                <div className="explosion-effect">💥</div>
                <div className="explosion-ring"></div>
                <div className="explosion-particles"></div>
              </div>
            )}
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
              {countdown > 0 && (
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
              {betAmount || '2.00'}
              <div className="bet-actions">
                <button className="bet-action-btn" onClick={() => setBetAmount(prev => Math.max(0, parseFloat(prev || 2) - 0.5).toFixed(2))}>-</button>
                <button className="bet-action-btn" onClick={() => setBetAmount(prev => (parseFloat(prev || 2) + 0.5).toFixed(2))}>+</button>
              </div>
            </div>
          </div>
          
          <div className="bet-quick-amounts">
            <button className="quick-bet-btn" onClick={() => setBetAmount('5')}>5R</button>
            <button className="quick-bet-btn" onClick={() => setBetAmount('10')}>10R</button>
            <button className="quick-bet-btn" onClick={() => setBetAmount('20')}>20R</button>
            <button className="quick-bet-btn" onClick={() => setBetAmount('100')}>100R</button>
          </div>
        </div>

        <div className="action-section">
          {!isPlaying ? (
            <button 
              className="bet-button"
              onClick={handlePlaceBet}
              disabled={!betAmount || gameState === 'playing'}
            >
              {gameState === 'waiting' ? 'Place Bet' : 'Next Round'}
            </button>
          ) : (
            <button 
              className="cashout-button"
              onClick={handleCashOut}
              disabled={gameState === 'crashed'}
            >
              <div className="cashout-text">CASH OUT</div>
              <div className="cashout-amount">{(parseFloat(betAmount || 0) * multiplier).toFixed(2)}R</div>
            </button>
          )}
        </div>
        
        {gameState === 'crashed' && !userCashedOut && isPlaying && (
          <div className="crash-message">
            ❌ Too late! The plane crashed at {multiplier.toFixed(2)}x
          </div>
        )}
        
        {userCashedOut && winnings > 0 && (
          <div className="win-message">
            🎉 You won {winnings.toFixed(2)} R at {multiplier.toFixed(2)}x!
          </div>
        )}
      </div>
    </div>
  );
};

export default CrashGame;