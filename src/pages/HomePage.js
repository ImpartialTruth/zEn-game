import React, { useState } from 'react';
import MainLayout from '../components/common/MainLayout';
import ProfileDisplay from '../components/profile/ProfileDisplay';
import DailyQuests from '../components/quests/DailyQuests';
import Leaderboard from '../components/leaderboard/Leaderboard';
import ModernGamesSection from '../components/games/ModernGamesSection';
import './HomePage.css';

const HomePage = () => {
  const [userProfile, setUserProfile] = useState({
    name: "Zen მომხმარებელი",
    avatar: null,
    coins: 1250,
    canClaim: true,
    lastClaimTime: null
  });

  const [activeSection, setActiveSection] = useState('games');
  const [isInGame, setIsInGame] = useState(false);

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

  const handleBackClick = () => {
    setIsInGame(false);
  };

  const handleGameSelect = (gameId) => {
    setIsInGame(true);
  };

  const handleGameExit = () => {
    setIsInGame(false);
  };

  const sections = [
    { id: 'games', label: 'Zen Games', icon: '🎮' },
    { id: 'quests', label: 'Daily Harmony', icon: '✨' },
    { id: 'leaderboard', label: 'Zen Masters', icon: '🏆' },
    { id: 'profile', label: 'My Zen', icon: '🧘' }
  ];

  return (
    <MainLayout 
      userProfile={userProfile}
      onAvatarChange={handleAvatarChange}
      onClaimCoins={handleClaimCoins}
      showBackButton={isInGame}
      onBackClick={handleBackClick}
    >
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
              <div className="profile-content">
                <ProfileDisplay 
                  userName={userProfile.name}
                  userAvatar={userProfile.avatar}
                  onAvatarChange={handleAvatarChange}
                />
              </div>
            </div>
          )}

          {activeSection === 'games' && (
            <div className="section games-section fade-in">
              <ModernGamesSection 
                onGameSelect={handleGameSelect}
                onGameExit={handleGameExit}
                exitGame={!isInGame}
              />
            </div>
          )}

          {activeSection === 'quests' && (
            <div className="section quests-section fade-in">
              <DailyQuests />
            </div>
          )}

          {activeSection === 'leaderboard' && (
            <div className="section leaderboard-section fade-in">
              <Leaderboard />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;