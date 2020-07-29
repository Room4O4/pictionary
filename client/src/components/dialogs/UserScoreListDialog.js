import React, { useState } from 'react';

import GenericDialog from './GenericDialog';
import UserScoreList from '../player-list/UserScoreList';

const UserScoreListDialog = (props) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  const handleDone = () => {
    props.handleDone();
  };

  return (
    <GenericDialog
      open={open}
      title={'Players list'}
      displayNegativeAction={false}
      positiveActionText="Ok"
      handleClose={handleClose}
      handleDone={handleDone}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
    >
      <UserScoreList userScores={props.userScores} />
    </GenericDialog>
  );
};

export default UserScoreListDialog;
