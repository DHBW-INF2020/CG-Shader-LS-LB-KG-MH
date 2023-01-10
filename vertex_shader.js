// uniform mat4 projectionMatrix;
//             uniform vec3 lightSource;

//             attribute vec3 a_position;
//             attribute vec3 normal;
//             uniform float t;
//             varying float intensity;
//             void main() {
//             mat3 m;
//             m[0] = vec3(1.0, 0.0, 0.0);
//             m[1] = vec3(0.0, cos(t), -sin(t));
//             m[2] = vec3(0.0, sin(t), cos(t));
//             vec3 position = m*a_position;

//             position += vec3(1.0,1.0, -10.0);

//             gl_Position = projectionMatrix*vec4(position, 1.0);

//             vec3 lightDir = lightSource - position;

//             lightDir = normalize(lightDir);

//             vec3 rNormal = normalize(m*normal);

//             intensity = max(0.0, dot(rNormal, lightDir));
//             }