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
  
  // Three.js 3D Wheel Setup
  useEffect(() => {
    const container = wheelRef.current;
    if (!container) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000);
    camera.position.set(0, 0, 8);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(0, 0, 10);
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    // Create 3D Wheel
    const createWheel = () => {
      const wheelGroup = new THREE.Group();
      
      // Main wheel base
      const wheelGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 32);
      const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const wheelBase = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelBase.castShadow = true;
      wheelGroup.add(wheelBase);
      
      // Wheel sections
      wheelSections.forEach((section, index) => {
        const sectionAngle = (Math.PI * 2) / wheelSections.length;
        const startAngle = sectionAngle * index;
        const endAngle = sectionAngle * (index + 1);
        
        // Create section geometry
        const sectionGeometry = new THREE.RingGeometry(1, 3, 0, sectionAngle);
        const sectionMaterial = new THREE.MeshPhongMaterial({ 
          color: section.color,
          transparent: true,
          opacity: 0.9 
        });
        const sectionMesh = new THREE.Mesh(sectionGeometry, sectionMaterial);
        sectionMesh.position.z = 0.26;
        sectionMesh.rotation.z = startAngle;
        wheelGroup.add(sectionMesh);
        
        // Section text (using sprites)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;
        context.fillStyle = '#ffffff';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(section.label, 64, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        const textRadius = 2;
        const textAngle = startAngle + sectionAngle / 2;
        sprite.position.set(
          Math.cos(textAngle) * textRadius,
          Math.sin(textAngle) * textRadius,
          0.3
        );
        sprite.scale.set(0.8, 0.4, 1);
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
      
      // Center hub
      const hubGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16);
      const hubMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
      const hub = new THREE.Mesh(hubGeometry, hubMaterial);
      hub.castShadow = true;
      wheelGroup.add(hub);
      
      return wheelGroup;
    };
    
    const wheel = createWheel();
    scene.add(wheel);
    
    // Pointer
    const pointerGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
    const pointerMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
    const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
    pointer.position.set(0, 3.2, 0.5);
    pointer.rotation.z = Math.PI;
    scene.add(pointer);
    
    threeRef.current = { scene, camera, renderer, wheel };
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    
    return () => {
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
        <div className="wheel-display">
          <div 
            ref={wheelRef}
            className="wheel-container-3d"
            style={{ width: '400px', height: '400px', margin: '0 auto' }}
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