import React from 'react';
import './avatar-picker.css';
import { GAME_SERVER_URL } from '../../constants/AppConstants';

class AvatarPicker extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      avatars: [],
      selectedAvatar: ''
    };
  }

  async componentDidMount () {
    const isLocalhost = window.location.host.startsWith('localhost') ||
      window.location.host.startsWith('127.0.0.1');
    // Is the node server going to be hosted under /server or root? TODO: change once this is decided
    const url = isLocalhost ? `${GAME_SERVER_URL}/avatars` : '/avatars';
    console.log(url);
    try {
      const response = await fetch(url);
      console.log(response);
      const { avatars } = await response.json();
      this.setState({ avatars });
    } catch (err) {
      console.error('er', err);
    }
  }

  isSelected = avatarSrc => this.state.selectedAvatar === avatarSrc;

  setSelectedAvatar = selectedAvatar => {
    this.setState({ selectedAvatar });
    this.props.setSelectedAvatar(selectedAvatar);
  };

  render () {
    const { avatars } = this.state;
    return (
      <div className="avatar-picker-container">
        {
          avatars.map((avatarSrc) => (
            <div className={`avatar ${this.isSelected(avatarSrc) ? 'selected' : ''}`} key={avatarSrc}
              onClick={() => this.setSelectedAvatar(avatarSrc)}>
              <img src={require(`../../assets/avatars/${avatarSrc}`)}
                alt='Avatar'
              />
            </div>
          ))
        }
      </div>
    );
  }
}

export default AvatarPicker;
