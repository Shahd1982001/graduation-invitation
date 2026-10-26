import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const gold = 0xc9a24e
const paper = 0xe9dcbc

function material(color, roughness = 0.42, metalness = 0.08) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

function makeRibbonShape(width, height) {
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, 0)
  shape.bezierCurveTo(-width * 0.35, height * 0.55, width * 0.1, height * 0.62, width / 2, height * 0.28)
  shape.bezierCurveTo(width * 0.18, height * 0.1, -width * 0.18, -height * 0.18, -width / 2, 0)
  return shape
}

function makeLoop(materialInstance, side) {
  const geometry = new THREE.ExtrudeGeometry(makeRibbonShape(1.05, 0.78), { depth: 0.12, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 3 })
  const mesh = new THREE.Mesh(geometry, materialInstance)
  mesh.position.x = side * 0.43
  mesh.rotation.y = side * -0.18
  mesh.rotation.z = side * 0.12
  return mesh
}

function makeTail(materialInstance, side) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.18)
  shape.lineTo(side * 0.34, -0.72)
  shape.lineTo(side * 0.05, -0.6)
  shape.lineTo(-side * 0.12, -0.82)
  shape.lineTo(-side * 0.1, 0.1)
  shape.closePath()
  const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04 }), materialInstance)
  mesh.position.y = -0.18
  mesh.rotation.y = side * -0.14
  return mesh
}

function createScene(canvas) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100)
  camera.position.set(0, 0.25, 8)
  camera.lookAt(0, 0, 0)
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  scene.add(new THREE.HemisphereLight(0xfff4d0, 0x4f381b, 2.2))
  const key = new THREE.DirectionalLight(0xffefbf, 4)
  key.position.set(-3, 5, 6)
  key.castShadow = true
  scene.add(key)
  const fill = new THREE.PointLight(0xd8ae59, 2.2, 12)
  fill.position.set(3, -1, 4)
  scene.add(fill)

  const root = new THREE.Group()
  root.rotation.x = -0.08
  scene.add(root)

  const scroll = new THREE.Group()
  root.add(scroll)
  const rodMaterial = material(paper, 0.3)
  const endMaterial = material(0xb58a35, 0.3, 0.25)
  const rodGeometry = new THREE.CylinderGeometry(0.23, 0.23, 4.1, 48)
  const rodTop = new THREE.Mesh(rodGeometry, rodMaterial)
  const rodBottom = new THREE.Mesh(rodGeometry, rodMaterial)
  const topCaps = []
  const bottomCaps = []
  rodTop.rotation.z = Math.PI / 2
  rodBottom.rotation.z = Math.PI / 2
  rodTop.position.y = 0.42
  rodBottom.position.y = -0.42
  rodTop.castShadow = rodBottom.castShadow = true
  scroll.add(rodTop, rodBottom)
  for (const y of [0.42, -0.42]) {
    for (const x of [-2.05, 2.05]) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 20), endMaterial)
      cap.scale.set(0.72, 1, 1)
      cap.position.set(x, y, 0)
      cap.castShadow = true
      scroll.add(cap)
      if (y > 0) topCaps.push(cap)
      else bottomCaps.push(cap)
    }
  }

  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(3.85, 1, 1, 24),
    material(0xf6efe3, 0.65)
  )
  sheet.position.z = -0.08
  sheet.scale.y = 0.08
  sheet.castShadow = true
  sheet.receiveShadow = true
  scroll.add(sheet)

  const ribbonMaterial = material(gold, 0.26, 0.28)
  const bow = new THREE.Group()
  bow.position.set(0, 0.02, 0.35)
  bow.add(makeLoop(ribbonMaterial, -1), makeLoop(ribbonMaterial, 1), makeTail(ribbonMaterial, -1), makeTail(ribbonMaterial, 1))
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 20), material(0xd9b873, 0.22, 0.3))
  knot.scale.set(1, 0.85, 0.65)
  bow.add(knot)
  scroll.add(bow)

  const floor = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), new THREE.ShadowMaterial({ opacity: 0.2 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.02
  floor.position.z = 0.2
  floor.receiveShadow = true
  scene.add(floor)

  return { scene, camera, renderer, root, scroll, bow, sheet, rodTop, rodBottom, topCaps, bottomCaps }
}

export default function Scroll3D({ phase, onOpen }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const { scene, camera, renderer, root, scroll, bow, sheet, rodTop, rodBottom, topCaps, bottomCaps } = createScene(canvas)
    canvas.__threeScene = { root, scroll, bow, sheet, rodTop, rodBottom, topCaps, bottomCaps }
    const resize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement)
    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      if (canvas.dataset.phase === 'closed') {
        bow.rotation.z = Math.sin(Date.now() * 0.0018) * 0.035
        root.rotation.y = Math.sin(Date.now() * 0.0007) * 0.025
      }
      renderer.render(scene, camera)
    }
    tick()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.dispose()
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) object.material.dispose()
      })
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.dataset.phase = phase
    const objects = canvas.__threeScene
    if (!objects || phase !== 'opening') return
    objects.bow.visible = true
    objects.scroll.visible = true
    objects.bow.scale.set(1, 1, 1)
    objects.scroll.scale.set(1, 1, 1)
    const start = performance.now()
    const duration = 1500
    const animateOpening = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      objects.bow.rotation.z = ease * 0.75
      objects.bow.position.y = ease * 1.2
      objects.bow.position.z = 0.35 - ease * 0.4
      objects.bow.scale.setScalar(1 - ease * 0.5)
      objects.rodTop.position.y = 0.42 + ease * 2.15
      objects.rodBottom.position.y = -0.42 - ease * 2.15
      objects.topCaps.forEach((cap) => { cap.position.y = objects.rodTop.position.y })
      objects.bottomCaps.forEach((cap) => { cap.position.y = objects.rodBottom.position.y })
      objects.sheet.scale.y = 0.08 + ease * 4.25
      if (progress < 1) requestAnimationFrame(animateOpening)
    }
    requestAnimationFrame(animateOpening)
  }, [phase])

  return <canvas ref={canvasRef} className="scroll-3d" aria-label="لفافة ثلاثية الأبعاد" />
}
