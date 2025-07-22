import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import './LuckyWheelGame.css';

const LuckyWheelGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('idle'); // idle, spinning, result
  const [betAmount, setBetAmount] = useState('');
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);
  const threeRef = useRef({ scene: null, camera: null, renderer: null, wheel: null });

  const wheelSections = [
    { id: 1, label: '2x', multiplier: 2, color: '#ff6b6b', angle: 0 },
    { id: 2, label: '1.5x', multiplier: 1.5, color: '#feca57', angle: 45 },
    { id: 3, label: '0.5x', multiplier: 0.5, color: '#48dbfb', angle: 90 },
    { id: 4, label: '3x', multiplier: 3, color: '#ff9ff3', angle: 135 },
    { id: 5, label: '1x', multiplier: 1, color: '#54a0ff', angle: 180 },
    { id: 6, label: '5x', multiplier: 5, color: '#5f27cd', angle: 225 },
    { id: 7, label: '0x', multiplier: 0, color: '#222f3e', angle: 270 },
    { id: 8, label: '10x', multiplier: 10, color: '#00d2d3', angle: 315 }
  ];

  const spinWheel = () => {
    if (!betAmount || isSpinning) return;
    
    setIsSpinning(true);
    setGameState('spinning');
    
    // Random result
    const randomIndex = Math.floor(Math.random() * wheelSections.length);
    const winningSection = wheelSections[randomIndex];
    
    // Calculate rotation
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const targetAngle = 360 - winningSection.angle; // Invert because wheel spins clockwise
    const finalRotation = rotation + (spins * 360) + targetAngle;
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      setResult(winningSection);
      setIsSpinning(false);
      setGameState('result');
    }, 4000);
  };

  const resetGame = () => {
    setGameState('idle');
    setResult(null);
    setBetAmount('');
    setRotation(0);
  };
  
  // Enhanced Three.js 3D Wheel Setup
  useEffect(() => {
    const container = wheelRef.current;
    if (!container) return;
    
    // Scene setup with gradient background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f23);
    scene.fog = new THREE.Fog(0x0f0f23, 5, 30);
    
    // Responsive camera setup
    const isMobile = window.innerWidth < 768;
    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
    camera.position.set(0, 0, isMobile ? 6 : 8);
    
    // Enhanced renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;
      const size = isMobile ? Math.min(300, window.innerWidth - 40) : 400;
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
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);
    
    // Main spotlight
    const spotLight = new THREE.SpotLight(0xffffff, 2.0);
    spotLight.position.set(0, 0, 10);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.3;
    spotLight.decay = 1;
    spotLight.distance = 50;
    spotLight.castShadow = !isMobile;
    scene.add(spotLight);
    
    // Colored rim lights
    const rimLight1 = new THREE.DirectionalLight(0x00BCD4, 0.5);
    rimLight1.position.set(5, 5, 3);
    scene.add(rimLight1);
    
    const rimLight2 = new THREE.DirectionalLight(0xBA68C8, 0.3);
    rimLight2.position.set(-5, 3, 2);
    scene.add(rimLight2);
    
    // Create Enhanced 3D Wheel
    const createWheel = () => {
      const wheelGroup = new THREE.Group();
      const scale = isMobile ? 0.8 : 1.0;
      
      // Premium wheel base with metallic finish
      const wheelGeometry = new THREE.CylinderGeometry(3 * scale, 3 * scale, 0.6, 32);
      const wheelMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2a2a3a,
        shininess: 100,
        specular: 0x666666
      });
      const wheelBase = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelBase.castShadow = !isMobile;
      wheelGroup.add(wheelBase);
      
      // Decorative rim
      const rimGeometry = new THREE.TorusGeometry(3 * scale, 0.1, 8, 32);
      const rimMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffd700,
        shininess: 150
      });
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.position.z = 0.35;
      wheelGroup.add(rim);
      
      // Enhanced wheel sections with gradient effects
      wheelSections.forEach((section, index) => {
        const sectionAngle = (Math.PI * 2) / wheelSections.length;
        const startAngle = sectionAngle * index;
        
        // Create section with bevel effect
        const sectionGeometry = new THREE.RingGeometry(1 * scale, 3 * scale, 0, sectionAngle, 16);
        const sectionMaterial = new THREE.MeshPhongMaterial({ 
          color: section.color,
          transparent: true,
          opacity: 0.95,
          shininess: 80,
          specular: new THREE.Color(section.color).multiplyScalar(0.5)
        });
        const sectionMesh = new THREE.Mesh(sectionGeometry, sectionMaterial);
        sectionMesh.position.z = 0.31;
        sectionMesh.rotation.z = startAngle;
        wheelGroup.add(sectionMesh);
        
        // Add section border for definition
        const borderGeometry = new THREE.RingGeometry(2.9 * scale, 3 * scale, 0, sectionAngle, 8);
        const borderMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x222222,
          transparent: true,
          opacity: 0.8
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.z = 0.32;
        border.rotation.z = startAngle;
        wheelGroup.add(border);
        
        // Enhanced section text with better visibility
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const canvasSize = isMobile ? 96 : 128;
        canvas.width = canvasSize;
        canvas.height = canvasSize / 2;
        
        // Text with outline for better readability
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const fontSize = isMobile ? 18 : 24;
        context.font = `bold ${fontSize}px Arial, sans-serif`;
        
        // Draw text outline
        context.strokeStyle = '#000000';
        context.lineWidth = 3;
        context.strokeText(section.label, canvasSize/2, canvasSize/4);
        
        // Draw text fill
        context.fillStyle = '#ffffff';
        context.fillText(section.label, canvasSize/2, canvasSize/4);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const spriteMaterial = new THREE.SpriteMaterial({ 
          map: texture,
          transparent: true,
          alphaTest: 0.5
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        const textRadius = 2 * scale;
        const textAngle = startAngle + sectionAngle / 2;
        sprite.position.set(
          Math.cos(textAngle) * textRadius,
          Math.sin(textAngle) * textRadius,
          0.4
        );
        const spriteScale = isMobile ? 0.6 : 0.8;
        sprite.scale.set(spriteScale, spriteScale * 0.5, 1);
        wheelGroup.add(sprite);
        
        // Section dividers
        const dividerGeometry = new THREE.PlaneGeometry(0.05, 2);
        const dividerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
        divider.position.set(
          Math.cos(startAngle) * 2,
          Math.sin(startAngle) * 2,
          0.3
        );
        divider.rotation.z = startAngle;
        wheelGroup.add(divider);
      });
      
      // Premium center hub with jewel effect
      const hubGeometry = new THREE.CylinderGeometry(0.5 * scale, 0.5 * scale, 0.9, 16);
      const hubMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffd700,
        shininess: 200,
        specular: 0xffffff,
        transparent: true,
        opacity: 0.95
      });
      const hub = new THREE.Mesh(hubGeometry, hubMaterial);
      hub.castShadow = !isMobile;
      wheelGroup.add(hub);
      
      // Hub decoration
      const decorGeometry = new THREE.TorusGeometry(0.3 * scale, 0.05, 8, 16);
      const decorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const decoration = new THREE.Mesh(decorGeometry, decorMaterial);
      decoration.position.z = 0.5;
      wheelGroup.add(decoration);
      
      return wheelGroup;
    };
    
    const wheel = createWheel();
    scene.add(wheel);
    
    // Enhanced pointer with glow effect
    const pointerGeometry = new THREE.ConeGeometry(0.25 * scale, 1.0 * scale, 8);
    const pointerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff4444,
      shininess: 100,
      emissive: 0x440000
    });
    const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
    pointer.position.set(0, 3.2 * scale, 0.6);
    pointer.rotation.z = Math.PI;
    scene.add(pointer);
    
    // Pointer glow
    const glowGeometry = new THREE.SphereGeometry(0.3 * scale, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff4444,
      transparent: true,
      opacity: 0.3
    });
    const pointerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    pointerGlow.position.copy(pointer.position);
    scene.add(pointerGlow);
    
    // Handle resize
    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);
    
    threeRef.current = { scene, camera, renderer, wheel, pointerGlow };
    
    // Enhanced animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Pointer glow pulsing
      const time = Date.now() * 0.003;
      pointerGlow.material.opacity = 0.2 + Math.sin(time) * 0.1;
      pointerGlow.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
      
      // Subtle hub rotation
      if (wheel && !isSpinning) {
        wheel.children.forEach((child, index) => {
          if (child.geometry instanceof THREE.CylinderGeometry && index > 0) {
            child.rotation.z += 0.002;
          }
        });
      }
      
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
    };
  }, []);
  
  // Update wheel rotation
  useEffect(() => {
    const { wheel } = threeRef.current;
    if (wheel) {
      wheel.rotation.z = (rotation * Math.PI) / 180;
    }
  }, [rotation]);

  const calculateWinnings = () => {
    if (!result || !betAmount) return 0;
    return parseFloat(betAmount) * result.multiplier;
  };

  return (
    <div className="lucky-wheel-game">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="game-title">3D Lucky Wheel</h1>
        <div className="balance-display">
          Balance: 1000🪙
        </div>
      </div>

      <div className="game-content">
        <div className="wheel-display" style={{
          background: 'linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(15,15,35,0.95) 100%)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 10px 40px rgba(0,188,212,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,215,0,0.3)'
        }}>
          <div 
            ref={wheelRef}
            className="wheel-container-3d"
            style={{ 
              width: window.innerWidth < 768 ? '300px' : '400px', 
              height: window.innerWidth < 768 ? '300px' : '400px', 
              margin: '0 auto',
              borderRadius: '15px',
              overflow: 'hidden',
              background: 'radial-gradient(circle, rgba(0,188,212,0.1) 0%, transparent 70%)'
            }}
          />
          
          {gameState === 'result' && result && (
            <div className="result-display">
              <div className="result-section" style={{ backgroundColor: result.color }}>
                <div className="result-multiplier">{result.label}</div>
              </div>
              <div className="result-text">
                {result.multiplier > 0 ? 'You Win!' : 'Better Luck Next Time!'}
              </div>
              <div className="result-amount">
                {result.multiplier > 0 ? '+' : ''}{calculateWinnings().toFixed(2)} 🪙
              </div>
            </div>
          )}
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
                  min="20"
                  max="200"
                  disabled={gameState !== 'idle'}
                />
                <span className="currency-symbol">🪙</span>
              </div>
            </div>

            <div className="wheel-prizes">
              <h3 className="prizes-title">3D Wheel Prizes</h3>
              <div className="prizes-grid">
                {wheelSections.map(section => (
                  <div key={section.id} className="prize-item">
                    <div 
                      className="prize-color"
                      style={{ backgroundColor: section.color }}
                    ></div>
                    <span className="prize-label">{section.label}</span>
                    <span className="prize-amount">
                      {betAmount ? (parseFloat(betAmount) * section.multiplier).toFixed(2) : '0'} 🪙
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="action-section">
            {gameState === 'idle' && (
              <button 
                className="spin-button"
                onClick={spinWheel}
                disabled={!betAmount}
              >
                <span className="spin-icon">🎡</span>
                Spin Wheel
              </button>
            )}
            
            {gameState === 'spinning' && (
              <button className="spin-button spinning" disabled>
                <div className="loading-spinner"></div>
                Spinning...
              </button>
            )}
            
            {gameState === 'result' && (
              <button 
                className="play-again-button"
                onClick={resetGame}
              >
                Play Again
              </button>
            )}
          </div>

          <div className="game-info">
            <div className="info-card">
              <div className="info-header">
                <span className="info-title">How to Play</span>
              </div>
              <div className="info-content">
                <ul className="rules-list">
                  <li>Place your bet (20-200 coins)</li>
                  <li>Spin the wheel</li>
                  <li>Win based on where it lands</li>
                  <li>Multipliers range from 0x to 10x</li>
                </ul>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-label">Your Bet:</span>
                <span className="stat-value">{betAmount || '0'} 🪙</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max Win:</span>
                <span className="stat-value">
                  {betAmount ? (parseFloat(betAmount) * 10).toFixed(2) : '0'} 🪙
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status:</span>
                <span className={`stat-value ${gameState}`}>
                  {gameState === 'idle' ? 'Ready' : 
                   gameState === 'spinning' ? 'Spinning' : 'Complete'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyWheelGame;