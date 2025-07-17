import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/common/LoadingScreen';
import HomePage from './pages/HomePage';
import './styles/globals.css';

function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  const handleLoadingComplete = () => {
    setIsAppReady(true);
  };

  // Show loading screen while app is initializing
  if (!isAppReady) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="App">
      <HomePage />
    </div>
  );
}

export default App;