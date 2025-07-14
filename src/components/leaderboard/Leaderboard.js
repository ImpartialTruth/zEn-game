import React, { useState } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [leaderboardData] = useState({
    weekly: [
      {
        rank: 1,
        name: "ZenMaster2024",
        coins: 15420,
        avatar: null,
        badge: "🏆",
        isCurrentUser: false
      },
      {
        rank: 2,
        name: "MeditationPro",
        coins: 12350,
        avatar: null,
        badge: "🥈",
        isCurrentUser: false
      },
      {
        rank: 3,
        name: "BalanceSeeker",
        coins: 9870,
        avatar: null,
        badge: "🥉",
        isCurrentUser: false
      },
      {
        rank: 4,
        name: "Zen მომხმარებელი",
        coins: 8650,
        avatar: null,
        badge: null,
        isCurrentUser: true
      },
      {
        rank: 5,
        name: "CalmMind",
        coins: 7430,
        avatar: null,
        badge: null,
        isCurrentUser: false
      },
      {
        rank: 6,
        name: "InnerPeace",
        coins: 6890,
        avatar: null,
        badge: null,
        isCurrentUser: false
      },
      {
        rank: 7,
        name: "SerenitySoul",
        coins: 5670,
        avatar: null,
        badge: null,
        isCurrentUser: false
      },
      {
        rank: 8,
        name: "Mindful_One",
        coins: 4520,
        avatar: null,
        badge: null,
        isCurrentUser: false
      },
      {
        rank: 9,
        name: "ZenGarden",
        coins: 3890,
        avatar: null,
        badge: null,
        isCurrentUser: false
      },
      {
        rank: 10,
        name: "Harmony_123",
        coins: 2750,
        avatar: null,
        badge: null,
        isCurrentUser: false
      }
    ],
    monthly: [
      {
        rank: 1,
        name: "ZenMaster2024",
        coins: 45820,
        avatar: null,
        badge: "🏆",
        isCurrentUser: false
      },
      {
        rank: 2,
        name: "MeditationPro",
        coins: 38350,
        avatar: null,
        badge: "🥈",
        isCurrentUser: false
      },
      {
        rank: 3,
        name: "BalanceSeeker",
        coins: 29870,
        avatar: null,
        badge: "🥉",
        isCurrentUser: false
      },
      {
        rank: 4,
        name: "Zen მომხმარებელი",
        coins: 25650,
        avatar: null,
        badge: null,
        isCurrentUser: true
      }
    ]
  });

  const currentLeaderboard = leaderboardData[timeframe];
  const currentUserRank = currentLeaderboard.find(user => user.isCurrentUser)?.rank || 0;

  const formatCoins = (coins) => {
    if (coins >= 1000000) {
      return `${(coins / 1000000).toFixed(1)}M`;
    } else if (coins >= 1000) {
      return `${(coins / 1000).toFixed(1)}K`;
    }
    return coins.toString();
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'var(--accent-gold)';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return 'var(--accent-turquoise)';
    }
  };

  const getRewardInfo = (timeframe) => {
    if (timeframe === 'weekly') {
      return {
        period: 'კვირეული',
        rewards: [
          { rank: 1, reward: '1000 Zen Coins + 🏆 Badge' },
          { rank: 2, reward: '500 Zen Coins + 🥈 Badge' },
          { rank: 3, reward: '250 Zen Coins + 🥉 Badge' },
        ]
      };
    } else {
      return {
        period: 'ყოველთვიური',
        rewards: [
          { rank: 1, reward: '5000 Zen Coins + 🏆 Badge' },
          { rank: 2, reward: '2500 Zen Coins + 🥈 Badge' },
          { rank: 3, reward: '1000 Zen Coins + 🥉 Badge' },
        ]
      };
    }
  };

  const rewardInfo = getRewardInfo(timeframe);

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <div className="header-decoration">
          <div className="trophy-icon">🏆</div>
          <div className="trophy-glow"></div>
        </div>
        
        <div className="timeframe-selector">
          <button 
            className={`timeframe-btn ${timeframe === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            კვირეული
          </button>
          <button 
            className={`timeframe-btn ${timeframe === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeframe('monthly')}
          >
            ყოველთვიური
          </button>
        </div>
      </div>

      <div className="current-rank-display">
        <div className="rank-card">
          <div className="rank-info">
            <span className="rank-label">შენი ადგილი</span>
            <span className="rank-number">#{currentUserRank}</span>
          </div>
          <div className="rank-divider"></div>
          <div className="rank-progress">
            <span className="progress-label">{rewardInfo.period} რეიტინგი</span>
            <div className="progress-visual">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.max(10, (11 - currentUserRank) * 10)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="leaderboard-table">
        <div className="table-header">
          <div className="header-row">
            <span className="col-rank">რანკი</span>
            <span className="col-player">მოთამაშე</span>
            <span className="col-coins">Zen Coins</span>
          </div>
        </div>
        
        <div className="table-body">
          {currentLeaderboard.map((user, index) => (
            <div 
              key={index} 
              className={`leaderboard-row ${user.isCurrentUser ? 'current-user' : ''} ${user.rank <= 3 ? 'top-three' : ''}`}
            >
              <div className="rank-cell">
                <div className="rank-wrapper">
                  <span 
                    className="rank-text"
                    style={{ color: getRankColor(user.rank) }}
                  >
                    #{user.rank}
                  </span>
                  {user.badge && (
                    <span className="rank-badge">{user.badge}</span>
                  )}
                </div>
              </div>
              
              <div className="player-cell">
                <div className="player-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      <span className="avatar-initial">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="player-info">
                  <span className="player-name">{user.name}</span>
                  {user.isCurrentUser && (
                    <span className="current-user-badge">შენ</span>
                  )}
                </div>
              </div>
              
              <div className="coins-cell">
                <div className="coins-wrapper">
                  <span className="coins-icon">🪙</span>
                  <span className="coins-amount">{formatCoins(user.coins)}</span>
                </div>
              </div>
              
              <div className="row-glow"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="rewards-section">
        <h3 className="rewards-title">{rewardInfo.period} ჯილდოები</h3>
        <div className="rewards-grid">
          {rewardInfo.rewards.map((reward, index) => (
            <div key={index} className="reward-card">
              <div className="reward-rank">
                <span className="reward-position">#{reward.rank}</span>
                <span className="reward-medal">
                  {reward.rank === 1 ? '🏆' : reward.rank === 2 ? '🥈' : '🥉'}
                </span>
              </div>
              <div className="reward-description">
                {reward.reward}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;