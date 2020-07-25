import React, { useState, useEffect, useRef } from "react";
import "./canvas.css";

const Canvas = ({ io }) => {
  let drawing = false;
  let current = { x: 0, y: 0 };
  let canvasRef = useRef(null);
  let coordinates = useRef([]);

  useEffect(() => {
    if (io) {
      io.on("S_C_DRAW", onDrawingEvent);
      io.on("GE_NEW_ROUND", (roundNumber, totalRounds) => {
        const context = canvasRef.current.getContext("2d");
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        coordinates = [];
      });

      if (coordinates.current) {
        restoreCanvas(coordinates.current);
      }
    }
  });

  useEffect(() => {
    window.addEventListener("resize", () => onResize(), false);
    onResize();
  }, []);

  function restoreCanvas(coordinates) {
    var rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = canvasRef.current.height / rect.height; // relationship bitmap vs. element for Y
    console.log("Restore points");
    for (let index = 1; index < coordinates.length; index++) {
      let prev = coordinates[index - 1];
      let next = coordinates[index];
      prev.x = (prev.x - rect.left) * scaleX;
      prev.y = (prev.y - rect.top) * scaleY;
      next.x = (next.x - rect.left) * scaleX;
      next.y = (next.y - rect.top) * scaleY;
      drawLine(prev.x, prev.y, next.x, next.y, "#FF0000", true);
    }
  }

  // make the canvas fill its parent
  function onResize() {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    if (io) {
      restoreCanvas(coordinates.current);
    }
  }

  function drawLine(x0, y0, x1, y1, color, emit) {
    const context = canvasRef.current.getContext("2d");
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 4;
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
    const inputX = e.clientX || e.touches[0].clientX;
    const inputY = e.clientY || e.touches[0].clientY;

    var x = (inputX - rect.left) * scaleX; //x position within the element.
    var y = (inputY - rect.top) * scaleY; //y position within the element.
    drawing = true;
    current.x = x;
    current.y = y;
    coordinates.current.push(current);
  }

  function onMouseUp(e) {
    if (!drawing) {
      return;
    }
    drawing = false;
    if (!e || e.touches) {
      return;
    }

    var rect = e.target.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = canvasRef.current.height / rect.height; // relationship bitmap vs. element for Y
    const inputX = e.clientX || e.touches[0].clientX;
    const inputY = e.clientY || e.touches[0].clientY;

    var x = (inputX - rect.left) * scaleX; //x position within the element.
    var y = (inputY - rect.top) * scaleY; //y position within the element.
    drawLine(current.x, current.y, x, y, current.color, true);
    coordinates.current.push({ x, y });
  }

  function onMouseMove(e) {
    if (!drawing) {
      return;
    }
    var rect = e.target.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = canvasRef.current.height / rect.height; // relationship bitmap vs. element for Y
    const inputX = e.clientX || e.touches[0].clientX;
    const inputY = e.clientY || e.touches[0].clientY;
    var x = (inputX - rect.left) * scaleX; //x position within the element.
    var y = (inputY - rect.top) * scaleY; //y position within the element.

    drawLine(current.x, current.y, x, y, current.color, true);
    current.x = x;
    current.y = y;
    coordinates.current.push(current);
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
      onMouseMove={(e) => throttle(onMouseMove(e), 10)}
      onTouchStart={(e) => onMouseDown(e)}
      onTouchEnd={(e) => onMouseUp(e)}
      onTouchCancel={(e) => onMouseUp(e)}
      onTouchMove={(e) => throttle(onMouseMove(e), 10)}
      ref={canvasRef}
    />
  );
};

export default Canvas;
