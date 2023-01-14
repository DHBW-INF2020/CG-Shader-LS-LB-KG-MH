/* eslint no-console:0 consistent-return:0 */
"use strict";

function main() {
  // Get A WebGL context
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2"); //// WHY 2
  if (!gl) {
    // Exit if webgl context wasn't able to load
    return;
  }

  // Loading shader sources
  var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  console.log(vertexShaderSource);
  var fragmentWrapperShaderSource = document.querySelector("#fragment-shader-wrapper").text;
  console.log(fragmentWrapperShaderSource);
  var fragmentShadertoyShaderSource = document.querySelector("#fragment-shadertoy-shader-source").text;
  console.log(fragmentShadertoyShaderSource);
  var fragmentShaderSource = fragmentWrapperShaderSource + "\n" + fragmentShadertoyShaderSource;


  // Use our boilerplate utils to compile the shaders and link into a program
  var program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  // Look up where the vertex data needs to go
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Look up uniform locations
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_vertex_resolution");
  var fragmentResolutionUniformLocation = gl.getUniformLocation(program, "iResolution");
  var mouseUniformLocation = gl.getUniformLocation(program, "iMouse");
  var timeUniformLocation = gl.getUniformLocation(program, "iTime");


  // Create a buffer
  var positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear canvas
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell OpenGL to use the program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set
  gl.bindVertexArray(vao);

  // Set all constant uniform values
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(fragmentResolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(mouseUniformLocation, Math.random(), Math.random());
  

  var then = 0;
  requestAnimationFrame(drawScene);

  function drawScene(time){

    time *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    gl.uniform1f(timeUniformLocation, time);

    // Put a rectangle in the position buffer
    setRectangle(gl, 0, 0, gl.canvas.width, gl.canvas.height)

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
    
    requestAnimationFrame(drawScene);
  }
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
  return Math.floor(Math.random() * range);
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

function readFile(path){
  var reader = new FileReader();
  reader.readAsText(path, String);
  return reader.result;
}

main();