import React, { useState } from 'react';
import './MainLayout.css';

const MainLayout = ({ children, userProfile, onAvatarChange, onClaimCoins, showBackButton, onBackClick }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  
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
            {showBackButton ? (
              <button className="back-button" onClick={onBackClick}>
                <span className="back-icon">←</span>
                <span className="back-text">Back</span>
              </button>
            ) : (
              <div className="brand-logo">
                <div className="logo-icon">🧘</div>
                <span className="brand-name">Zen</span>
              </div>
            )}
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
                  <div className="profile-avatar" onClick={handleProfileClick}>
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
                  <span className="stat-value">47</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Wins</span>
                  <span className="stat-value">23</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Zen Rank</span>
                  <span className="stat-value">#24</span>
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