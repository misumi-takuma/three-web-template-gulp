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

const createMesh = (img) => {
  const texture = loader.load(img.src)

  const uniforms = {
    uTexture: { value: texture },
    uImageAspect: { value: img.naturalWidth / img.naturalHeight },
    uPlaneAspect: { value: img.clientWidth / img.clientHeight },
    uTime: { value: 0 }
  }
  const geo = new PlaneBufferGeometry(1, 1, 100, 100) // 後から画像のサイズにscaleするので1にしておく
  const mat = new ShaderMaterial({
    uniforms,
    vertexShader: vertexSource,
    fragmentShader: fragmentSource
  })

  const mesh = new Mesh(geo, mat)

  return mesh
}

class ImagePlane {
  constructor(mesh, img) {
    this.refImage = img // 参照するimg要素
    this.mesh = mesh
  }

  setParams() {
    // 参照するimg要素から大きさ、位置を取得してセットする
    const rect = this.refImage.getBoundingClientRect()

    this.mesh.scale.x = rect.width
    this.mesh.scale.y = rect.height

    // window座標をWebGL座標に変換
    const x = rect.left - canvasSize.w / 2 + rect.width / 2
    const y = -rect.top + canvasSize.h / 2 - rect.height / 2
    this.mesh.position.set(x, y, this.mesh.position.z)
  }

  update(offset) {
    this.setParams()

    this.mesh.material.uniforms.uTime.value = offset
  }
}

// リサイズ処理
let timeoutId = 0
const resize = () => {
  // three.jsのリサイズ
  const width = window.innerWidth
  const height = window.innerHeight

  canvasSize.w = width
  canvasSize.h = height

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  // カメラの距離を計算し直す
  const fov = 60
  const fovRad = (fov / 2) * (Math.PI / 180)
  const dist = canvasSize.h / 2 / Math.tan(fovRad)
  camera.position.z = dist
}

let targetScrollY = 0 // 本来のスクロール位置
let currentScrollY = 0 // 線形補間を適用した現在のスクロール位置
let scrollOffset = 0 // 上記2つの差分

const lerp = (start, end, multiplier) => {
  return (1 - multiplier) * start + multiplier * end
}

const updateScroll = () => {
  // スクロール位置を取得
  targetScrollY = document.documentElement.scrollTop
  // リープ関数でスクロール位置をなめらかに追従
  currentScrollY = lerp(currentScrollY, targetScrollY, 0.1)

  scrollOffset = targetScrollY - currentScrollY
}

// 慣性スクロール
const scrollArea = document.querySelector('.scrollable')
// ボディの高さがなくなるのでコンテンツ分指定する
document.body.style.height = `${scrollArea.getBoundingClientRect().height}px`

const imagePlaneArray = []

// 毎フレーム呼び出す
const loop = () => {
  updateScroll()

  scrollArea.style.transform = `translate3d(0,${-currentScrollY}px,0)`
  for (const plane of imagePlaneArray) {
    plane.update(scrollOffset)
  }
  renderer.render(scene, camera)

  requestAnimationFrame(loop)
}

const main = () => {
  window.addEventListener('load', () => {
    const imageArray = [...document.querySelectorAll('img')]
    for (const img of imageArray) {
      const mesh = createMesh(img)
      scene.add(mesh)

      const imagePlane = new ImagePlane(mesh, img)
      imagePlane.setParams()

      imagePlaneArray.push(imagePlane)
    }

    loop()
  })

  // リサイズ（負荷軽減のためリサイズが完了してから発火する）
  window.addEventListener('resize', () => {
    if (timeoutId) clearTimeout(timeoutId)

    timeoutId = setTimeout(resize, 200)
  })
}

main()
