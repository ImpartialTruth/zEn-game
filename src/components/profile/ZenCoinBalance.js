import React, { useState, useEffect } from 'react';
import './ZenCoinBalance.css';

const ZenCoinBalance = ({ 
  balance = 0, 
  canClaim = true, 
  claimAmount = 100,
  onClaim,
  lastClaimTime = null
}) => {
  const [animatedBalance, setAnimatedBalance] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeUntilClaim, setTimeUntilClaim] = useState('');

  useEffect(() => {
    if (balance !== animatedBalance) {
      setIsAnimating(true);
      const difference = balance - animatedBalance;
      const steps = Math.min(Math.abs(difference), 50);
      const increment = difference / steps;
      let currentValue = animatedBalance;
      
      const timer = setInterval(() => {
        currentValue += increment;
        setAnimatedBalance(Math.round(currentValue));
        
        if (Math.abs(currentValue - balance) < Math.abs(increment)) {
          setAnimatedBalance(balance);
          clearInterval(timer);
          setIsAnimating(false);
        }
      }, 50);
      
      return () => clearInterval(timer);
    }
  }, [balance, animatedBalance]);

  useEffect(() => {
    if (!canClaim && lastClaimTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const nextClaim = new Date(lastClaimTime).getTime() + (24 * 60 * 60 * 1000);
        const timeLeft = nextClaim - now;
        
        if (timeLeft > 0) {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          
          setTimeUntilClaim(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeUntilClaim('');
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [canClaim, lastClaimTime]);

  const handleClaim = () => {
    if (canClaim && onClaim) {
      onClaim();
    }
  };

  const formatBalance = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <div className="zen-coin-balance">
      <div className="balance-header">
        <div className="coin-icon">
          <div className="coin-outer">
            <div className="coin-inner">
              <div className="coin-symbol">Z</div>
            </div>
          </div>
          <div className="coin-glow"></div>
        </div>
        <div className="balance-info">
          <h3 className="balance-label">Zen Coins</h3>
          <div className={`balance-amount ${isAnimating ? 'animating' : ''}`}>
            {formatBalance(animatedBalance)}
          </div>
        </div>
      </div>

      <div className="claim-section">
        <div className="daily-bonus-info">
          <span className="bonus-label">ყოველდღიური ბონუსი</span>
          <span className="bonus-amount">+{claimAmount}</span>
        </div>
        
        <button 
          className={`claim-button ${canClaim ? 'active' : 'disabled'}`}
          onClick={handleClaim}
          disabled={!canClaim}
        >
          {canClaim ? (
            <>
              <span className="claim-text">Claim</span>
              <div className="claim-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
                </svg>
              </div>
            </>
          ) : (
            <div className="claim-timer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 0a8 8 0 110 16A8 8 0 018 0z" fill="currentColor"/>
                <path d="M8 4a1 1 0 011 1v3.586l2.707 2.707a1 1 0 01-1.414 1.414L7.586 9.414A1 1 0 017 8.586V5a1 1 0 011-1z" fill="currentColor"/>
              </svg>
              <span>{timeUntilClaim}</span>
            </div>
          )}
        </button>
      </div>

      <div className="balance-effects">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="balance-particle"
            style={{
              animationDelay: `${i * 0.5}s`,
              left: `${20 + i * 10}%`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ZenCoinBalance;