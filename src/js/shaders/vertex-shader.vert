varying vec2 vUv;
uniform float uTime;

float PI = 3.1415926535897932384626433832795;

void main(){
  vUv = uv;
  vec3 pos = position;

  float offset = 3.0;
  float freq = 0.05;
  float amp = 0.05;
  pos.x = pos.x + sin(pos.y * offset + uTime * freq * PI ) * amp;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}