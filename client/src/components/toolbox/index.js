import React from 'react';
import { CirclePicker } from 'react-color';
import { Grid, Paper } from '@material-ui/core';
import './toolbox.css';
import UIButton from '../button';

const CanvasToolbox = ({ onColorChanged, onClearCanvasPressed }) => {
  return (
    <Paper elevation={3} className="toolboxContainer">
      <Grid container direction="column" spacing={2} xs={12}>
        <Grid item xs={12}>
          <UIButton variant="contained" onClick={onClearCanvasPressed}>Clear canvas </UIButton>
        </Grid>
        <Grid item xs={12}>
          <CirclePicker className="colorPicker" width="275px" triangle="hide" onChangeComplete={(color, event) => {
            onColorChanged(color.hex);
          }} colors={
            [
              '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50',
              '#8bc34a', '#cddc39', '#ffeb3b', '#ff9800', '#ff5722', '#795548', '#607d8b', '#b3b3b3', '#000000'
            ]}/>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CanvasToolbox;
