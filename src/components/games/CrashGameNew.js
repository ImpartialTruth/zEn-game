import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import './CrashGame.css';

const CrashGameNew = ({ onBack }) => {
  // Game state
  const [gameState, setGameState] = useState('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [betAmount, setBetAmount] = useState('10');
  const [isPlaying, setIsPlaying] = useState(false);
  const [cashOutAt, setCashOutAt] = useState('');
  const [gameHistory, setGameHistory] = useState([2.34, 1.56, 8.92, 1.23, 5.67]);
  const [countdown, setCountdown] = useState(5);
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

  // Refs
  const containerRef = useRef(null);
  const threeRef = useRef({});
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);

  // Enhanced crash point generation
  const generateCrashPoint = useCallback(() => {
    const random = Math.random();
    if (random < 0.4) return 1.01 + Math.random() * 0.8; // 40% early crash
    if (random < 0.7) return 1.8 + Math.random() * 2.2; // 30% medium crash  
    if (random < 0.9) return 4.0 + Math.random() * 6.0; // 20% high crash
    return 10 + Math.random() * 90; // 10% moon crash
  }, []);

  // Create realistic F-16 Fighting Falcon
  const createRealisticAirplane = () => {
    const airplaneGroup = new THREE.Group();
    
    // Main fuselage - sleek fighter jet body
    const fuselageGeometry = new THREE.CylinderGeometry(0.15, 0.08, 3.2, 12);
    const fuselageMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a5568,
      shininess: 100,
      specular: 0x888888
    });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.position.x = 0.2;
    airplaneGroup.add(fuselage);

    // Cockpit canopy - realistic fighter cockpit
    const canopyGeometry = new THREE.SphereGeometry(0.25, 8, 6, 0, Math.PI);
    const canopyMaterial = new THREE.MeshPhongMaterial({
      color: 0x2d3748,
      transparent: true,
      opacity: 0.8,
      shininess: 200
    });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.set(0.8, 0.1, 0);
    canopy.rotation.z = Math.PI / 2;
    airplaneGroup.add(canopy);

    // Delta wings - F-16 style swept wings
    const wingGeometry = new THREE.ConeGeometry(1.8, 0.8, 3);
    const wingMaterial = new THREE.MeshPhongMaterial({
      color: 0x5a6578,
      shininess: 80
    });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.rotation.x = Math.PI / 2;
    leftWing.rotation.z = -Math.PI / 6;
    leftWing.position.set(-0.2, 0, 1.2);
    airplaneGroup.add(leftWing);
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.rotation.x = Math.PI / 2;
    rightWing.rotation.z = Math.PI / 6;
    rightWing.position.set(-0.2, 0, -1.2);
    airplaneGroup.add(rightWing);

    // Vertical stabilizer - tail fin
    const tailGeometry = new THREE.ConeGeometry(0.8, 1.2, 3);
    const tail = new THREE.Mesh(tailGeometry, wingMaterial);
    tail.rotation.z = Math.PI / 2;
    tail.position.set(-1.2, 0.6, 0);
    airplaneGroup.add(tail);

    // Engine exhaust with afterburner effect
    const exhaustGeometry = new THREE.CylinderGeometry(0.12, 0.18, 0.6, 8);
    const exhaustMaterial = new THREE.MeshPhongMaterial({
      color: 0x2d2d2d,
      emissive: 0x331100
    });
    const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust.rotation.z = Math.PI / 2;
    exhaust.position.x = -1.6;
    airplaneGroup.add(exhaust);

    // Afterburner flame effect
    const flameGeometry = new THREE.ConeGeometry(0.1, 0.8, 6);
    const flameMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true,
      opacity: 0.8
    });
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.rotation.z = -Math.PI / 2;
    flame.position.x = -2.0;
    airplaneGroup.add(flame);

    // Landing gear (retracted position details)
    const gearGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.3);
    const gearMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const gear = new THREE.Mesh(gearGeometry, gearMaterial);
    gear.position.set(0.2, -0.15, 0);
    airplaneGroup.add(gear);

    // Scale and position
    airplaneGroup.scale.set(0.8, 0.8, 0.8);
    return airplaneGroup;
  };

  // Create procedural sky dome with gradient
  const createSkyDome = () => {
    const skyGeometry = new THREE.SphereGeometry(100, 32, 16);
    
    // Create procedural sky texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Sky gradient
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue top
    gradient.addColorStop(0.7, '#98D8E8'); // Light blue
    gradient.addColorStop(1, '#F0F8FF'); // Almost white bottom
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    // Add subtle cloud texture
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 20 + Math.random() * 40;
      
      const cloudGradient = context.createRadialGradient(x, y, 0, x, y, radius);
      cloudGradient.addColorStop(0, 'rgba(255,255,255,0.3)');
      cloudGradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      context.fillStyle = cloudGradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    const skyTexture = new THREE.CanvasTexture(canvas);
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide
    });
    
    return new THREE.Mesh(skyGeometry, skyMaterial);
  };

  // Create dynamic cloud system
  const createCloudSystem = () => {
    const cloudGroup = new THREE.Group();
    const cloudCount = window.innerWidth < 768 ? 8 : 15;
    
    for (let i = 0; i < cloudCount; i++) {
      const cloudGeometry = new THREE.SphereGeometry(
        2 + Math.random() * 3, 
        8, 
        6
      );
      
      const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.3
      });
      
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.position.set(
        (Math.random() - 0.5) * 80,
        10 + Math.random() * 20,
        (Math.random() - 0.5) * 80
      );
      
      cloud.userData = {
        originalY: cloud.position.y,
        floatSpeed: 0.5 + Math.random() * 0.5
      };
      
      cloudGroup.add(cloud);
    }
    
    return cloudGroup;
  };

  // Create trail effect system
  const createTrailSystem = () => {
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xff6b35,
      transparent: true,
      opacity: 0.8,
      linewidth: 3
    });
    
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    return trailLine;
  };

  // Enhanced sound system
  const playSound = useCallback((type) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const sounds = {
        engine: { frequency: 120, duration: 2.0, type: 'sawtooth' },
        cashout: { frequency: 800, duration: 0.5, type: 'sine' },
        crash: { frequency: 60, duration: 1.0, type: 'square' },
        tick: { frequency: 1200, duration: 0.1, type: 'sine' }
      };
      
      const sound = sounds[type];
      if (sound) {
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
        
        if (type === 'engine') {
          // Engine sound with modulation
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(
            sound.frequency * 1.5, 
            audioContext.currentTime + sound.duration
          );
        } else {
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        }
        
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
      
      const calculatedWinnings = parseFloat(betAmount || 0) * multiplier;
      setWinnings(calculatedWinnings);
      
      setGameStats(prev => ({
        ...prev,
        totalGames: prev.totalGames + 1,
        totalWinnings: prev.totalWinnings + calculatedWinnings,
        bestMultiplier: Math.max(prev.bestMultiplier, multiplier),
        totalWins: prev.totalWins + 1,
        winRate: (prev.totalGames + 1) > 0 ? (prev.totalWins + 1) / (prev.totalGames + 1) : 0
      }));
      
      playSound('cashout');
    }
  }, [isPlaying, gameState, userCashedOut, betAmount, multiplier, playSound]);

  // Three.js scene setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 30, 200);

    // Camera setup - cinematic angle
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 55 : 65,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    
    camera.position.set(
      isMobile ? 8 : 12,
      isMobile ? 4 : 6,
      isMobile ? 8 : 12
    );
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;
      const width = container.clientWidth;
      const height = isMobile ? Math.min(350, window.innerHeight * 0.4) : 450;
      
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    
    updateSize();
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    container.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(20, 20, 10);
    directionalLight.castShadow = !isMobile;
    if (!isMobile) {
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
    }
    scene.add(directionalLight);

    // Create scene elements
    const airplane = createRealisticAirplane();
    const skyDome = createSkyDome();
    const clouds = createCloudSystem();
    const trail = createTrailSystem();
    
    scene.add(airplane);
    scene.add(skyDome);
    scene.add(clouds);
    scene.add(trail);

    // Ground/ocean
    const oceanGeometry = new THREE.PlaneGeometry(200, 200, 32, 32);
    const oceanMaterial = new THREE.MeshPhongMaterial({
      color: 0x006994,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -15;
    scene.add(ocean);

    // Store references
    threeRef.current = {
      scene,
      camera,
      renderer,
      airplane,
      clouds,
      trail,
      ocean,
      trailPoints: []
    };

    // Handle resize
    const handleResize = () => updateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!threeRef.current.scene) return;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { airplane, clouds, ocean, camera, renderer, scene } = threeRef.current;

      // Animate airplane based on game state
      if (gameState === 'playing') {
        const progress = Math.min((multiplier - 1) / 10, 1);
        
        // Smooth flight path
        airplane.position.x = progress * 20 - 10;
        airplane.position.y = Math.sin(progress * Math.PI * 0.5) * 8;
        airplane.position.z = Math.sin(time * 2) * 2;
        
        // Banking and rotation
        airplane.rotation.z = Math.sin(time * 3) * 0.1;
        airplane.rotation.y = progress * 0.3;
        
        // Afterburner effect
        const flame = airplane.children.find(child => 
          child.material && child.material.color && child.material.color.getHex() === 0xff4500
        );
        if (flame) {
          flame.material.opacity = 0.6 + Math.sin(time * 10) * 0.3;
          flame.scale.x = 1 + Math.sin(time * 8) * 0.5;
        }

        // Engine sound
        if (multiplier > 1.5 && Math.random() > 0.98) {
          playSound('engine');
        }
      }

      // Animate clouds
      clouds.children.forEach((cloud, index) => {
        cloud.position.y = cloud.userData.originalY + 
          Math.sin(time * cloud.userData.floatSpeed + index) * 2;
        cloud.rotation.y += 0.002;
      });

      // Animate ocean waves
      const oceanPositions = ocean.geometry.attributes.position;
      for (let i = 0; i < oceanPositions.count; i++) {
        const x = oceanPositions.getX(i);
        const z = oceanPositions.getZ(i);
        const y = Math.sin(x * 0.1 + time) * 0.5 + Math.cos(z * 0.1 + time * 0.8) * 0.3;
        oceanPositions.setY(i, y);
      }
      oceanPositions.needsUpdate = true;

      // Dynamic camera movement
      camera.position.x += Math.sin(time * 0.2) * 0.02;
      camera.position.y += Math.cos(time * 0.15) * 0.01;
      camera.lookAt(airplane.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, multiplier, playSound]);

  // Game logic
  useEffect(() => {
    let countdownInterval;
    
    if (gameState === 'waiting' && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('playing');
            playSound('engine');
            return 0;
          }
          playSound('tick');
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(countdownInterval);
  }, [gameState, countdown, playSound]);

  // Main game loop
  useEffect(() => {
    let interval;
    let crashPoint;
    
    if (gameState === 'playing') {
      crashPoint = generateCrashPoint();
      
      interval = setInterval(() => {
        setMultiplier(prev => {
          const increment = 0.01 + (prev - 1) * 0.003;
          const newMultiplier = prev + increment;
          
          // Auto cash out
          if (autoCashOutEnabled && 
              cashOutAt && 
              parseFloat(cashOutAt) <= newMultiplier && 
              isPlaying && 
              !userCashedOut) {
            handleCashOut();
            return newMultiplier;
          }
          
          // Check crash
          if (newMultiplier >= crashPoint) {
            setGameState('crashed');
            setIsPlaying(false);
            
            setGameStats(prev => ({
              ...prev,
              totalGames: prev.totalGames + 1,
              winRate: (prev.totalGames + 1) > 0 ? prev.totalWins / (prev.totalGames + 1) : 0
            }));
            
            playSound('crash');
            setGameHistory(prev => [newMultiplier, ...prev.slice(0, 4)]);
            
            setTimeout(() => {
              setMultiplier(1.00);
              setGameState('waiting');
              setWinnings(0);
              setCountdown(5);
              setUserCashedOut(false);
            }, 3000);
            
            return newMultiplier;
          }
          
          return newMultiplier;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [gameState, autoCashOutEnabled, cashOutAt, isPlaying, userCashedOut, generateCrashPoint, playSound, handleCashOut]);

  const handlePlaceBet = () => {
    if (betAmount && parseFloat(betAmount) > 0 && gameState === 'waiting') {
      setIsPlaying(true);
      setUserCashedOut(false);
      setWinnings(0);
    }
  };

  const getMultiplierColor = () => {
    if (gameState === 'crashed') return '#ff4757';
    if (multiplier < 2) return '#ff6b35';
    if (multiplier < 5) return '#ffd23f';
    return '#2ed573';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '10px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '0 10px'
      }}>
        <button 
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        
        <h1 style={{
          color: 'white',
          margin: 0,
          fontSize: window.innerWidth < 768 ? '24px' : '28px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🚀 Crash Flight
        </h1>
        
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          padding: '10px 15px',
          color: 'white',
          fontSize: '14px'
        }}>
          Balance: 1000 🪙
        </div>
      </div>

      {/* Game History */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {gameHistory.map((mult, index) => (
          <div
            key={index}
            style={{
              background: mult < 2 ? '#ff4757' : mult < 5 ? '#ffd23f' : '#2ed573',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '60px',
              textAlign: 'center'
            }}
          >
            {mult.toFixed(2)}x
          </div>
        ))}
      </div>

      {/* 3D Game Display */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: window.innerWidth < 768 ? '350px' : '450px',
            borderRadius: '15px',
            overflow: 'hidden',
            position: 'relative'
          }}
        />
        
        {/* Multiplier Overlay */}
        <div style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          background: 'rgba(0,0,0,0.8)',
          borderRadius: '15px',
          padding: '20px 30px',
          color: getMultiplierColor(),
          fontSize: window.innerWidth < 768 ? '36px' : '48px',
          fontWeight: 'bold',
          textShadow: `0 0 20px ${getMultiplierColor()}`,
          border: `2px solid ${getMultiplierColor()}`,
          boxShadow: `0 0 30px ${getMultiplierColor()}50`
        }}>
          {multiplier.toFixed(2)}x
        </div>

        {/* Game State Messages */}
        {gameState === 'waiting' && countdown > 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '15px',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            Starting in {countdown}...
          </div>
        )}

        {gameState === 'crashed' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,71,87,0.9)',
            color: 'white',
            padding: '30px 50px',
            borderRadius: '20px',
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
            animation: 'pulse 0.5s ease-in-out'
          }}>
            💥 CRASHED!<br/>
            <span style={{ fontSize: '20px' }}>at {multiplier.toFixed(2)}x</span>
          </div>
        )}
      </div>

      {/* Game Controls */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
        gap: '20px'
      }}>
        {/* Betting Section */}
        <div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>
              Bet Amount
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={gameState === 'playing'}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  background: 'rgba(255,255,255,0.9)'
                }}
                min="1"
                max="1000"
              />
              <span style={{ color: 'white', fontSize: '18px' }}>🪙</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            {[10, 50, 100].map(amount => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount.toString())}
                disabled={gameState === 'playing'}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Auto Cash Out */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '10px'
            }}>
              <input
                type="checkbox"
                checked={autoCashOutEnabled}
                onChange={(e) => setAutoCashOutEnabled(e.target.checked)}
                disabled={gameState === 'playing'}
              />
              Auto Cash Out
            </label>
            {autoCashOutEnabled && (
              <input
                type="number"
                placeholder="2.00"
                value={cashOutAt}
                onChange={(e) => setCashOutAt(e.target.value)}
                disabled={gameState === 'playing'}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px'
                }}
                min="1.01"
                max="1000"
                step="0.01"
              />
            )}
          </div>
        </div>

        {/* Action Section */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {!isPlaying ? (
            <button
              onClick={handlePlaceBet}
              disabled={!betAmount || parseFloat(betAmount) < 1 || gameState !== 'waiting'}
              style={{
                padding: '20px',
                borderRadius: '15px',
                border: 'none',
                background: gameState === 'waiting' ? 
                  'linear-gradient(45deg, #ff6b35, #f7931e)' : 
                  'rgba(255,255,255,0.3)',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: gameState === 'waiting' ? 'pointer' : 'not-allowed',
                marginBottom: '15px'
              }}
            >
              {gameState === 'waiting' ? 
                (countdown > 0 ? `Wait ${countdown}s` : 'Place Bet') : 
                'Next Round'
              }
            </button>
          ) : (
            <button
              onClick={handleCashOut}
              disabled={gameState === 'crashed' || userCashedOut}
              style={{
                padding: '20px',
                borderRadius: '15px',
                border: 'none',
                background: userCashedOut ? 
                  'rgba(46,213,115,0.8)' : 
                  'linear-gradient(45deg, #2ed573, #17c0eb)',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: userCashedOut ? 'not-allowed' : 'pointer',
                marginBottom: '15px',
                animation: userCashedOut ? 'none' : 'pulse 1s infinite'
              }}
            >
              {userCashedOut ? 
                `Cashed Out: ${winnings.toFixed(2)} 🪙` :
                `CASH OUT: ${(parseFloat(betAmount || 0) * multiplier).toFixed(2)} 🪙`
              }
            </button>
          )}

          {/* Messages */}
          {gameState === 'crashed' && !userCashedOut && (
            <div style={{
              background: 'rgba(255,71,87,0.2)',
              color: '#ff4757',
              padding: '15px',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              💥 Crashed at {multiplier.toFixed(2)}x!
            </div>
          )}
          
          {userCashedOut && winnings > 0 && (
            <div style={{
              background: 'rgba(46,213,115,0.2)',
              color: '#2ed573',
              padding: '15px',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              🎉 Won {winnings.toFixed(2)} 🪙 at {multiplier.toFixed(2)}x!
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '15px',
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '15px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Games</div>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            {gameStats.totalGames}
          </div>
        </div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Best</div>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            {gameStats.bestMultiplier.toFixed(2)}x
          </div>
        </div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Won</div>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            {gameStats.totalWinnings.toFixed(0)} 🪙
          </div>
        </div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Rate</div>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            {(gameStats.winRate * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CrashGameNew;