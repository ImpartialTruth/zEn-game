import React from 'react';
import './MainLayout.css';

const MainLayout = ({ children, userProfile, onAvatarChange, onClaimCoins }) => {
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
          
          {userProfile && (
            <div className="header-profile">
              <div className="profile-info">
                <div className="user-avatar">
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">🧘</div>
                  )}
                </div>
                <div className="user-details">
                  <span className="user-name">{userProfile.name}</span>
                  <div className="coin-balance">
                    <span className="coin-icon">🪙</span>
                    <span className="coin-amount">{userProfile.coins}</span>
                  </div>
                </div>
              </div>
              
              {userProfile.canClaim && (
                <button className="claim-button" onClick={onClaimCoins}>
                  <span className="claim-icon">✨</span>
                  <span className="claim-text">+100</span>
                </button>
              )}
            </div>
          )}
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