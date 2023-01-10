#version 300 es
in vec2 vPosition;
out vec4 Position;
uniform float t;
// varying float T;
float T;
void main() {
        //  gl_Position = vec4(a_position, 0.0, t);
        T = t;
        Position = vec4(vPosition, 1.0, 1.0);
}