import React, { useEffect, useState } from 'react';
import './avatar-picker.scss';
import { GAME_SERVER_URL } from '../../constants/AppConstants';

const AvatarPicker = (props) => {
  const [avatars, setAvatars] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const isSelected = avatarSrc => selectedAvatar === avatarSrc;

  const setSelectedAvatarInStateAndProps = selectedAvatar => {
    setSelectedAvatar(selectedAvatar);
    props.setSelectedAvatar(selectedAvatar);
  };

  useEffect(() => {
    async function fetchAvatarData () {
      try {
        if (!avatars) {
          const isLocalhost = window.location.host.startsWith('localhost') ||
          window.location.host.startsWith('127.0.0.1');
          // Is the node server going to be hosted under /server or root? TODO: change once this is decided
          const url = isLocalhost ? `${GAME_SERVER_URL}/avatars` : '/avatars';
          const response = await fetch(url);
          const { avatars } = await response.json();
          setAvatars(avatars);
        }
      } catch (error) {
        console.error('Error in displaying avatars: ', error);
      }
    }

    fetchAvatarData();
  }, [avatars]);

  return (
    <div className="avatar-picker-container">
      { avatars ? (
        avatars.map((avatarSrc) => (
          <div className={`avatar ${isSelected(avatarSrc) ? 'selected' : ''}`} key={avatarSrc}
            onClick={() => setSelectedAvatarInStateAndProps(avatarSrc)}>
            <img src={require(`../../assets/avatars/${avatarSrc}`)}
              alt='Avatar'
            />
          </div>
        ))
      ) : null }
    </div>
  );
};

export default AvatarPicker;
