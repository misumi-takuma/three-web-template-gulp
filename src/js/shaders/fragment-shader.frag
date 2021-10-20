varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uImageAspect;
uniform float uPlaneAspect;

void main(){
  // 画像のアスペクトとプレーンのアスペクトを比較し、短い方に合わせる
  vec2 ratio = vec2(
    min(uPlaneAspect / uImageAspect, 1.0),
    min((1.0 / uPlaneAspect) / (1.0 / uImageAspect), 1.0)
  );

  // 計算結果を用いて補正後のuv値を生成
  vec2 fixedUv = vec2(
    (vUv.x - 0.5) * ratio.x + 0.5,
    (vUv.y - 0.5) * ratio.y + 0.5
  );

  vec3 texture = texture2D(uTexture, fixedUv).rgb;
  gl_FragColor = vec4(texture, 1.0);
}