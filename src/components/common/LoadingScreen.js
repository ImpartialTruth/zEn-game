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
  
  // Three.js 3D particles setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 1, 100);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Create 3D particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorPalette = [
      new THREE.Color(0x00BCD4), // Turquoise
      new THREE.Color(0xBA68C8), // Lavender
      new THREE.Color(0xFFC107), // Gold
      new THREE.Color(0x4CAF50), // Green
      new THREE.Color(0xE91E63)  // Pink
    ];
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 2 + 1;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Particle material with custom shader
    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    
    // Zen meditation mandala
    const createMandala = () => {
      const mandalaGroup = new THREE.Group();
      
      for (let ring = 0; ring < 5; ring++) {
        const radius = (ring + 1) * 3;
        const count = (ring + 1) * 8;
        
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const geometry = new THREE.RingGeometry(0.1, 0.3, 8);
          const material = new THREE.MeshBasicMaterial({ 
            color: colorPalette[ring % colorPalette.length],
            transparent: true,
            opacity: 0.6 - ring * 0.1
          });
          
          const ringMesh = new THREE.Mesh(geometry, material);
          ringMesh.position.set(x, y, 0);
          ringMesh.rotation.z = angle;
          mandalaGroup.add(ringMesh);
        }
      }
      
      return mandalaGroup;
    };
    
    const mandala = createMandala();
    scene.add(mandala);
    
    threeRef.current = { scene, camera, renderer, particles: particleSystem, mandala };
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate particles
      particleSystem.rotation.y += 0.002;
      particleSystem.rotation.x += 0.001;
      
      // Rotate mandala
      mandala.rotation.z += 0.01;
      
      // Particle movement
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i * 0.1) * 0.01;
        positions[i * 3] += Math.cos(Date.now() * 0.001 + i * 0.1) * 0.01;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      
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
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="loading-screen">
      <div ref={containerRef} className="three-background" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
      <div className="loading-content" style={{ position: 'relative', zIndex: 1 }}>
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