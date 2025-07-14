import React, { useState } from 'react';
import './ProfileDisplay.css';

const ProfileDisplay = ({ 
  userName = "Zen მომხმარებელი", 
  userAvatar = null, 
  onAvatarChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file && onAvatarChange) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onAvatarChange(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleNameEdit = () => {
    setIsEditing(true);
  };

  const handleNameSave = () => {
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNameSave();
    }
    if (e.key === 'Escape') {
      setTempName(userName);
      setIsEditing(false);
    }
  };

  return (
    <div className="profile-display">
      <div className="profile-content">
        <div className="avatar-section">
          <div className="avatar-container" onClick={handleAvatarClick}>
            {userAvatar ? (
              <img src={userAvatar} alt="Profile" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                <div className="avatar-icon">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 4C15.58 4 12 7.58 12 12C12 16.42 15.58 20 20 20C24.42 20 28 16.42 28 12C28 7.58 24.42 4 20 4Z" fill="currentColor"/>
                    <path d="M20 24C13.33 24 8 29.33 8 36H32C32 29.33 26.67 24 20 24Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            )}
            <div className="avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.414 2.586C16.633 1.805 15.367 1.805 14.586 2.586L13 4.172L15.828 7L17.414 5.414C18.195 4.633 18.195 3.367 17.414 2.586Z" fill="currentColor"/>
                <path d="M12.172 5L3 14.172V17H5.828L15 7.828L12.172 5Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div className="avatar-glow"></div>
        </div>

        <div className="profile-info">
          <div className="name-section">
            {isEditing ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleKeyPress}
                className="name-input"
                maxLength={20}
                autoFocus
              />
            ) : (
              <h2 className="user-name" onClick={handleNameEdit}>
                {userName}
                <span className="edit-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.23 1.77C12.77 1.31 12.03 1.31 11.57 1.77L10.5 2.84L13.16 5.5L14.23 4.43C14.69 3.97 14.69 3.23 14.23 2.77L13.23 1.77Z" fill="currentColor"/>
                    <path d="M9.66 3.68L2.5 10.84V13.5H5.16L12.32 6.34L9.66 3.68Z" fill="currentColor"/>
                  </svg>
                </span>
              </h2>
            )}
          </div>
          
          <div className="user-status">
            <div className="status-indicator active"></div>
            <span className="status-text">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDisplay;