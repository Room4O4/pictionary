import React, { useEffect, useRef } from 'react';
import './canvas.css';

const Canvas = ({ io, canvasOptions }) => {
  let drawing = false;
  const current = { x: 0, y: 0 };
  const canvasRef = useRef(null);

  /*
   * The below four methods helps resize the canvas and preserve scale.
   * However at this point, we don't care about resizing as people rarely do that
   * For more info on how these work, refer - https://www.pluralsight.com/guides/render-window-resize-react

  let coordinates = useRef([]);

  const [scale, setScale] = React.useState({ x: 1, y: 1 });
  const calculateScaleX = () => canvasRef.current.clientWidth / 500;
  const calculateScaleY = () => canvasRef.current.clientHeight / 500;

   const resized = () => {
    canvasRef.current.width = canvasRef.current.clientWidth;
    canvasRef.current.height = canvasRef.current.clientHeight;
    setScale({ x: calculateScaleX(), y: calculateScaleY() });
  };

  useEffect(() => {
    //window.addEventListener("resize", () => onResize(), false);
    //onResize();

    const currentCanvas = canvasRef.current;
    window.addEventListener("resize", resized);
    return () => window.removeEventListener("resize", resized);
  });

  useEffect(() => {
    restoreCanvas(coordinates.current, scale);
  }, [scale]);

    function restoreCanvas(coordinates) {
    var rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = canvasRef.current.height / rect.height; // relationship bitmap vs. element for Y
    for (let index = 1; index < coordinates.length; index++) {
      let prev = coordinates[index - 1];
      let next = coordinates[index];
      prev.x = (prev.x - rect.left) * scaleX;
      prev.y = (prev.y - rect.top) * scaleY;
      next.x = (next.x - rect.left) * scaleX;
      next.y = (next.y - rect.top) * scaleY;
      drawLine(prev.x, prev.y, next.x, next.y, undefined, true);
    }
  }
  */

  const clearCanvas = (roundNumber, totalRounds) => {
    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  useEffect(() => {
    if (io) {
      io.on('S_C_DRAW', onDrawingEvent);
      io.on('GE_NEW_ROUND', clearCanvas);
      io.on('S_C_CLEAR_CANVAS', clearCanvas);
    }
    return () => {
      io.off('S_C_DRAW', onDrawingEvent);
      io.off('GE_NEW_ROUND', clearCanvas);
      io.off('S_C_CLEAR_CANVAS', clearCanvas);
    };
  }, [io]);

  // We resize the canvas to set scale once component is loaded
  useEffect(() => {
    onResize();
  }, []);

  // make the canvas fill its parent
  // Ref - https://stackoverflow.com/a/10215724
  function onResize (e) {
    canvasRef.current.width = canvasRef.current.offsetWidth;
    canvasRef.current.height = canvasRef.current.offsetHeight;
    // restoreCanvas(coordinates.current);
  }

  function drawLine (x0, y0, x1, y1, color, emit) {
    const context = canvasRef.current.getContext('2d');
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

    io.emit('C_S_DRAW', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }
  function onMouseDown (e) {
    if (canvasOptions.enabled) {
    // e = Mouse click event.
      var rect = e.target.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width; // relationship bitmap vs. element for X
      const scaleY = canvasRef.current.height / rect.height; // relationship bitmap vs. element for Y
      const inputX = e.clientX || e.touches[0].clientX;
      const inputY = e.clientY || e.touches[0].clientY;

      var x = (inputX - rect.left) * scaleX; // x position within the element.
      var y = (inputY - rect.top) * scaleY; // y position within the element.
      drawing = true;
      current.x = x;
      current.y = y;
    } else {
      drawing = false;
    }
  }

  function onMouseUp (e) {
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

    var x = (inputX - rect.left) * scaleX; // x position within the element.
    var y = (inputY - rect.top) * scaleY; // y position within the element.
    drawLine(current.x, current.y, x, y, canvasOptions.color, true);
  }

  function onMouseMove (e) {
    if (!drawing) {
      return;
    }
    var rect = e.target.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = canvasRef.current.height / rect.height; // relationship bitmap vs. element for Y
    const inputX = e.clientX || e.touches[0].clientX;
    const inputY = e.clientY || e.touches[0].clientY;
    var x = (inputX - rect.left) * scaleX; // x position within the element.
    var y = (inputY - rect.top) * scaleY; // y position within the element.

    drawLine(current.x, current.y, x, y, canvasOptions.color, true);
    current.x = x;
    current.y = y;
  }

  // limit the number of events per second
  function throttle (callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
      var time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent (data) {
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
