import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  TextureLoader,
  PlaneBufferGeometry,
  ShaderMaterial,
  Mesh
} from 'three'
import vertexSource from './shaders/vertex-shader.vert'
import fragmentSource from './shaders/fragment-shader.frag'

const canvasEl = document.getElementById('webgl-canvas')
const canvasSize = {
  w: window.innerWidth,
  h: window.innerHeight
}

const renderer = new WebGLRenderer({ canvas: canvasEl })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(canvasSize.w, canvasSize.h)

// ウィンドウとwebGLの座標を一致させるため、描画がウィンドウぴったりになるようカメラを調整
const fov = 60 // 視野角
const fovRad = (fov / 2) * (Math.PI / 180)
const dist = canvasSize.h / 2 / Math.tan(fovRad)
const camera = new PerspectiveCamera(
  fov,
  canvasSize.w / canvasSize.h,
  0.1,
  1000
)
camera.position.z = dist

const scene = new Scene()

const loader = new TextureLoader()
const texture = loader.load('https://picsum.photos/id/237/1500/800')

const uniforms = {
  uTexture: { value: texture },
  uImageAspect: { value: 1920 / 1280 }, // 画像のアスペクト
  uPlaneAspect: { value: 800 / 500 }, // プレーンのアスペクト
  uTime: { value: 0 } // 時間経過
}
const geo = new PlaneBufferGeometry(800, 500, 100, 100)
const mat = new ShaderMaterial({
  uniforms,
  vertexShader: vertexSource,
  fragmentShader: fragmentSource
})

const mesh = new Mesh(geo, mat)

scene.add(mesh)

// 毎フレーム呼び出す
const loop = () => {
  uniforms.uTime.value++
  renderer.render(scene, camera)

  requestAnimationFrame(loop)
}

const main = () => {
  window.addEventListener('load', () => {
    loop()
  })
}

main()
