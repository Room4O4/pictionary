import React from 'react';
import PropTypes from 'prop-types';
import './style.css';

class Audio extends React.Component {
  render () {
    const { name } = this.props;
    return (
      <div id="audio" className="audio_container">
        <audio controls id="sound"> {name}
          <source src={require(`../../assets/sounds/${name}.mp3`)} type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
      </div>
    );
  }
};

Audio.protoTypes = {
  name: PropTypes.string
};

export default Audio;
