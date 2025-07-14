import React, { useState } from 'react';
import { QUEST_STATUS } from '../../utils/constants';
import './DailyQuests.css';

const DailyQuests = () => {
  const [quests, setQuests] = useState([
    {
      id: 1,
      title: "გამოიწერეთ ჩვენი Telegram არხი",
      description: "შეუერთდით ჩვენს ოფიციალურ Telegram არხს",
      reward: 50,
      status: QUEST_STATUS.ACTIVE,
      icon: "📱",
      link: "https://t.me/zenmeditation"
    },
    {
      id: 2,
      title: "მოიწვიეთ მეგობარი",
      description: "მოიწვიეთ მეგობარი და მიიღეთ ბონუს ზეტი",
      reward: 100,
      status: QUEST_STATUS.ACTIVE,
      icon: "👥",
      progress: 0,
      target: 1
    },
    {
      id: 3,
      title: "ითამაშეთ 3 თამაში",
      description: "დაასრულეთ 3 თამაში ნებისმიერ რეჟიმში",
      reward: 75,
      status: QUEST_STATUS.ACTIVE,
      icon: "🎮",
      progress: 1,
      target: 3
    },
    {
      id: 4,
      title: "მოიგეთ 500 Zen Coins",
      description: "დააგროვეთ 500 Zen Coins თამაშებიდან",
      reward: 200,
      status: QUEST_STATUS.ACTIVE,
      icon: "💰",
      progress: 250,
      target: 500
    },
    {
      id: 5,
      title: "ყოველდღიური შესვლა",
      description: "შედით აპლიკაციაში ყოველდღე",
      reward: 25,
      status: QUEST_STATUS.COMPLETED,
      icon: "🌅",
      progress: 1,
      target: 1
    }
  ]);

  const handleClaimReward = (questId) => {
    setQuests(prevQuests => 
      prevQuests.map(quest => 
        quest.id === questId 
          ? { ...quest, status: QUEST_STATUS.CLAIMED }
          : quest
      )
    );
  };

  const handleQuestAction = (quest) => {
    if (quest.link) {
      window.open(quest.link, '_blank');
    }
    
    if (quest.status === QUEST_STATUS.ACTIVE) {
      setQuests(prevQuests => 
        prevQuests.map(q => 
          q.id === quest.id 
            ? { ...q, status: QUEST_STATUS.COMPLETED }
            : q
        )
      );
    }
  };

  const getProgressPercentage = (quest) => {
    if (!quest.target) return 100;
    return Math.min((quest.progress / quest.target) * 100, 100);
  };

  // eslint-disable-next-line no-unused-vars
  const getStatusColor = (status) => {
    switch (status) {
      case QUEST_STATUS.ACTIVE: return 'var(--accent-turquoise)';
      case QUEST_STATUS.COMPLETED: return 'var(--accent-gold)';
      case QUEST_STATUS.CLAIMED: return 'var(--primary-medium-gray)';
      default: return 'var(--primary-medium-gray)';
    }
  };

  return (
    <div className="daily-quests">
      <div className="quests-header">
        <div className="header-decoration">
          <div className="zen-symbol">✨</div>
          <div className="header-glow"></div>
        </div>
        <div className="progress-summary">
          <span className="completed-count">
            {quests.filter(q => q.status === QUEST_STATUS.COMPLETED).length}
          </span>
          <span className="total-count">/ {quests.length}</span>
          <span className="progress-label">დავალება შესრულდა</span>
        </div>
      </div>

      <div className="quests-list">
        {quests.map(quest => (
          <div key={quest.id} className={`quest-card ${quest.status}`}>
            <div className="quest-icon">
              <span className="icon-symbol">{quest.icon}</span>
              <div className="icon-glow"></div>
            </div>
            
            <div className="quest-info">
              <h3 className="quest-title">{quest.title}</h3>
              <p className="quest-description">{quest.description}</p>
              
              {quest.target && (
                <div className="quest-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage(quest)}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {quest.progress} / {quest.target}
                  </span>
                </div>
              )}
            </div>

            <div className="quest-reward">
              <div className="reward-amount">
                <span className="reward-icon">🪙</span>
                <span className="reward-value">+{quest.reward}</span>
              </div>
              
              {quest.status === QUEST_STATUS.ACTIVE && (
                <button 
                  className="quest-button active"
                  onClick={() => handleQuestAction(quest)}
                >
                  {quest.link ? 'შესვლა' : 'დაწყება'}
                </button>
              )}
              
              {quest.status === QUEST_STATUS.COMPLETED && (
                <button 
                  className="quest-button completed"
                  onClick={() => handleClaimReward(quest.id)}
                >
                  <span className="claim-icon">✓</span>
                  Claim
                </button>
              )}
              
              {quest.status === QUEST_STATUS.CLAIMED && (
                <button className="quest-button claimed" disabled>
                  <span className="claimed-icon">✓</span>
                  Claimed
                </button>
              )}
            </div>

            <div className="quest-effects">
              <div className="particle-effect"></div>
              <div className="shimmer-effect"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="quests-footer">
        <div className="footer-message">
          <p>ახალი დავალებები განახლდება ყოველდღე 00:00 UTC-ზე</p>
        </div>
        <div className="footer-decoration">
          <div className="decoration-line"></div>
          <div className="decoration-symbol">🧘</div>
          <div className="decoration-line"></div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuests;