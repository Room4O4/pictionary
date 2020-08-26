import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';

import GenericDialog from './GenericDialog';

const AddNicknameDialog = (props) => {
  const [open, setOpen] = useState(true);
  const [nickname, setNickname] = useState('');

  const handleClose = () => {
    setOpen(false);
  };

  const handleDone = () => {
    props.onNicknameAdded(nickname);
  };

  const handleInputChange = (event) => {
    setNickname(event.target.value);
  };

  return (
    <GenericDialog
      open={open}
      fullScreen={true}
      title={'Enter nickname'}
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
    </GenericDialog>
  );
};

export default AddNicknameDialog;
