import React from 'react';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <div className="background-overlay"></div>
      <div className="background-particles">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="bg-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>
      
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="zen-logo-mini">
              <div className="logo-circle">
                <div className="logo-inner"></div>
              </div>
            </div>
            <h1 className="app-title">Zen</h1>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
      
      <div className="ambient-glow ambient-glow-1"></div>
      <div className="ambient-glow ambient-glow-2"></div>
      <div className="ambient-glow ambient-glow-3"></div>
    </div>
  );
};

export default MainLayout;