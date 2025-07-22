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
    
    // Create enhanced cosmic particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = isMobile ? 150 : 300;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    const colorPalette = [
      new THREE.Color(0x00E5FF), // Bright cyan
      new THREE.Color(0xE1BEE7), // Light lavender  
      new THREE.Color(0xFFD54F), // Warm gold
      new THREE.Color(0x66BB6A), // Fresh green
      new THREE.Color(0xFF4081), // Vibrant pink
      new THREE.Color(0x7986CB), // Soft blue
      new THREE.Color(0xFFB74D)  // Orange
    ];
    
    for (let i = 0; i < particleCount; i++) {
      // Create spiral galaxy distribution
      const radius = Math.random() * 80 + 20;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 60;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Random velocities for floating effect
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 3 + 0.5;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Enhanced particle material
    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 1.5 : 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    
    // Add floating energy orbs
    const createEnergyOrbs = () => {
      const orbGroup = new THREE.Group();
      const orbCount = isMobile ? 8 : 15;
      
      for (let i = 0; i < orbCount; i++) {
        const orbGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 8, 8);
        const orbMaterial = new THREE.MeshBasicMaterial({
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending
        });
        
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40
        );
        
        orbGroup.add(orb);
      }
      
      return orbGroup;
    };
    
    const energyOrbs = createEnergyOrbs();
    scene.add(energyOrbs);
    
    // Enhanced sacred geometry mandala
    const createMandala = () => {
      const mandalaGroup = new THREE.Group();
      const scale = isMobile ? 0.7 : 1.0;
      
      // Create multiple mandala layers
      for (let ring = 0; ring < 6; ring++) {
        const radius = (ring + 1) * 4 * scale;
        const count = (ring + 2) * 6;
        
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          // Alternating geometry types for visual interest
          let geometry, material;
          
          if (ring % 2 === 0) {
            geometry = new THREE.RingGeometry(0.1, 0.4, 6);
            material = new THREE.MeshBasicMaterial({ 
              color: colorPalette[ring % colorPalette.length],
              transparent: true,
              opacity: 0.7 - ring * 0.08,
              blending: THREE.AdditiveBlending
            });
          } else {
            geometry = new THREE.CircleGeometry(0.2, 6);
            material = new THREE.MeshBasicMaterial({ 
              color: colorPalette[(ring + 1) % colorPalette.length],
              transparent: true,
              opacity: 0.5 - ring * 0.06,
              blending: THREE.AdditiveBlending
            });
          }
          
          const shape = new THREE.Mesh(geometry, material);
          shape.position.set(x, y, (Math.random() - 0.5) * 10);
          shape.rotation.z = angle + ring * 0.5;
          mandalaGroup.add(shape);
        }
      }
      
      // Central lotus pattern
      const centerGroup = new THREE.Group();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const petalGeometry = new THREE.CircleGeometry(1.5 * scale, 8);
        const petalMaterial = new THREE.MeshBasicMaterial({
          color: colorPalette[i % 3],
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending
        });
        
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        petal.position.set(
          Math.cos(angle) * 1.5 * scale,
          Math.sin(angle) * 1.5 * scale,
          0
        );
        petal.rotation.z = angle;
        centerGroup.add(petal);
      }
      
      mandalaGroup.add(centerGroup);
      return mandalaGroup;
    };
    
    const mandala = createMandala();
    scene.add(mandala);
    
    threeRef.current = { scene, camera, renderer, particles: particleSystem, mandala, energyOrbs, velocities };
    
    // Enhanced animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Gentle particle system rotation
      particleSystem.rotation.y += 0.003;
      particleSystem.rotation.x += 0.001;
      
      // Organic particle movement with velocities
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Apply stored velocities
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1] + Math.sin(time + i * 0.01) * 0.02;
        positions[i3 + 2] += velocities[i3 + 2];
        
        // Boundary wrapping
        if (Math.abs(positions[i3]) > 100) velocities[i3] *= -1;
        if (Math.abs(positions[i3 + 1]) > 50) velocities[i3 + 1] *= -1;
        if (Math.abs(positions[i3 + 2]) > 100) velocities[i3 + 2] *= -1;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      
      // Sacred geometry mandala rotation
      mandala.rotation.z += 0.008;
      mandala.rotation.x = Math.sin(time * 0.5) * 0.1;
      mandala.rotation.y = Math.cos(time * 0.3) * 0.05;
      
      // Energy orbs floating animation
      energyOrbs.children.forEach((orb, index) => {
        orb.position.y += Math.sin(time * 2 + index) * 0.01;
        orb.rotation.x += 0.01;
        orb.rotation.y += 0.005;
        
        // Pulsing opacity
        orb.material.opacity = 0.2 + Math.sin(time * 3 + index) * 0.15;
      });
      
      // Camera gentle movement
      camera.position.x = Math.sin(time * 0.2) * 2;
      camera.position.y = Math.cos(time * 0.15) * 1;
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
        return prev + 2;
      });
    }, 50);

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
        zIndex: 0 
      }} />
      <div className="loading-content" style={{ 
        position: 'relative', 
        zIndex: 1,
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