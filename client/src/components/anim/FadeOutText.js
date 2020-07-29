import React, { useState, useEffect } from "react";
import { Typography } from "@material-ui/core";
import "./FadeOutText.css";

const FadeOutText = ({ text, className }) => {
  return <div className={`${className} fade_text`}>{text}</div>;
};

export default FadeOutText;
