import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const GenericDialog = (props) => {
  const handleClose = () => {
    props.handleClose();
  };
  const handleDone = () => {
    props.handleDone();
  };

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      disableBackdropClick={props.disableBackdropClick}
      disableEscapeKeyDown={props.disableEscapeKeyDown}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="dialog-title">{props.title}</DialogTitle>
      <DialogContent>{props.children}</DialogContent>
      <DialogActions>
        {props.displayNegativeAction && (
          <Button onClick={handleClose} color="primary">
            {props.negativeActionText}
          </Button>
        )}
        <Button onClick={handleDone} color="primary">
          {props.positiveActionText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenericDialog;
