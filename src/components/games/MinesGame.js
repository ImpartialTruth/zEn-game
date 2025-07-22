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
  
  // Enhanced Three.js 3D grid setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const isMobile = window.innerWidth < 768;
    
    // Enhanced scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 8, 40);
    
    // Responsive camera setup - enhanced isometric view
    const camera = new THREE.PerspectiveCamera(isMobile ? 50 : 60, 1, 0.1, 1000);
    const cameraDistance = isMobile ? 12 : 18;
    camera.position.set(cameraDistance * 0.6, cameraDistance * 0.8, cameraDistance * 0.6);
    camera.lookAt(0, 0, 0);
    
    // Enhanced renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;
      const size = isMobile ? Math.min(280, window.innerWidth - 60) : 400;
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    
    updateSize();
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Enhanced lighting system
    const ambientLight = new THREE.AmbientLight(0x404060, 0.7);
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(12, 15, 8);
    directionalLight.castShadow = !isMobile;
    if (!isMobile) {
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
    }
    scene.add(directionalLight);
    
    // Accent lighting
    const accentLight1 = new THREE.PointLight(0x00BCD4, 0.5, 30);
    accentLight1.position.set(-8, 8, 8);
    scene.add(accentLight1);
    
    const accentLight2 = new THREE.PointLight(0xBA68C8, 0.3, 25);
    accentLight2.position.set(8, 5, -5);
    scene.add(accentLight2);
    
    // Create enhanced 3D grid tiles
    const createTiles = () => {
      const tiles = [];
      const gridSize = 5;
      const scale = isMobile ? 0.8 : 1.0;
      const tileSize = 1.5 * scale;
      const spacing = 0.1 * scale;
      const totalSize = (tileSize + spacing) * gridSize - spacing;
      const offset = totalSize / 2 - tileSize / 2;
      
      for (let i = 0; i < GRID_SIZE; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        
        const x = col * (tileSize + spacing) - offset;
        const z = row * (tileSize + spacing) - offset;
        
        // Enhanced tile base with premium materials
        const tileGeometry = new THREE.BoxGeometry(tileSize, 0.4, tileSize);
        tileGeometry.translate(0, 0.2, 0); // Center the geometry
        
        const tileMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x2a2a3a,
          shininess: 60,
          specular: 0x666666
        });
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
        tile.position.set(x, 0, z);
        tile.castShadow = !isMobile;
        tile.receiveShadow = !isMobile;
        tile.userData = { id: i, revealed: false };
        
        // Tile border highlight
        const borderGeometry = new THREE.BoxGeometry(tileSize + 0.02, 0.01, tileSize + 0.02);
        const borderMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x00BCD4,
          transparent: true,
          opacity: 0.3
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(x, 0.41, z);
        scene.add(border);
        
        // Enhanced tile cover with texture-like appearance
        const coverGeometry = new THREE.BoxGeometry(tileSize * 0.9, 0.15, tileSize * 0.9);
        const coverMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x4a4a5a,
          shininess: 40,
          transparent: true,
          opacity: 1
        });
        const cover = new THREE.Mesh(coverGeometry, coverMaterial);
        cover.position.set(x, 0.48, z);
        cover.userData = { id: i, type: 'cover' };
        
        // Cover pattern
        const patternGeometry = new THREE.PlaneGeometry(tileSize * 0.6, tileSize * 0.6);
        const patternMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x666677,
          transparent: true,
          opacity: 0.5
        });
        const pattern = new THREE.Mesh(patternGeometry, patternMaterial);
        pattern.position.set(x, 0.56, z);
        pattern.rotation.x = -Math.PI / 2;
        scene.add(pattern);
        
        // Premium gem with crystal effect
        const gemGeometry = new THREE.OctahedronGeometry(0.35 * scale);
        const gemMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x00E5FF,
          transparent: true,
          opacity: 0,
          shininess: 200,
          specular: 0xffffff,
          emissive: 0x001122
        });
        const gem = new THREE.Mesh(gemGeometry, gemMaterial);
        gem.position.set(x, 0.6, z);
        gem.userData = { id: i, type: 'gem' };
        
        // Gem glow effect
        const glowGeometry = new THREE.SphereGeometry(0.5 * scale, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x00BCD4,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending
        });
        const gemGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        gemGlow.position.copy(gem.position);
        scene.add(gemGlow);
        
        // Dangerous mine with warning effects
        const mineGeometry = new THREE.SphereGeometry(0.3 * scale, 12, 8);
        const mineMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x2a1a1a,
          transparent: true,
          opacity: 0,
          shininess: 20
        });
        const mine = new THREE.Mesh(mineGeometry, mineMaterial);
        mine.position.set(x, 0.6, z);
        mine.userData = { id: i, type: 'mine' };
        
        // Mine spikes for danger indication
        const spikeGroup = new THREE.Group();
        for (let s = 0; s < 6; s++) {
          const spikeGeometry = new THREE.ConeGeometry(0.03, 0.2, 4);
          const spikeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a,
            transparent: true,
            opacity: 0
          });
          const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
          
          const angle = (s / 6) * Math.PI * 2;
          spike.position.set(
            Math.cos(angle) * 0.25,
            0.1,
            Math.sin(angle) * 0.25
          );
          spike.rotation.z = angle;
          spikeGroup.add(spike);
        }
        spikeGroup.position.copy(mine.position);
        scene.add(spikeGroup);
        
        scene.add(tile);
        scene.add(cover);
        scene.add(gem);
        scene.add(mine);
        
        tiles.push({ 
          tile, 
          cover, 
          pattern,
          border,
          gem, 
          gemGlow, 
          mine, 
          spikeGroup,
          id: i 
        });
      }
      
      return tiles;
    };
    
    const tiles = createTiles();
    
    // Enhanced base platform
    const platformSize = 12 * scale;
    const platformGeometry = new THREE.BoxGeometry(platformSize, 0.6, platformSize);
    const platformMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1a1a2a,
      shininess: 30
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -0.5;
    platform.receiveShadow = !isMobile;
    scene.add(platform);
    
    // Platform glow effect
    const platformGlowGeometry = new THREE.BoxGeometry(platformSize + 1, 0.1, platformSize + 1);
    const platformGlowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00BCD4,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    const platformGlow = new THREE.Mesh(platformGlowGeometry, platformGlowMaterial);
    platformGlow.position.y = -0.19;
    scene.add(platformGlow);
    
    // Handle window resize
    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);
    
    threeRef.current = { scene, camera, renderer, tiles };
    
    // Enhanced animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Enhanced gem animations
      tiles.forEach(tileObj => {
        if (tileObj.gem.material.opacity > 0) {
          tileObj.gem.rotation.y += 0.03;
          tileObj.gem.rotation.x += 0.015;
          
          // Gem floating effect
          tileObj.gem.position.y = 0.6 + Math.sin(time * 2 + tileObj.id) * 0.05;
          
          // Glow pulsing
          tileObj.gemGlow.material.opacity = 0.3 + Math.sin(time * 3 + tileObj.id) * 0.1;
        }
        
        // Mine danger indicators
        if (tileObj.mine.material.opacity > 0) {
          tileObj.spikeGroup.rotation.y += 0.02;
        }
      });
      
      // Platform glow animation
      platformGlow.material.opacity = 0.1 + Math.sin(time * 0.5) * 0.05;
      
      // Camera subtle movement
      camera.position.x += Math.sin(time * 0.1) * 0.01;
      camera.position.z += Math.cos(time * 0.15) * 0.01;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
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
          // Show mine with enhanced explosion effect
          tileObj.mine.material.opacity = 1;
          tileObj.mine.material.color.setHex(0xff4444);
          tileObj.mine.material.emissive.setHex(0x441111);
          tileObj.spikeGroup.children.forEach(spike => {
            spike.material.opacity = 1;
            spike.material.color.setHex(0xff2222);
          });
          tileObj.tile.material.color.setHex(0x664444);
          
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
          // Show gem with enhanced effects
          tileObj.gem.material.opacity = 1;
          tileObj.gemGlow.material.opacity = 0.3;
          tileObj.tile.material.color.setHex(0x004455);
          tileObj.border.material.opacity = 0.8;
        }
      } else {
        // Reset tile to original state
        tileObj.cover.material.opacity = 1;
        tileObj.pattern.material.opacity = 0.5;
        tileObj.gem.material.opacity = 0;
        tileObj.gemGlow.material.opacity = 0;
        tileObj.mine.material.opacity = 0;
        tileObj.spikeGroup.children.forEach(spike => {
          spike.material.opacity = 0;
        });
        tileObj.tile.material.color.setHex(0x2a2a3a);
        tileObj.border.material.opacity = 0.3;
      }
      
      // Show all mines when game is lost
      if (gameState === 'lost' && minePositions.has(tileObj.id)) {
        tileObj.mine.material.opacity = 0.8;
        tileObj.spikeGroup.children.forEach(spike => {
          spike.material.opacity = 0.6;
        });
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

      {/* Enhanced 3D Game Grid */}
      <div className="game-container" style={{
        background: 'linear-gradient(135deg, rgba(10,10,26,0.9) 0%, rgba(5,5,15,0.95) 100%)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 15px 35px rgba(0,188,212,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(0,188,212,0.3)'
      }}>
        <div 
          ref={containerRef}
          className="mines-grid-3d"
          style={{ 
            width: window.innerWidth < 768 ? '280px' : '400px', 
            height: window.innerWidth < 768 ? '280px' : '400px', 
            margin: '0 auto', 
            cursor: 'pointer',
            borderRadius: '15px',
            overflow: 'hidden',
            background: 'radial-gradient(circle, rgba(0,188,212,0.05) 0%, transparent 70%)',
            border: '2px solid rgba(0,188,212,0.1)'
          }}
          onClick={(e) => {
            if (gameState !== 'playing') return;
            
            // Enhanced tile selection with better precision
            const rect = e.currentTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculate relative position from center
            const relativeX = (e.clientX - centerX) / (rect.width * 0.4);
            const relativeY = (e.clientY - centerY) / (rect.height * 0.4);
            
            // Convert to grid coordinates (5x5)
            const col = Math.floor((relativeX + 2.5));
            const row = Math.floor((relativeY + 2.5));
            
            // Ensure within bounds
            if (col >= 0 && col < 5 && row >= 0 && row < 5) {
              const tileId = row * 5 + col;
              if (tileId >= 0 && tileId < GRID_SIZE) {
                handleTileClick(tileId);
              }
            }
          }}
        />
        <div style={{ 
          textAlign: 'center', 
          color: '#00BCD4', 
          fontSize: window.innerWidth < 768 ? '12px' : '14px',
          marginTop: '10px',
          textShadow: '0 0 10px rgba(0,188,212,0.5)'
        }}>
          {gameState === 'playing' ? 'Touch tiles to discover gems 💎 or avoid mines 💣' : 'Premium 3D Mining Experience'}
        </div>
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