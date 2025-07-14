import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize Telegram Web App if available
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  
  // Expand the app to full height
  tg.expand();
  
  // Set header color to match our design
  tg.setHeaderColor('#1A237E');
  
  // Enable closing confirmation
  tg.enableClosingConfirmation();
  
  // Ready the app
  tg.ready();
  
  console.log('Telegram Web App initialized');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});