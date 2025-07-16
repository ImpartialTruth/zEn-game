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
          <div className="header-left">
            <div className="brand-logo">
              <div className="logo-icon">🧘</div>
              <span className="brand-name">Zen</span>
            </div>
          </div>
          
          <div className="header-center">
            {userProfile && (
              <div className="balance-display">
                <div className="balance-icon">🪙</div>
                <span className="balance-amount">{userProfile.coins.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          <div className="header-right">
            {userProfile && (
              <div className="user-actions">
                {userProfile.canClaim && (
                  <button className="claim-btn" onClick={onClaimCoins}>
                    <span className="claim-icon">✨</span>
                    <span className="claim-amount">+100</span>
                  </button>
                )}
                <div className="user-profile">
                  <div className="profile-avatar">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="Profile" />
                    ) : (
                      <div className="avatar-default">
                        {userProfile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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