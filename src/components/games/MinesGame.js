import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import './MinesGame.css';

const MinesGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, won, lost
  const [betAmount, setBetAmount] = useState('10');
  const [minesCount, setMinesCount] = useState(3);
  const [grid, setGrid] = useState([]);
  const [revealedTiles, setRevealedTiles] = useState(new Set());
  const [minePositions, setMinePositions] = useState(new Set());
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [winnings, setWinnings] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [safeClicks, setSafeClicks] = useState(0);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalWins: 0,
    totalWinnings: 0,
    bestMultiplier: 0,
    winRate: 0
  });
  const audioContextRef = useRef(null);
  const threeRef = useRef({ scene: null, camera: null, renderer: null, tiles: [] });
  const containerRef = useRef(null);

  const GRID_SIZE = 25; // 5x5 grid
  const MAX_MINES = 20;
  const MIN_MINES = 1;
  
  // Three.js 3D grid setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);
    
    // Camera setup - isometric view
    const camera = new THREE.PerspectiveCamera(60, 400 / 400, 0.1, 1000);
    camera.position.set(10, 15, 10);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
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
    
    // Create 3D grid tiles
    const createTiles = () => {
      const tiles = [];
      const gridSize = 5; // 5x5 grid
      const tileSize = 1.5;
      const spacing = 0.1;
      const totalSize = (tileSize + spacing) * gridSize - spacing;
      const offset = totalSize / 2 - tileSize / 2;
      
      for (let i = 0; i < GRID_SIZE; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        
        const x = col * (tileSize + spacing) - offset;
        const z = row * (tileSize + spacing) - offset;
        
        // Tile base
        const tileGeometry = new THREE.BoxGeometry(tileSize, 0.3, tileSize);
        const tileMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x444444,
          shininess: 30
        });
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
        tile.position.set(x, 0, z);
        tile.castShadow = true;
        tile.receiveShadow = true;
        tile.userData = { id: i, revealed: false };
        
        // Tile cover
        const coverGeometry = new THREE.BoxGeometry(tileSize * 0.9, 0.1, tileSize * 0.9);
        const coverMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x666666,
          transparent: true,
          opacity: 1
        });
        const cover = new THREE.Mesh(coverGeometry, coverMaterial);
        cover.position.set(x, 0.2, z);
        cover.userData = { id: i, type: 'cover' };
        
        // Gem (hidden initially)
        const gemGeometry = new THREE.OctahedronGeometry(0.3);
        const gemMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x00BCD4,
          transparent: true,
          opacity: 0,
          shininess: 100
        });
        const gem = new THREE.Mesh(gemGeometry, gemMaterial);
        gem.position.set(x, 0.4, z);
        gem.userData = { id: i, type: 'gem' };
        
        // Mine (hidden initially)
        const mineGeometry = new THREE.SphereGeometry(0.25);
        const mineMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x333333,
          transparent: true,
          opacity: 0
        });
        const mine = new THREE.Mesh(mineGeometry, mineMaterial);
        mine.position.set(x, 0.4, z);
        mine.userData = { id: i, type: 'mine' };
        
        scene.add(tile);
        scene.add(cover);
        scene.add(gem);
        scene.add(mine);
        
        tiles.push({ tile, cover, gem, mine, id: i });
      }
      
      return tiles;
    };
    
    const tiles = createTiles();
    
    // Base platform
    const platformGeometry = new THREE.BoxGeometry(12, 0.5, 12);
    const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -0.4;
    platform.receiveShadow = true;
    scene.add(platform);
    
    threeRef.current = { scene, camera, renderer, tiles };
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate gems
      tiles.forEach(tileObj => {
        if (tileObj.gem.material.opacity > 0) {
          tileObj.gem.rotation.y += 0.02;
          tileObj.gem.rotation.x += 0.01;
        }
      });
      
      renderer.render(scene, camera);
    };
    animate();
    
    return () => {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);
  
  // Update 3D tiles when game state changes
  useEffect(() => {
    const { tiles } = threeRef.current;
    if (!tiles) return;
    
    tiles.forEach(tileObj => {
      const isRevealed = revealedTiles.has(tileObj.id);
      const isMine = minePositions.has(tileObj.id);
      
      if (isRevealed) {
        // Hide cover
        tileObj.cover.material.opacity = 0;
        
        if (isMine) {
          // Show mine with explosion effect
          tileObj.mine.material.opacity = 1;
          tileObj.mine.material.color.setHex(0xff4444);
          tileObj.tile.material.color.setHex(0x884444);
          
          // Add explosion particles
          if (gameState === 'lost') {
            const particles = new THREE.Group();
            for (let i = 0; i < 10; i++) {
              const particleGeometry = new THREE.SphereGeometry(0.05);
              const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
              const particle = new THREE.Mesh(particleGeometry, particleMaterial);
              
              particle.position.copy(tileObj.mine.position);
              particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
              );
              particles.add(particle);
            }
            
            threeRef.current.scene.add(particles);
            
            const animateExplosion = () => {
              particles.children.forEach(particle => {
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.05; // gravity
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
        } else {
          // Show gem
          tileObj.gem.material.opacity = 1;
          tileObj.tile.material.color.setHex(0x00BCD4);
        }
      } else {
        // Reset tile
        tileObj.cover.material.opacity = 1;
        tileObj.gem.material.opacity = 0;
        tileObj.mine.material.opacity = 0;
        tileObj.tile.material.color.setHex(0x444444);
      }
      
      // Show all mines when game is lost
      if (gameState === 'lost' && minePositions.has(tileObj.id)) {
        tileObj.mine.material.opacity = 0.7;
      }
    });
  }, [revealedTiles, minePositions, gameState]);

  // Calculate multiplier based on mines count and safe clicks
  const calculateMultiplier = useCallback((mines, clicks) => {
    if (clicks === 0) return 1.00;
    
    const totalSafeTiles = GRID_SIZE - mines;
    const baseMultiplier = 1 + (mines / 10); // Base multiplier increases with mine count
    
    // Progressive multiplier calculation
    let multiplier = baseMultiplier;
    for (let i = 1; i <= clicks; i++) {
      const probability = (totalSafeTiles - i + 1) / (GRID_SIZE - i + 1);
      multiplier *= (1 / probability) * 0.97; // 97% RTP
    }
    
    return Math.max(1.01, multiplier);
  }, []);

  // Generate random mine positions
  const generateMines = useCallback((count) => {
    const positions = new Set();
    while (positions.size < count) {
      positions.add(Math.floor(Math.random() * GRID_SIZE));
    }
    return positions;
  }, []);

  // Initialize game grid
  const initializeGrid = useCallback(() => {
    return Array(GRID_SIZE).fill().map((_, index) => ({
      id: index,
      revealed: false,
      isMine: false,
      hasGem: false
    }));
  }, []);

  // Start new game
  const startGame = () => {
    if (!betAmount || parseFloat(betAmount) < 1) return;
    
    const newMines = generateMines(minesCount);
    const newGrid = initializeGrid();
    
    setMinePositions(newMines);
    setGrid(newGrid);
    setRevealedTiles(new Set());
    setGameState('playing');
    setCurrentMultiplier(1.00);
    setWinnings(0);
    setSafeClicks(0);
  };

  // Handle tile click
  const handleTileClick = useCallback((tileId) => {
    if (gameState !== 'playing' || revealedTiles.has(tileId)) return;

    const newRevealed = new Set(revealedTiles);
    newRevealed.add(tileId);
    setRevealedTiles(newRevealed);

    if (minePositions.has(tileId)) {
      // Hit a mine - game over
      setGameState('lost');
      setWinnings(0);
      
      // Update stats
      setGameStats(prev => ({
        ...prev,
        totalGames: prev.totalGames + 1,
        winRate: (prev.totalGames + 1) > 0 ? prev.totalWins / (prev.totalGames + 1) : 0
      }));
      
      // Add to history
      setGameHistory(prev => [
        { result: 'lost', multiplier: 0, mines: minesCount, clicks: safeClicks },
        ...prev.slice(0, 4)
      ]);
      
      // Play explosion sound
      playSound('explosion');
      
      // Auto restart after delay
      setTimeout(() => {
        setGameState('waiting');
      }, 3000);
    } else {
      // Safe tile
      const newClicks = safeClicks + 1;
      setSafeClicks(newClicks);
      
      const newMultiplier = calculateMultiplier(minesCount, newClicks);
      setCurrentMultiplier(newMultiplier);
      
      const currentWinnings = parseFloat(betAmount) * newMultiplier;
      setWinnings(currentWinnings);
      
      // Play gem sound
      playSound('gem');
      
      // Check if all safe tiles revealed (perfect game)
      if (newClicks === GRID_SIZE - minesCount) {
        setGameState('won');
        
        // Update stats
        setGameStats(prev => ({
          ...prev,
          totalGames: prev.totalGames + 1,
          totalWinnings: prev.totalWinnings + currentWinnings,
          bestMultiplier: Math.max(prev.bestMultiplier, newMultiplier),
          totalWins: prev.totalWins + 1,
          winRate: (prev.totalGames + 1) > 0 ? (prev.totalWins + 1) / (prev.totalGames + 1) : 0
        }));
        
        // Add to history
        setGameHistory(prev => [
          { result: 'perfect', multiplier: newMultiplier, mines: minesCount, clicks: newClicks },
          ...prev.slice(0, 4)
        ]);
        
        playSound('perfect');
        
        setTimeout(() => {
          setGameState('waiting');
        }, 3000);
      }
    }
  }, [gameState, revealedTiles, minePositions, safeClicks, minesCount, betAmount, calculateMultiplier]);

  // Cash out current winnings
  const cashOut = () => {
    if (gameState !== 'playing' || safeClicks === 0) return;
    
    setGameState('won');
    
    // Update stats
    setGameStats(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1,
      totalWinnings: prev.totalWinnings + winnings,
      bestMultiplier: Math.max(prev.bestMultiplier, currentMultiplier),
      totalWins: prev.totalWins + 1,
      winRate: (prev.totalGames + 1) > 0 ? (prev.totalWins + 1) / (prev.totalGames + 1) : 0
    }));
    
    // Add to history
    setGameHistory(prev => [
      { result: 'won', multiplier: currentMultiplier, mines: minesCount, clicks: safeClicks },
      ...prev.slice(0, 4)
    ]);
    
    playSound('cashout');
    
    setTimeout(() => {
      setGameState('waiting');
    }, 2000);
  };

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
        gem: { frequency: 800, duration: 0.2 },
        explosion: { frequency: 150, duration: 0.8 },
        cashout: { frequency: 1000, duration: 0.4 },
        perfect: { frequency: 1200, duration: 0.6 }
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

  const getTileClass = (tileId) => {
    let classes = 'mine-tile';
    
    if (revealedTiles.has(tileId)) {
      classes += ' revealed';
      if (minePositions.has(tileId)) {
        classes += ' mine';
      } else {
        classes += ' safe';
      }
    }
    
    if (gameState === 'lost' && minePositions.has(tileId)) {
      classes += ' show-mine';
    }
    
    return classes;
  };

  const getMultiplierColor = () => {
    if (currentMultiplier < 2) return '#00BCD4';
    if (currentMultiplier < 5) return '#FFC107';
    if (currentMultiplier < 10) return '#4CAF50';
    return '#E91E63';
  };

  return (
    <div className="mines-game">
      <div className="mines-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        
        <h1 className="game-title">
          <div className="title-icon">💎</div>
          <h2>3D Mines</h2>
        </h1>
        
        <div className="multiplier-display">
          {currentMultiplier.toFixed(2)}x
        </div>
      </div>

      {/* Game History */}
      <div className="game-history">
        {gameHistory.map((game, index) => (
          <div key={index} className={`history-item ${game.result}`}>
            <span className="history-multiplier">
              {game.multiplier > 0 ? `${game.multiplier.toFixed(2)}x` : '💥'}
            </span>
            <span className="history-mines">{game.mines}M</span>
          </div>
        ))}
      </div>

      {/* 3D Game Grid */}
      <div className="game-container">
        <div 
          ref={containerRef}
          className="mines-grid-3d"
          style={{ width: '400px', height: '400px', margin: '20px auto', cursor: 'pointer' }}
          onClick={(e) => {
            // Convert mouse position to tile ID (simplified)
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
            const z = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
            
            // Simple grid mapping (5x5)
            const col = Math.floor((x + 5) / 2);
            const row = Math.floor((z + 5) / 2);
            const tileId = row * 5 + col;
            
            if (tileId >= 0 && tileId < GRID_SIZE) {
              handleTileClick(tileId);
            }
          }}
        />
        <p style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>Click on the 3D tiles to reveal gems or mines</p>
      </div>

      {/* Game Controls */}
      <div className="game-controls">
        {gameState === 'waiting' && (
          <>
            <div className="control-section">
              <label>Bet Amount</label>
              <div className="bet-input-container">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="1"
                  max="1000"
                  className="bet-input"
                />
                <span className="currency">🪙</span>
              </div>
            </div>

            <div className="control-section">
              <label>Mines ({minesCount})</label>
              <div className="mines-selector">
                <button 
                  onClick={() => setMinesCount(Math.max(MIN_MINES, minesCount - 1))}
                  className="mines-btn"
                  disabled={minesCount <= MIN_MINES}
                >-</button>
                <span className="mines-count">{minesCount}</span>
                <button 
                  onClick={() => setMinesCount(Math.min(MAX_MINES, minesCount + 1))}
                  className="mines-btn"
                  disabled={minesCount >= MAX_MINES}
                >+</button>
              </div>
            </div>

            <button className="start-btn" onClick={startGame}>
              <span className="btn-icon">🚀</span>
              <span>Start Game</span>
            </button>
          </>
        )}

        {gameState === 'playing' && (
          <div className="playing-controls">
            <div className="current-info">
              <div className="info-item">
                <span className="info-label">Safe Clicks:</span>
                <span className="info-value">{safeClicks}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Potential Win:</span>
                <span className="info-value">{winnings.toFixed(2)} 🪙</span>
              </div>
            </div>
            
            <button 
              className="cashout-btn"
              onClick={cashOut}
              disabled={safeClicks === 0}
            >
              <span className="btn-icon">💰</span>
              <span>Cash Out {winnings.toFixed(2)} 🪙</span>
            </button>
          </div>
        )}

        {(gameState === 'won' || gameState === 'lost') && (
          <div className="game-result">
            {gameState === 'won' ? (
              <div className="win-message">
                <span className="result-icon">🎉</span>
                <span>Won {winnings.toFixed(2)} 🪙!</span>
              </div>
            ) : (
              <div className="lose-message">
                <span className="result-icon">💥</span>
                <span>Game Over!</span>
              </div>
            )}
          </div>
        )}

        {/* Game Stats */}
        <div className="game-stats">
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
          <div className="stat">
            <span className="stat-label">Rate:</span>
            <span className="stat-value">{(gameStats.winRate * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinesGame;