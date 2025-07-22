import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
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
    totalWins: 0,
    totalWinnings: 0,
    bestMultiplier: 0,
    winRate: 0
  });
  const canvasRef = useRef(null);
  const [flightPath, setFlightPath] = useState([]);
  const [airplanePosition, setAirplanePosition] = useState({ x: 10, y: 10 });
  const flyAwayIntervalRef = useRef(null);
  const crashTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const threeRef = useRef({ scene: null, camera: null, renderer: null, airplane: null });

  // Optimize position calculations
  const calculatePosition = useCallback((multiplier) => {
    const progress = Math.min((multiplier - 1) / 8, 1);
    const xPos = 10 + progress * 60;
    const yPos = 10 + Math.pow(progress, 0.5) * 65;
    return { x: xPos, y: yPos };
  }, []);
  
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
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
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
        totalWins: prev.totalWins + 1,
        winRate: (prev.totalGames + 1) > 0 ? (prev.totalWins + 1) / (prev.totalGames + 1) : 0
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
              winRate: (prev.totalGames + 1) > 0 ? prev.totalWins / (prev.totalGames + 1) : 0
            }));
            
            // Play crash sound
            playSound('crash');
            
            // Add to history
            setGameHistory(prev => [newMultiplier, ...prev.slice(0, 4)]);
            
            // Animate plane flying away quickly
            flyAwayIntervalRef.current = setInterval(() => {
              setAirplanePosition(prev => ({
                x: prev.x + 6,
                y: prev.y + 4
              }));
            }, 40);
            
            // Stop animation and start new game after delay
            crashTimeoutRef.current = setTimeout(() => {
              if (flyAwayIntervalRef.current) {
                clearInterval(flyAwayIntervalRef.current);
                flyAwayIntervalRef.current = null;
              }
              setMultiplier(1.00);
              setGameState('waiting');
              setFlightPath([]);
              setAirplanePosition({ x: 10, y: 10, banking: 0, climb: 0 });
              setWinnings(0);
              setCountdown(10);
              setUserCashedOut(false);
            }, 1500);
            
            return newMultiplier;
          }
          
          // Update 3D flight path with banking and climbing
          const progress = Math.min((newMultiplier - 1) / 8, 1);
          const xPos = 10 + progress * 60; // 10% to 70% (wider center area)
          const yPos = 10 + Math.pow(progress, 0.5) * 65; // 10% to 75% with smoother curve
          
          // Calculate banking angle based on horizontal movement
          const bankingAngle = Math.sin(progress * Math.PI * 2) * 15; // Banking left/right
          const climbAngle = Math.min(progress * 20, 15); // Gradual climb angle
          
          setFlightPath(prev => {
            const newPath = [...prev, { x: xPos, y: yPos, banking: bankingAngle, climb: climbAngle }];
            return newPath.length > 100 ? newPath.slice(-100) : newPath;
          });
          setAirplanePosition({ x: xPos, y: yPos, banking: bankingAngle, climb: climbAngle });
          
          return newMultiplier;
        });
      }, 100);
    }
    
    return () => {
      clearInterval(interval);
      if (flyAwayIntervalRef.current) {
        clearInterval(flyAwayIntervalRef.current);
        flyAwayIntervalRef.current = null;
      }
      if (crashTimeoutRef.current) {
        clearTimeout(crashTimeoutRef.current);
        crashTimeoutRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [gameState, autoCashOutEnabled, cashOutAt, isPlaying, userCashedOut, generateCrashPoint, playSound, handleCashOut]);

  // Three.js setup and 3D airplane
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // 3D Airplane creation
    const createAirplane = () => {
      const airplaneGroup = new THREE.Group();
      
      // Fuselage (body)
      const fuselageGeometry = new THREE.CylinderGeometry(0.1, 0.3, 2, 8);
      const fuselageMaterial = new THREE.MeshPhongMaterial({ color: 0x4CAF50 });
      const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
      fuselage.rotation.z = Math.PI / 2;
      fuselage.castShadow = true;
      airplaneGroup.add(fuselage);
      
      // Wings
      const wingGeometry = new THREE.BoxGeometry(2.5, 0.1, 0.5);
      const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x00BCD4 });
      const wings = new THREE.Mesh(wingGeometry, wingMaterial);
      wings.castShadow = true;
      airplaneGroup.add(wings);
      
      // Tail
      const tailGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.1);
      const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x00BCD4 });
      const tail = new THREE.Mesh(tailGeometry, tailMaterial);
      tail.position.set(-0.8, 0.3, 0);
      tail.castShadow = true;
      airplaneGroup.add(tail);
      
      // Propeller
      const propGeometry = new THREE.BoxGeometry(0.05, 1.2, 0.05);
      const propMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const propeller = new THREE.Mesh(propGeometry, propMaterial);
      propeller.position.set(1.1, 0, 0);
      airplaneGroup.add(propeller);
      
      airplaneGroup.scale.set(0.5, 0.5, 0.5);
      return airplaneGroup;
    };
    
    const airplane = createAirplane();
    scene.add(airplane);
    
    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x00BCD4, 0x444444);
    gridHelper.position.y = -3;
    scene.add(gridHelper);
    
    // Flight path visualization
    const pathGeometry = new THREE.BufferGeometry();
    const pathMaterial = new THREE.LineBasicMaterial({ color: 0x00BCD4, linewidth: 3 });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(pathLine);
    
    // Store references
    threeRef.current = { scene, camera, renderer, airplane, pathLine, propeller: airplane.children[3] };
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate propeller
      if (threeRef.current.propeller && gameState === 'playing') {
        threeRef.current.propeller.rotation.x += 0.5;
      }
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Cleanup
    return () => {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  // Update airplane position and flight path
  useEffect(() => {
    const { airplane, pathLine } = threeRef.current;
    if (!airplane || !pathLine) return;
    
    // Convert 2D position to 3D
    const x = (airplanePosition.x - 50) * 0.3;
    const y = (airplanePosition.y - 50) * 0.1;
    const z = 0;
    
    airplane.position.set(x, y, z);
    
    // Banking and climbing
    if (airplanePosition.banking !== undefined) {
      airplane.rotation.z = (airplanePosition.banking * Math.PI) / 180;
    }
    if (airplanePosition.climb !== undefined) {
      airplane.rotation.x = (airplanePosition.climb * Math.PI) / 180;
    }
    
    // Update flight path
    if (flightPath.length > 1) {
      const points = flightPath.map(point => new THREE.Vector3(
        (point.x - 50) * 0.3,
        (point.y - 50) * 0.1,
        0
      ));
      pathLine.geometry.setFromPoints(points);
    }
  }, [airplanePosition, flightPath]);
  
  // Handle game state changes
  useEffect(() => {
    const { airplane } = threeRef.current;
    if (!airplane) return;
    
    if (gameState === 'crashed') {
      // Add explosion effect
      const particles = new THREE.Group();
      for (let i = 0; i < 20; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
        const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        particle.position.copy(airplane.position);
        particle.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        particles.add(particle);
      }
      
      threeRef.current.scene.add(particles);
      
      // Animate particles
      const animateExplosion = () => {
        particles.children.forEach(particle => {
          particle.position.add(particle.velocity);
          particle.velocity.multiplyScalar(0.98);
          particle.material.opacity *= 0.95;
        });
        
        if (particles.children[0]?.material.opacity > 0.1) {
          requestAnimationFrame(animateExplosion);
        } else {
          threeRef.current.scene.remove(particles);
        }
      };
      animateExplosion();
    }
  }, [gameState]);

  const handlePlaceBet = () => {
    if (betAmount && parseFloat(betAmount) > 0 && gameState === 'waiting') {
      setIsPlaying(true);
      setUserCashedOut(false);
      setWinnings(0);
      setFlightPath([{ x: 10, y: 10, banking: 0, climb: 0 }]);
      setAirplanePosition({ x: 10, y: 10, banking: 0, climb: 0 });
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

        {/* 3D Graph container */}
        <div className="graph-container">
          <div 
            ref={canvasRef}
            className="game-canvas-3d"
            style={{ width: '100%', height: '400px', position: 'relative' }}
          />
          
          {/* 3D scene renders here */}

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