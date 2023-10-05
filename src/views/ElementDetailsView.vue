<script>
import { useElementStore } from '@/stores/index.js';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default {
  name: 'ElementDetailsView',
  mounted() {
    this.loadModel()
  },
  computed: {
    selectedElement() {
      // Récupérer l'élément depuis le localStorage et le parser
      const storedElement = JSON.parse(localStorage.getItem('selectedElement'));

      // Vous pouvez également récupérer l'élément du store si vous préférez
      const elementStore = useElementStore();
      const selectedElement = elementStore.selectedElement;

      // Utilisez l'élément du localStorage s'il est défini, sinon utilisez celui du store
      return storedElement || selectedElement;
    },
  },

  methods: {
    loadModel() {
      const container = document.getElementById('model-container')
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.z = 5;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      const loader = new GLTFLoader()
      loader.load(this.selectedElement.bohr_model_3d, gltf => {
        const model = gltf.scene;

        // Cherchez l'objet "Armature" dans le modèle
        const armature = model.getObjectByName('Armature');

        if (armature) {
          // Si "Armature" existe, vous pouvez accéder à l'animation à partir de là
          const animationClip = armature.animations.find(animation => animation.name === 'Animation');

          if (animationClip) {
            const mixer = new THREE.AnimationMixer(armature);
            const action = mixer.clipAction(animationClip);
            action.play();
          }
        }

        model.scale.set(10, 10, 10);
        scene.add(model);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1).normalize();
        scene.add(light);

        model.rotation.x = 0.5; // Appliquer l'inclinaison sur l'axe X
        renderer.render(scene, camera);
      });


      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false // Désactiver le zoom
      controls.autoRotate = true // Faire tourner le modèle automatiquement
      controls.autoRotateSpeed = 0.5 // Vitesse de rotation
      controls.enableDamping = true // Ajouter un amortissement pour un mouvement plus fluide

      function render() {
        requestAnimationFrame(render)
        controls.update()
        renderer.render(scene, camera)
      }

      render()
    }
  },
}
</script>

<template>
  <div class="more-info">
<!--    <div>-->
<!--      <p>{{ element.symbol }}</p>-->
<!--      <p>{{ element.number }}</p>-->
<!--      <p>{{ element.atomic_mass }}</p>-->
<!--      <p>{{ element.category }}</p>-->
<!--    </div>-->
<!--    <div>-->
<!--      <p>{{ element.boil }}</p>-->
<!--      <p>{{ element.melt }}</p>-->
<!--      <p>{{ element.density }}</p>-->
<!--      <p>{{ element.molar_heat }}</p>-->
<!--    </div>-->
<!--    <div>-->
<!--      <p>{{ element.electron_configuration }}</p>-->
<!--      <p>{{ element.electron_affinity }}</p>-->
<!--      <p>{{ element.electronegativity_pauling }}</p>-->
<!--      <p>{{ element.ionization_energies }}</p>-->
<!--    </div>-->
<!--    <div>-->
<!--      <p>{{ element.discovered_by }}</p>-->
<!--      <p>{{ element.named_by }}</p>-->
<!--      <p>{{ element.appearance }}</p>-->
<!--      <p>{{ element.phase }}</p>-->
<!--    </div>-->
    <div id="model-container"></div>
<!--    <div>-->
<!--      <p>{{ element.summary }}</p>-->
<!--    </div>-->
<!--    <div>-->
<!--      <img :src="element.spectral_img" alt="spectral ">-->
<!--    </div>-->
    <router-link to="/">Back</router-link>
  </div>
</template>

<style lang="scss" scoped>
.more-info{
  grid-column: 1/3;
  grid-row: 1/3;
  display: grid;
  grid-template-columns: 0.75fr 1fr 0.75fr;
  grid-template-rows: 0.75fr 1fr 0.75fr;
}
#model-container {
  grid-column: 2/3;
  grid-row: 2/3;
  display: flex;
  justify-content: center;
  background-color: transparent;
}
</style>