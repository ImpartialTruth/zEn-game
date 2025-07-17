import React, { useState, useEffect, useCallback } from 'react';
import './MinesGame.css';

const MinesGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, won, lost
  const [betAmount, setBetAmount] = useState('10');
  const [minesCount, setMinesCount] = useState(3);
  const [grid, setGrid] = useState([]);
  const [revealedTiles, setRevealedTiles] = useState(new Set());
  const [minePositions, setMinePositions] = useState(new Set());
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [winnings, setWinnings] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [safeClicks, setSafeClicks] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalWinnings: 0,
    bestMultiplier: 0,
    winRate: 0
  });

  const GRID_SIZE = 25; // 5x5 grid
  const MAX_MINES = 20;
  const MIN_MINES = 1;

  // Calculate multiplier based on mines count and safe clicks
  const calculateMultiplier = useCallback((mines, clicks) => {
    if (clicks === 0) return 1.00;
    
    const totalSafeTiles = GRID_SIZE - mines;
    const baseMultiplier = 1 + (mines / 10); // Base multiplier increases with mine count
    
    // Progressive multiplier calculation
    let multiplier = baseMultiplier;
    for (let i = 1; i <= clicks; i++) {
      const probability = (totalSafeTiles - i + 1) / (GRID_SIZE - i + 1);
      multiplier *= (1 / probability) * 0.97; // 97% RTP
    }
    
    return Math.max(1.01, multiplier);
  }, []);

  // Generate random mine positions
  const generateMines = useCallback((count) => {
    const positions = new Set();
    while (positions.size < count) {
      positions.add(Math.floor(Math.random() * GRID_SIZE));
    }
    return positions;
  }, []);

  // Initialize game grid
  const initializeGrid = useCallback(() => {
    return Array(GRID_SIZE).fill().map((_, index) => ({
      id: index,
      revealed: false,
      isMine: false,
      hasGem: false
    }));
  }, []);

  // Start new game
  const startGame = () => {
    if (!betAmount || parseFloat(betAmount) < 1) return;
    
    const newMines = generateMines(minesCount);
    const newGrid = initializeGrid();
    
    setMinePositions(newMines);
    setGrid(newGrid);
    setRevealedTiles(new Set());
    setGameState('playing');
    setCurrentMultiplier(1.00);
    setWinnings(0);
    setSafeClicks(0);
  };

  // Handle tile click
  const handleTileClick = useCallback((tileId) => {
    if (gameState !== 'playing' || revealedTiles.has(tileId)) return;

    const newRevealed = new Set(revealedTiles);
    newRevealed.add(tileId);
    setRevealedTiles(newRevealed);

    if (minePositions.has(tileId)) {
      // Hit a mine - game over
      setGameState('lost');
      setWinnings(0);
      
      // Update stats
      setGameStats(prev => ({
        ...prev,
        totalGames: prev.totalGames + 1,
        winRate: prev.totalGames > 0 ? (prev.totalGames - 1) / prev.totalGames : 0
      }));
      
      // Add to history
      setGameHistory(prev => [
        { result: 'lost', multiplier: 0, mines: minesCount, clicks: safeClicks },
        ...prev.slice(0, 4)
      ]);
      
      // Play explosion sound
      playSound('explosion');
      
      // Auto restart after delay
      setTimeout(() => {
        setGameState('waiting');
      }, 3000);
    } else {
      // Safe tile
      const newClicks = safeClicks + 1;
      setSafeClicks(newClicks);
      
      const newMultiplier = calculateMultiplier(minesCount, newClicks);
      setCurrentMultiplier(newMultiplier);
      
      const currentWinnings = parseFloat(betAmount) * newMultiplier;
      setWinnings(currentWinnings);
      
      // Play gem sound
      playSound('gem');
      
      // Check if all safe tiles revealed (perfect game)
      if (newClicks === GRID_SIZE - minesCount) {
        setGameState('won');
        
        // Update stats
        setGameStats(prev => ({
          ...prev,
          totalGames: prev.totalGames + 1,
          totalWinnings: prev.totalWinnings + currentWinnings,
          bestMultiplier: Math.max(prev.bestMultiplier, newMultiplier),
          winRate: (prev.totalGames + 1) > 0 ? (prev.totalGames + 1) / (prev.totalGames + 1) : 1
        }));
        
        // Add to history
        setGameHistory(prev => [
          { result: 'perfect', multiplier: newMultiplier, mines: minesCount, clicks: newClicks },
          ...prev.slice(0, 4)
        ]);
        
        playSound('perfect');
        
        setTimeout(() => {
          setGameState('waiting');
        }, 3000);
      }
    }
  }, [gameState, revealedTiles, minePositions, safeClicks, minesCount, betAmount, calculateMultiplier]);

  // Cash out current winnings
  const cashOut = () => {
    if (gameState !== 'playing' || safeClicks === 0) return;
    
    setGameState('won');
    
    // Update stats
    setGameStats(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1,
      totalWinnings: prev.totalWinnings + winnings,
      bestMultiplier: Math.max(prev.bestMultiplier, currentMultiplier),
      winRate: (prev.totalGames + 1) > 0 ? (prev.totalGames + 1) / (prev.totalGames + 1) : 1
    }));
    
    // Add to history
    setGameHistory(prev => [
      { result: 'won', multiplier: currentMultiplier, mines: minesCount, clicks: safeClicks },
      ...prev.slice(0, 4)
    ]);
    
    playSound('cashout');
    
    setTimeout(() => {
      setGameState('waiting');
    }, 2000);
  };

  // Sound system
  const playSound = useCallback((type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const sounds = {
        gem: { frequency: 800, duration: 0.2 },
        explosion: { frequency: 150, duration: 0.8 },
        cashout: { frequency: 1000, duration: 0.4 },
        perfect: { frequency: 1200, duration: 0.6 }
      };
      
      const sound = sounds[type];
      if (sound) {
        oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
      }
    } catch (error) {
      console.log('Sound play failed:', error);
    }
  }, []);

  const getTileClass = (tileId) => {
    let classes = 'mine-tile';
    
    if (revealedTiles.has(tileId)) {
      classes += ' revealed';
      if (minePositions.has(tileId)) {
        classes += ' mine';
      } else {
        classes += ' safe';
      }
    }
    
    if (gameState === 'lost' && minePositions.has(tileId)) {
      classes += ' show-mine';
    }
    
    return classes;
  };

  const getMultiplierColor = () => {
    if (currentMultiplier < 2) return '#00BCD4';
    if (currentMultiplier < 5) return '#FFC107';
    if (currentMultiplier < 10) return '#4CAF50';
    return '#E91E63';
  };

  return (
    <div className="mines-game">
      <div className="mines-header">
        <button className="back-button" onClick={onBack}>
          <span>←</span> Back
        </button>
        
        <div className="game-title">
          <div className="title-icon">💎</div>
          <h2>Mines</h2>
        </div>
        
        <div className="multiplier-display">
          <span style={{ color: getMultiplierColor() }}>
            {currentMultiplier.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* Game History */}
      <div className="game-history">
        {gameHistory.map((game, index) => (
          <div key={index} className={`history-item ${game.result}`}>
            <span className="history-multiplier">
              {game.multiplier > 0 ? `${game.multiplier.toFixed(2)}x` : '💥'}
            </span>
            <span className="history-mines">{game.mines}M</span>
          </div>
        ))}
      </div>

      {/* Game Grid */}
      <div className="game-container">
        <div className="mines-grid">
          {Array(GRID_SIZE).fill().map((_, index) => (
            <div
              key={index}
              className={getTileClass(index)}
              onClick={() => handleTileClick(index)}
            >
              <div className="tile-content">
                {revealedTiles.has(index) && (
                  <>
                    {minePositions.has(index) ? (
                      <span className="mine-icon">💣</span>
                    ) : (
                      <span className="gem-icon">💎</span>
                    )}
                  </>
                )}
              </div>
              <div className="tile-glow"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="game-controls">
        {gameState === 'waiting' && (
          <>
            <div className="control-section">
              <label>Bet Amount</label>
              <div className="bet-input-container">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="1"
                  max="1000"
                  className="bet-input"
                />
                <span className="currency">🪙</span>
              </div>
            </div>

            <div className="control-section">
              <label>Mines ({minesCount})</label>
              <div className="mines-selector">
                <button 
                  onClick={() => setMinesCount(Math.max(MIN_MINES, minesCount - 1))}
                  className="mines-btn"
                  disabled={minesCount <= MIN_MINES}
                >-</button>
                <span className="mines-count">{minesCount}</span>
                <button 
                  onClick={() => setMinesCount(Math.min(MAX_MINES, minesCount + 1))}
                  className="mines-btn"
                  disabled={minesCount >= MAX_MINES}
                >+</button>
              </div>
            </div>

            <button className="start-btn" onClick={startGame}>
              <span className="btn-icon">🚀</span>
              <span>Start Game</span>
            </button>
          </>
        )}

        {gameState === 'playing' && (
          <div className="playing-controls">
            <div className="current-info">
              <div className="info-item">
                <span className="info-label">Safe Clicks:</span>
                <span className="info-value">{safeClicks}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Potential Win:</span>
                <span className="info-value">{winnings.toFixed(2)} 🪙</span>
              </div>
            </div>
            
            <button 
              className="cashout-btn"
              onClick={cashOut}
              disabled={safeClicks === 0}
            >
              <span className="btn-icon">💰</span>
              <span>Cash Out {winnings.toFixed(2)} 🪙</span>
            </button>
          </div>
        )}

        {(gameState === 'won' || gameState === 'lost') && (
          <div className="game-result">
            {gameState === 'won' ? (
              <div className="win-message">
                <span className="result-icon">🎉</span>
                <span>Won {winnings.toFixed(2)} 🪙!</span>
              </div>
            ) : (
              <div className="lose-message">
                <span className="result-icon">💥</span>
                <span>Game Over!</span>
              </div>
            )}
          </div>
        )}

        {/* Game Stats */}
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Games:</span>
            <span className="stat-value">{gameStats.totalGames}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Best:</span>
            <span className="stat-value">{gameStats.bestMultiplier.toFixed(2)}x</span>
          </div>
          <div className="stat">
            <span className="stat-label">Won:</span>
            <span className="stat-value">{gameStats.totalWinnings.toFixed(0)} 🪙</span>
          </div>
          <div className="stat">
            <span className="stat-label">Rate:</span>
            <span className="stat-value">{(gameStats.winRate * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinesGame;