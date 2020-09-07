import React, { useState } from 'react';
import './style.css';
import TextField from '@material-ui/core/TextField';

import GenericDialog from './GenericDialog';

const AddNicknameDialog = (props) => {
  const [open, setOpen] = useState(true);
  const [nickname, setNickname] = useState('');
  const [avatars, setAvatars] = useState([]);
  React.useEffect(async () => {
    // eslint-disable-next-line no-debugger
    debugger;
    const isLocalhost = window.location.host.startsWith('localhost') ||
      window.location.host.startsWith('127.0.0.1');
    const url = isLocalhost ? `http://localhost:${process.env.SERVER_PORT}/avatars` : '/avatars';

    try {
      const { avatars } = (await fetch(url)).json();
      // eslint-disable-next-line
      console.log(avatars);
      // eslint-disable-next-line no-debugger
      debugger;
      setAvatars(avatars);
    } catch (err) {
      console.error('er', err);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleDone = () => {
    props.onNicknameAdded(nickname);
  };

  const handleInputChange = (event) => {
    setNickname(event.target.value);
  };

  const AvatarPicker = () => {
    return (
      <div className="avatar-picker-container">
        {
          avatars.map((avatarSrc) => (
            <div className="avatar" key={avatarSrc}>
              <img src={require(avatarSrc)}
                alt='Avatar'
              />
            </div>
          ))
        }
      </div>
    );
  };

  return (
    <GenericDialog
      open={open}
      title={'Welcome Abord!'}
      displayNegativeAction={false}
      positiveActionText="Save"
      handleClose={handleClose}
      handleDone={handleDone}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
    >
      <TextField
        autoFocus
        margin="dense"
        id="nickname"
        label="Nickname"
        type="email"
        onChange={handleInputChange}
        value={nickname}
        fullWidth
      />
      <div className="avatar-label">
        Choose your avatar
      </div>
      <AvatarPicker />
    </GenericDialog>
  );
};

export default AddNicknameDialog;
