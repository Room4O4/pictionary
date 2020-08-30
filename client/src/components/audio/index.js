import React from 'react';
import PropTypes from 'prop-types';
import './style.css';

class Audio extends React.Component {
  render () {
    return (
      <div id="audio" className="audio_container">
        <audio controls id="sound">
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  componentDidUpdate ({ name }) {
    if (name !== this.props.name) {
      const audioEl = document.querySelector('audio#sound');
      audioEl.src = require(`../../assets/sounds/${this.props.name}.mp3`);

      audioEl.loop = false;
      audioEl.play();
    }
  }
};

Audio.protoTypes = {
  name: PropTypes.string
};

export default Audio;
