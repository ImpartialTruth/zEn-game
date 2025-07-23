import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import './LoadingScreen.css';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const threeRef = useRef({ scene: null, camera: null, renderer: null, particles: null });
  const containerRef = useRef(null);
  
  const particles = useMemo(() => 
    [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 3 + Math.random() * 2
    })), []
  );
  
  // Enhanced Three.js 3D cosmic experience
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Enhanced scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.Fog(0x050508, 20, 120);
    
    // Responsive camera setup
    const isMobile = window.innerWidth < 768;
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 60 : 75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 0, isMobile ? 25 : 35);
    
    // Enhanced renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: !isMobile,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    container.appendChild(renderer.domElement);
    
    // Create realistic starfield
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = isMobile ? 800 : 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Realistic star colors based on stellar classification
    const starColors = [
      new THREE.Color(0xFFFFFF), // White dwarf
      new THREE.Color(0xFFF4EA), // Sun-like
      new THREE.Color(0xFFE4B5), // Warm yellow
      new THREE.Color(0xFFD700), // Golden
      new THREE.Color(0xE6E6FA), // Blue-white
      new THREE.Color(0xB0C4DE), // Light blue
      new THREE.Color(0xFF6B47), // Red giant
      new THREE.Color(0xFFA500)  // Orange
    ];
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute stars realistically in 3D space
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 100 + Math.random() * 200;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Realistic star color distribution
      const colorIndex = Math.floor(Math.pow(Math.random(), 2) * starColors.length);
      const color = starColors[colorIndex];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Realistic star size distribution (most stars are small)
      sizes[i] = Math.pow(Math.random(), 3) * 2 + 0.5;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Realistic star material
    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 1.0 : 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    
    // Add realistic nebula clouds
    const createNebula = () => {
      const nebulaGroup = new THREE.Group();
      const cloudCount = isMobile ? 3 : 6;
      
      for (let i = 0; i < cloudCount; i++) {
        const cloudGeometry = new THREE.SphereGeometry(15 + Math.random() * 20, 8, 6);
        
        // Realistic nebula colors (hydrogen, oxygen, sulfur emissions)
        const nebulaColors = [0x994455, 0x556699, 0x669944, 0x664499, 0x996644];
        const nebulaColor = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
        
        const cloudMaterial = new THREE.MeshBasicMaterial({
          color: nebulaColor,
          transparent: true,
          opacity: 0.08 + Math.random() * 0.05,
          blending: THREE.AdditiveBlending
        });
        
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
          (Math.random() - 0.5) * 300,
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 300
        );
        
        nebulaGroup.add(cloud);
      }
      
      return nebulaGroup;
    };
    
    const nebula = createNebula();
    scene.add(nebula);
    
    // Add distant galaxy
    const createGalaxy = () => {
      const galaxyGroup = new THREE.Group();
      
      // Create spiral galaxy structure
      const spiralStars = new THREE.BufferGeometry();
      const spiralCount = isMobile ? 200 : 400;
      const spiralPositions = new Float32Array(spiralCount * 3);
      const spiralColors = new Float32Array(spiralCount * 3);
      
      for (let i = 0; i < spiralCount; i++) {
        const t = i / spiralCount;
        const angle = t * Math.PI * 8; // 4 spiral arms
        const radius = t * 25;
        
        spiralPositions[i * 3] = Math.cos(angle) * radius;
        spiralPositions[i * 3 + 1] = Math.sin(angle) * radius;
        spiralPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
        
        // Galaxy core is brighter
        const brightness = Math.max(0.3, 1 - t);
        spiralColors[i * 3] = brightness;
        spiralColors[i * 3 + 1] = brightness * 0.9;
        spiralColors[i * 3 + 2] = brightness * 0.7;
      }
      
      spiralStars.setAttribute('position', new THREE.BufferAttribute(spiralPositions, 3));
      spiralStars.setAttribute('color', new THREE.BufferAttribute(spiralColors, 3));
      
      const spiralMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      
      const spiral = new THREE.Points(spiralStars, spiralMaterial);
      spiral.position.set(-50, -30, -100);
      spiral.rotation.x = Math.PI / 6;
      galaxyGroup.add(spiral);
      
      return galaxyGroup;
    };
    
    const galaxy = createGalaxy();
    scene.add(galaxy);
    
    threeRef.current = { scene, camera, renderer, particles: particleSystem, nebula, galaxy };
    
    // Enhanced animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Realistic slow space rotation
      particleSystem.rotation.y += 0.0005;
      particleSystem.rotation.x += 0.0002;
      
      // Subtle nebula movement
      nebula.children.forEach((cloud, index) => {
        cloud.rotation.x += 0.0001 * (index + 1);
        cloud.rotation.y += 0.0002 * (index + 1);
        cloud.rotation.z += 0.00015 * (index + 1);
        
        // Very subtle opacity variation
        cloud.material.opacity = (0.08 + Math.sin(time * 0.1 + index) * 0.02);
      });
      
      // Distant galaxy rotation
      galaxy.rotation.z += 0.001;
      
      // Very subtle camera drift like astronaut perspective
      camera.position.x = Math.sin(time * 0.02) * 0.5;
      camera.position.y = Math.cos(time * 0.015) * 0.3;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
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

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }, 500);
          return 100;
        }
        return prev + 1; // Slower loading to see cosmic effects
      });
    }, 200); // Even slower to see cosmic loading

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="loading-screen" style={{ 
      background: 'radial-gradient(ellipse at center, rgba(5,5,8,0.9) 0%, rgba(0,0,0,1) 100%)',
      overflow: 'hidden'
    }}>
      <div ref={containerRef} className="three-background" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 3
      }} />
      <div className="loading-content" style={{ 
        position: 'relative', 
        zIndex: 4,
        backdropFilter: 'blur(1px)'
      }}>
        <div className="zen-logo">
          <img 
            src="/assets/images/zen-logo.jpg" 
            alt="Zen Logo" 
            className="zen-logo-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="zen-circle" style={{display: 'none'}}>
            <div className="zen-inner-circle"></div>
          </div>
        </div>
        
        <h1 className="zen-title">Zen</h1>
        <p className="zen-subtitle">Balance Your Fortune</p>
        
        <div className="loading-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      </div>
      
      {/* 3D particles render in background */}
    </div>
  );
};

export default LoadingScreen;