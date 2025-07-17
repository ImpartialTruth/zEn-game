import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/common/LoadingScreen';
import HomePage from './pages/HomePage';
import './styles/globals.css';

function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Add any initialization logic here
        // - Load user data
        // - Initialize Telegram Web App
        // - Connect to backend
        
        setIsAppReady(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsAppReady(true); // Continue anyway
      }
    };

    initializeApp();
  }, []);

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