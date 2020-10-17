import React from 'react';
import './user-avatar.css';

const UserAvatar = ({ avatar }) => {
  return (
    <div className="user-avatar">
      <img src={require(`../../assets/avatars/${avatar}`)} alt="User Avatar" />
    </div>
  );
};

export default UserAvatar;
