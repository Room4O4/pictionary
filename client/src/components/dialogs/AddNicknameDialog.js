import React, { useState } from 'react';
import './style.scss';
import TextField from '@material-ui/core/TextField';

import GenericDialog from './GenericDialog';
import AvatarPicker from './AvatarPicker';

const AddNicknameDialog = (props) => {
  const [open, setOpen] = useState(true);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const handleClose = () => {
    setOpen(false);
  };

  const handleDone = () => {
    props.handleNameAvatarSubmit({ nickname, avatar: selectedAvatar });
  };

  const handleInputChange = (event) => {
    setNickname(event.target.value);
  };

  return (
    <GenericDialog
      open={open}
      title={'Welcome Aboard!'}
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
      <AvatarPicker setSelectedAvatar={setSelectedAvatar}/>
    </GenericDialog>
  );
};

export default AddNicknameDialog;
