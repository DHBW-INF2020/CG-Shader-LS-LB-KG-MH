/* eslint no-console:0 consistent-return:0 */
"use strict";

var mousePosX = 0;
var mousePosY = 0;

function initMouseInput(){
  onmousemove = function(e){
    mousePosX = e.clientX;
    mousePosY = e.clientY;
  }
}

const NOT_PRESSED = 0.0;
const PRESSED = 1.0;

var forwardKeyPressed = NOT_PRESSED;
var backwardKeyPressed = NOT_PRESSED;
var leftKeyPressed = NOT_PRESSED;
var rightKeyPressed = NOT_PRESSED;
var spaceKeyPressed = NOT_PRESSED;
var shiftKeyPressed = NOT_PRESSED;

function initKeyboardInput(){
  onkeydown = function(e) {
      console.log(e.key);
      if(e.key == "w") {
        forwardKeyPressed = PRESSED;
      }
      else if(e.key == "s") {
        backwardKeyPressed = PRESSED;
      }
      else if(e.key == "a") {
        leftKeyPressed = PRESSED;
      }
      else if(e.key == "d") {
        rightKeyPressed = PRESSED;
      }
      else if(e.key == " ") {
        spaceKeyPressed = PRESSED;
      }
      else if(e.key == "Shift") {
        shiftKeyPressed = PRESSED;
      }
  }

  onkeyup = function(e) {
    console.log(e.key);
    if(e.key == "w") {
      forwardKeyPressed = NOT_PRESSED;
    }
    else if(e.key == "s") {
      backwardKeyPressed = NOT_PRESSED;
    }
    else if(e.key == "a") {
      leftKeyPressed = NOT_PRESSED;
    }
    else if(e.key == "d") {
      rightKeyPressed = NOT_PRESSED;
    }
    else if(e.key == " ") {
      spaceKeyPressed = NOT_PRESSED;
    }
    else if(e.key == "Shift") {
      shiftKeyPressed = NOT_PRESSED;
    }
  }
}

function initOpenGl(){
  // Get A WebGL context
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2"); //// WHY 2
  if (!gl) {
    // Exit if webgl context wasn't able to load
    throw "'gl' is Null";
  }
  return gl;
}

function compileProgram(openGlObject){
  // Loading shader sources
  var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  var fragmentWrapperShaderSource = document.querySelector("#fragment-shader-wrapper").text;
  var fragmentShadertoyShaderSource = document.querySelector("#fragment-shadertoy-shader-source").text;

  var fragmentShaderSource = fragmentWrapperShaderSource + "\n" + fragmentShadertoyShaderSource;

  // Use our boilerplate utils to compile the shaders and link into a program
  var program = webglUtils.createProgramFromSources(openGlObject,
      [vertexShaderSource, fragmentShaderSource]);
  return program;
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function render(openGlObject){
  // Put a rectangle in the position buffer
  setRectangle(openGlObject, 0, 0, openGlObject.canvas.width, openGlObject.canvas.height)

  // Draw the rectangle.
  var primitiveType = openGlObject.TRIANGLES;
  var offset = 0;
  var count = 6;
  openGlObject.drawArrays(primitiveType, offset, count);
}

// Fill the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}                

function main() {

  initMouseInput();
  initKeyboardInput();
  var gl = initOpenGl();
  var program = compileProgram(gl);

  // Look up where the vertex data needs to go
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Look up uniform locations
  var vertexResolutionUniformLocation = gl.getUniformLocation(program, "u_vertex_resolution");
  var fragmentResolutionUniformLocation = gl.getUniformLocation(program, "iResolution");
  var mouseUniformLocation = gl.getUniformLocation(program, "iMouse");
  var timeUniformLocation = gl.getUniformLocation(program, "iTime");
  var cameraPositionUniformLocation = gl.getUniformLocation(program, "cameraPosition");
  var cameraOrientationUniformLocation = gl.getUniformLocation(program, "cameraOrientation");


  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();
  // and make it the one we're currently working with
  gl.bindVertexArray(vao);  
  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);
  // Create a buffer
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset
  );

  webglUtils.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear canvas
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell OpenGL to use the program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set
  // gl.bindVertexArray(vao);

  // Set all constant uniform values
  gl.uniform2f(vertexResolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(fragmentResolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  
  var currentPosition = [0.0, 0.0, 0.0]
  var currentOrientation = [0.0, 0.0, 0.0]
  var lastTime = 0;
  requestAnimationFrame(drawScene);

  function drawScene(timeInMilliseconds){
    var timeInSeconds = timeInMilliseconds/1000;
    // Subtract the previous time from the current time
    var deltaTime = timeInSeconds - lastTime;
    // Remember the current time for the next frame.
    lastTime = timeInSeconds;

    gl.uniform2f(mouseUniformLocation, mousePosX, mousePosY);
    gl.uniform1f(timeUniformLocation, timeInSeconds);
    
    var mouseSpeed = 0.01;
    var mouseSpeedBasedOnFps = deltaTime * mouseSpeed;
    currentOrientation[0] = mousePosX * mouseSpeed;
    currentOrientation[1] = mousePosY * mouseSpeed;

    var movementSpeed = 3.0;spaceKeyPressed
    var movementSpeedBasedOnFps = movementSpeed*deltaTime;
    currentPosition[0] -= leftKeyPressed * movementSpeedBasedOnFps;
    currentPosition[0] += rightKeyPressed * movementSpeedBasedOnFps;
    currentPosition[1] -= shiftKeyPressed * movementSpeedBasedOnFps;
    currentPosition[1] += spaceKeyPressed * movementSpeedBasedOnFps;
    currentPosition[2] -= forwardKeyPressed * movementSpeedBasedOnFps;
    currentPosition[2] += backwardKeyPressed * movementSpeedBasedOnFps;

    gl.uniform3f(cameraPositionUniformLocation, currentPosition[0], currentPosition[1], currentPosition[2]);
    gl.uniform3f(cameraOrientationUniformLocation, currentOrientation[0], currentOrientation[1], currentOrientation[2]);

    // Render the scene
    render(gl); 
    requestAnimationFrame(drawScene);
  }
}

main();