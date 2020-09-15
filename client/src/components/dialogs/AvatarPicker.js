import React from 'react';
import './avatar-picker.css';

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
    const url = isLocalhost ? `${process.env.REACT_APP_SERVER_URL}/avatars` : '/avatars';

    try {
      const response = await fetch(url);
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
