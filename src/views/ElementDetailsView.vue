<script>
import { useElementStore } from '@/stores/index.js'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default {
  name: 'ElementDetailsView',
  mounted() {
    this.setModel()
  },
  computed: {
    selectedElement() {
      // Récupérer l'élément depuis le localStorage et le parser
      const storedElement = JSON.parse(localStorage.getItem('selectedElement'))

      // Vous pouvez également récupérer l'élément du store si vous préférez
      const elementStore = useElementStore()
      const selectedElement = elementStore.selectedElement

      // Utilisez l'élément du localStorage s'il est défini, sinon utilisez celui du store
      return storedElement || selectedElement
    },
  },

  methods: {
    setModel(){
      const container = document.getElementById('model-container')
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
      camera.position.z = 5
      camera.position.set(7.5, 0, 0)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(container.clientWidth, container.clientHeight)
      container.appendChild(renderer.domElement)

      const loader = new GLTFLoader()
      loader.load(this.selectedElement.bohr_model_3d, gltf => {
        const model = gltf.scene

        // Si "Armature" existe, vous pouvez accéder à l'animation à partir de là
        const animationClip = gltf.animations[0]
        const mixer = new THREE.AnimationMixer(model)
        const action = mixer.clipAction(animationClip)
        action.play()

        model.scale.set(10, 10, 10)
        scene.add(model)

        const light = new THREE.DirectionalLight(0xffffff, 1)
        light.position.set(1, 1, 1).normalize()
        scene.add(light)

        model.rotation.x = 0.5 // Appliquer l'inclinaison sur l'axe X
        renderer.render(scene, camera)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableZoom = false // Désactiver le zoom
        controls.autoRotate = true // Faire tourner le modèle automatiquement
        controls.autoRotateSpeed = 0.25 // Vitesse de rotation
        controls.enableDamping = true // Ajouter un amortissement pour un mouvement plus fluide

        function render() {
          requestAnimationFrame(render)
          controls.update()
          renderer.render(scene, camera)
        }
        render()

        const clock = new THREE.Clock()

        this.current = Date.now()
        this.delta = 16

        const tick = () =>
        {
          const currentTime = Date.now()
          this.delta = currentTime - this.current
          this.current = currentTime

          // Update animation
          mixer.update(this.delta * 0.001)// Update controls
          controls.update()

          // Render
          renderer.render(scene, camera)

          // Call tick again on the next frame
          window.requestAnimationFrame(tick)
        }
        tick()
      })
    }
  },
}
</script>

<template>
  <div class="more-info">
    <div id="model-container"></div>
  </div>
</template>

<style lang="scss" scoped>
.more-info{
  grid-column: 1/2;
  grid-row: 1/3;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
#model-container{
  width: 100%;
  height: 100%;
}
</style>