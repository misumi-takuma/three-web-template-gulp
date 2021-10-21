import {
  WebGLRenderer,
  Scene,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  Vector2
} from 'three'

import vertexSource from './shaders/shader.vert'
import fragmentSource from './shaders/shader.frag'

const width = window.innerWidth
const height = window.innerHeight

// レンダラー作成
const renderer = new WebGLRenderer()
renderer.setSize(width, height)
renderer.setPixelRatio(window.devicePixelRatio)

const container = document.getElementById('canvas-container')
container.appendChild(renderer.domElement)

// カメラ作成
const camera = new OrthographicCamera(-1, 1, 1, -1, 0, -1)

// シーンを作成
const scene = new Scene()

// 平面をつくる（幅, 高さ, 横分割数, 縦分割数）
const geo = new PlaneGeometry(2, 2, 1, 1)

const mouse = new Vector2(0.5, 0.5)
let targetRadius = 0.005

const uniforms = {
  uAspect: {
    value: width / height
  },
  uTime: {
    value: 0.0
  },
  uMouse: {
    value: new Vector2(0.5, 0.5)
  },
  uRadius: {
    value: targetRadius
  }
}

// シェーダーソースを渡してマテリアルを作成
const mat = new ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexSource,
  fragmentShader: fragmentSource,
  wireframe: false
})

const mesh = new Mesh(geo, mat)

// メッシュをシーンに追加
scene.add(mesh)

const mouseMoved = (x, y) => {
  // 左上原点から左下原点に変換
  mouse.x = x / width
  mouse.y = 1.0 - y / height
}

const mousePressed = (x, y) => {
  mouseMoved(x, y)
  targetRadius = 0.25 // マウスを押したら半径の目標値を大きく
}

const mouseReleased = (x, y) => {
  mouseMoved(x, y)
  targetRadius = 0.005 // マウスを押したら半径の目標値をデフォルト値に
}

const render = () => {
  requestAnimationFrame(render)

  const sec = performance.now() / 1000

  uniforms.uTime.value = sec
  uniforms.uMouse.value.lerp(mouse, 0.2)
  uniforms.uRadius.value += (targetRadius - uniforms.uRadius.value) * 0.2

  // 描画ループ
  renderer.render(scene, camera)
}

render()

window.addEventListener('mousemove', (e) => {
  mouseMoved(e.clientX, e.clientY)
})
window.addEventListener('mousedown', (e) => {
  mousePressed(e.clientX, e.clientY)
})
window.addEventListener('mouseup', (e) => {
  mouseReleased(e.clientX, e.clientY)
})
