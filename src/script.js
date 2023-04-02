import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from "gsap"

/**
 * Debug
 */
// const gui = new dat.GUI()

// const parameters = {
//     materialColor: '#ffeded'
// }

// gui
//     .addColor(parameters, 'materialColor')
//     .onChange(() => {
//       // material.color.set(parameters.materialColor)
//       particlesMaterial.color.set(parameters.materialColor)
//     })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Texture
 */
const textureLoader = new THREE.TextureLoader()

const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

const particleTexture = textureLoader.load('textures/particles/9.png')



/**
 * Objects
 */
const objectsDistance = 4



// Mesh 1
 const mesh1Material = new THREE.MeshNormalMaterial({
   color: '#ABFF4F',
   gradientMap: gradientTexture
 })

const mesh1 = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.5, 0),
  mesh1Material
)


// Mesh 2
const mesh2Material = new THREE.MeshNormalMaterial({
  color: '#F06C9B',
  gradientMap: gradientTexture
})

const mesh2 = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  mesh2Material
)

// Mesh 3
const mesh3Material = new THREE.MeshNormalMaterial({
  color: '#87BCDE',
  gradientMap: gradientTexture
})

const mesh3 = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.4, 16, 60),
  mesh3Material
)

// mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2

mesh1.position.x = 1
mesh2.position.x = -1
mesh3.position.x = 1

scene.add(mesh1, mesh2, mesh3)


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)

scene.add(directionalLight)

const sectionMeshes = [ mesh1, mesh2, mesh3 ]


/**
 * Particles
 */
const particlesCount = 1000
const positions = new Float32Array(particlesCount * 3)
// const colors = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10
  positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10

  // colors[i] = Math.random()
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
// particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

const particlesMaterial = new THREE.PointsMaterial({
  alphaMap: particleTexture,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  // vertexColors: true,
  sizeAttenuation: true,
  size: 0.06
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)

scene.add(particles)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */

// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)


// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
  scrollY = window.scrollY
  const newSection = Math.round(scrollY / sizes.height)

  if(newSection != currentSection) {
    currentSection = newSection
    gsap.to(sectionMeshes[currentSection].rotation,{
      duration: 1.5,
      ease: 'power2.inOut',
      x: '+=6',
      y: '+=3',
      z: '+=1.5'
    })
  }
})


/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX / sizes.width - 0.5
  cursor.y = e.clientY / sizes.height - 0.5

})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate particles
    // particles.rotation.z = elapsedTime * 0.01
    // particles.rotation.y = elapsedTime * 0.01


    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 3 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 3 * deltaTime

    // Animate Meshes
    for (const mesh of sectionMeshes) {
      mesh.rotation.x += deltaTime * 0.1
      mesh.rotation.y += deltaTime * 0.12
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
