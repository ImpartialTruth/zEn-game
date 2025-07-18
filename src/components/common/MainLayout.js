import React, { useState, useMemo } from 'react';
import './MainLayout.css';
import './ModernHeader.css';
import zenLogo from '../../assets/images/zen-logo.jpg';
import cosmicBg from '../../assets/images/backgrounds/cosmic-background.jpg';

const MainLayout = ({ children, userProfile, onAvatarChange, onClaimCoins, showBackButton, onBackClick }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const backgroundParticles = useMemo(() => 
    [...Array(15)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 10,
      animationDuration: 8 + Math.random() * 4
    })), []
  );
  
  const handleProfileClick = () => {
    setShowProfileModal(true);
  };
  
  const handleCloseProfile = () => {
    setShowProfileModal(false);
  };
  return (
    <div className="main-layout">
      <div className="background-overlay"></div>
      <div className="background-particles">
        {backgroundParticles.map(particle => (
          <div 
            key={particle.id}
            className="bg-particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>
      
      <header className="modern-app-header">
        <div className="modern-header-content">
          {/* Left Section */}
          <div className="header-left-section">
            {showBackButton ? (
              <button className="modern-back-button" onClick={onBackClick}>
                <div className="back-button-content">
                  <span className="back-icon">←</span>
                  <span className="back-text">Back</span>
                </div>
              </button>
            ) : (
              <div className="modern-brand">
                <div className="brand-container">
                  <div className="brand-icon">🎮</div>
                  <div className="brand-info">
                    <span className="brand-title">ZEN</span>
                    <span className="brand-subtitle">Casino</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Center Section - Balance */}
          <div className="header-center-section">
            {userProfile && (
              <div className="modern-balance-card">
                <div className="balance-content">
                  <div className="balance-icon-modern">💰</div>
                  <div className="balance-info">
                    <span className="balance-label">Balance</span>
                    <span className="balance-amount-modern">{userProfile.coins.toLocaleString()}</span>
                  </div>
                </div>
                <div className="balance-glow"></div>
              </div>
            )}
          </div>
          
          {/* Right Section - User Actions */}
          <div className="header-right-section">
            {userProfile && (
              <div className="modern-user-actions">
                {userProfile.canClaim && (
                  <button className="modern-claim-btn" onClick={onClaimCoins}>
                    <div className="claim-content">
                      <span className="claim-icon-modern">✨</span>
                      <span className="claim-text">+100</span>
                    </div>
                    <div className="claim-pulse"></div>
                  </button>
                )}
                
                <div className="modern-user-profile" onClick={handleProfileClick}>
                  <div className="profile-avatar-modern">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="Profile" className="avatar-image" />
                    ) : (
                      <div className="avatar-default-modern">
                        <span className="avatar-letter">{userProfile.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="profile-status-dot"></div>
                  </div>
                  <div className="profile-info-preview">
                    <span className="profile-name-preview">{userProfile.name.split(' ')[0]}</span>
                    <span className="profile-level">Lvl 1</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Header Effects */}
        <div className="header-background-effects">
          <div className="header-gradient"></div>
          <div className="header-particles">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="header-particle"
                style={{
                  left: `${10 + i * 10}%`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
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
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={handleCloseProfile}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">Profile</h3>
              <button className="profile-modal-close" onClick={handleCloseProfile}>
                ×
              </button>
            </div>
            
            <div className="profile-modal-content">
              <div className="profile-info-section">
                <div className="profile-avatar-large">
                  {userProfile?.avatar ? (
                    <img src={userProfile.avatar} alt="Profile" />
                  ) : (
                    <div className="avatar-default-large">
                      {userProfile?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="profile-details">
                  <h4 className="profile-name">{userProfile?.name}</h4>
                  <p className="profile-balance">
                    <span className="balance-label">Balance:</span>
                    <span className="balance-value">🪙 {userProfile?.coins.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-label">Games Played</span>
                  <span className="stat-value">{userProfile?.gamesPlayed || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Wins</span>
                  <span className="stat-value">{userProfile?.totalWins || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Zen Rank</span>
                  <span className="stat-value">#{userProfile?.rank || 'N/A'}</span>
                </div>
              </div>
              
              <div className="profile-actions">
                <button className="edit-profile-btn">
                  <span className="btn-icon">✏️</span>
                  <span className="btn-text">Edit Profile</span>
                </button>
                <button className="game-history-btn">
                  <span className="btn-icon">📈</span>
                  <span className="btn-text">Game History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;