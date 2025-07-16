import React, { useState } from 'react';
import MainLayout from '../components/common/MainLayout';
import ProfileDisplay from '../components/profile/ProfileDisplay';
import ZenCoinBalance from '../components/profile/ZenCoinBalance';
import DailyQuests from '../components/quests/DailyQuests';
import Leaderboard from '../components/leaderboard/Leaderboard';
import GamesSection from '../components/games/GamesSection';
import './HomePage.css';

const HomePage = () => {
  const [userProfile, setUserProfile] = useState({
    name: "Zen მომხმარებელი",
    avatar: null,
    coins: 1250,
    canClaim: true,
    lastClaimTime: null
  });

  const [activeSection, setActiveSection] = useState('profile');

  const handleAvatarChange = (newAvatar) => {
    setUserProfile(prev => ({ ...prev, avatar: newAvatar }));
  };

  const handleClaimCoins = () => {
    if (userProfile.canClaim) {
      setUserProfile(prev => ({
        ...prev,
        coins: prev.coins + 100,
        canClaim: false,
        lastClaimTime: new Date().toISOString()
      }));
    }
  };

  const sections = [
    { id: 'profile', label: 'My Zen', icon: '🧘' },
    { id: 'games', label: 'Zen Games', icon: '🎮' },
    { id: 'quests', label: 'Daily Harmony', icon: '✨' },
    { id: 'leaderboard', label: 'Zen Masters', icon: '🏆' }
  ];

  return (
    <MainLayout>
      <div className="home-page">
        <div className="navigation-tabs">
          {sections.map(section => (
            <button
              key={section.id}
              className={`nav-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="tab-icon">{section.icon}</span>
              <span className="tab-label">{section.label}</span>
            </button>
          ))}
        </div>

        <div className="content-sections">
          {activeSection === 'profile' && (
            <div className="section profile-section fade-in">
              <div className="section-header">
                <h2 className="section-title">My Zen</h2>
                <p className="section-subtitle">Your personal zen space</p>
              </div>
              
              <div className="profile-grid">
                <div className="profile-card">
                  <ProfileDisplay 
                    userName={userProfile.name}
                    userAvatar={userProfile.avatar}
                    onAvatarChange={handleAvatarChange}
                  />
                </div>
                
                <div className="balance-card">
                  <ZenCoinBalance 
                    balance={userProfile.coins}
                    canClaim={userProfile.canClaim}
                    claimAmount={100}
                    onClaim={handleClaimCoins}
                    lastClaimTime={userProfile.lastClaimTime}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'games' && (
            <div className="section games-section fade-in">
              <div className="section-header">
                <h2 className="section-title">Zen Games</h2>
                <p className="section-subtitle">Find balance through zen gaming</p>
              </div>
              <GamesSection />
            </div>
          )}

          {activeSection === 'quests' && (
            <div className="section quests-section fade-in">
              <div className="section-header">
                <h2 className="section-title">Daily Harmony</h2>
                <p className="section-subtitle">Complete daily tasks for inner peace</p>
              </div>
              <DailyQuests />
            </div>
          )}

          {activeSection === 'leaderboard' && (
            <div className="section leaderboard-section fade-in">
              <div className="section-header">
                <h2 className="section-title">Zen Masters</h2>
                <p className="section-subtitle">The most balanced souls</p>
              </div>
              <Leaderboard />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;