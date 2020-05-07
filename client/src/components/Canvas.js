import React, { useState, useEffect, useRef } from "react";
import "./canvas.css";

const Canvas = ({ io }) => {
  let drawing = false;
  let current = { x: 0, y: 0 };
  const canvasRef = useRef(null);

  useEffect(() => {
    window.addEventListener("resize", onResize, false);
    onResize();

    if (io) {
      io.on("S_C_DRAW", onDrawingEvent);
      io.on("GE_NEW_ROUND", (roundNumber, totalRounds) => {
        const context = canvasRef.current.getContext('2d');
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);      
      });
    }
  });

  // make the canvas fill its parent
  function onResize() {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
  }

  function drawLine(x0, y0, x1, y1, color, emit) {
    const context = canvasRef.current.getContext("2d");
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) {
      return;
    }
    var w = canvasRef.current.width;
    var h = canvasRef.current.height;

    io.emit("C_S_DRAW", {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
    });
  }
  function onMouseDown(e) {
    // e = Mouse click event.
    var rect = e.target.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = canvasRef.current.height / rect.height; // relationship bitmap vs. element for Y
    var x = (e.clientX - rect.left) * scaleX; //x position within the element.
    var y = (e.clientY - rect.top) * scaleY; //y position within the element.
    drawing = true;
    current.x = x || e.touches[0].clientX;
    current.y = y || e.touches[0].clientY;
  }

  function onMouseUp(e) {
    if (!drawing) {
      return;
    }
    drawing = false;
    var rect = e.target.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = canvasRef.current.height / rect.height; // relationship bitmap vs. element for Y
    var x = (e.clientX - rect.left) * scaleX; //x position within the element.
    var y = (e.clientY - rect.top) * scaleY; //y position within the element.
    drawLine(
      current.x,
      current.y,
      x || e.touches[0].clientX,
      y || e.touches[0].clientY,
      current.color,
      true
    );
  }

  function onMouseMove(e) {
    if (!drawing) {
      return;
    }
    var rect = e.target.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = canvasRef.current.height / rect.height; // relationship bitmap vs. element for Y
    var x = (e.clientX - rect.left) * scaleX; //x position within the element.
    var y = (e.clientY - rect.top) * scaleY; //y position within the element.

    drawLine(
      current.x,
      current.y,
      x || e.touches[0].clientX,
      y || e.touches[0].clientY,
      current.color,
      true
    );
    current.x = x || e.touches[0].clientX;
    current.y = y || e.touches[0].clientY;
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
      var time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data) {
    var w = canvasRef.current.width;
    var h = canvasRef.current.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  return (
    <canvas
      className="canvas"
      onMouseDown={(e) => onMouseDown(e)}
      onMouseUp={(e) => onMouseUp(e)}
      onMouseOut={(e) => onMouseUp(e)}
      onMouseMove={(e) => throttle(onMouseMove(e))}
      ref={canvasRef}
    />
  );
};

export default Canvas;
