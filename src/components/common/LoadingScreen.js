import React, { useState, useEffect, useMemo } from 'react';
import './LoadingScreen.css';
import cosmicBg from '../../assets/images/backgrounds/cosmic-background.jpg';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const particles = useMemo(() => 
    [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 3 + Math.random() * 2
    })), []
  );

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
    <div className="loading-screen" style={{backgroundImage: `url(${cosmicBg})`}}>
      <div className="loading-content">
        <div className="zen-logo">
          <div className="zen-circle">
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
      
      <div className="loading-particles">
        {particles.map(particle => (
          <div 
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;