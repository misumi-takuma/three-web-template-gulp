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

  update() {
    this.setParams()

    this.mesh.material.uniforms.uTime.value++
  }
}

const imagePlaneArray = []

// 毎フレーム呼び出す
const loop = () => {
  for (const plane of imagePlaneArray) {
    plane.update()
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
}

main()
