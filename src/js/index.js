import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  PointLight,
  BoxGeometry,
  MeshLambertMaterial,
  Mesh
} from 'three'

const width = window.innerWidth
const height = window.innerHeight

// レンダラー作成
const renderer = new WebGLRenderer()
renderer.setSize(width, height)
renderer.setPixelRatio(window.devicePixelRatio)

// canvasにレンダラー追加
const container = document.getElementById('canvas-container')
container.appendChild(renderer.domElement)

// カメラ作成
const camera = new PerspectiveCamera(60, width / height, 1, 10)
camera.position.z = 3

// シーンを作成
const scene = new Scene()

// ライトを作成
const light = new PointLight(0x00ffff)
light.position.set(2, 2, 2)

// ライトをシーンに追加
scene.add(light)

// 立方体のジオメトリを作成
const geo = new BoxGeometry(1, 1, 1)

// マテリアルを作成
const mat = new MeshLambertMaterial({ color: 0xffffff })

// ジオメトリとマテリアルからメッシュを作成
const mesh = new Mesh(geo, mat)

// メッシュをシーンに追加
scene.add(mesh)

const loop = () => {
  requestAnimationFrame(loop)

  const sec = performance.now() / 1000

  mesh.rotation.x = sec * (Math.PI / 4)
  mesh.rotation.y = sec * (Math.PI / 4)

  // 描画ループ
  renderer.render(scene, camera)
}

loop()
