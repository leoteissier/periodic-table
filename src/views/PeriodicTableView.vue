<script>
import { useElementStore } from '@/stores/index.js';
import { gsap } from "gsap";

export default {
  name: 'PeriodicTableView',
  data() {
    return {
      grid: [],
      selectedElement: null,
      selectedCategory: null,
      categories: [
        'alkali metal',
        'alkaline earth metal',
        'actinide',
        'lanthanide',
        'transition metal',
        'post-transition metal',
        'metalloid',
        'nonmetal',
        'halogen',
        'noble gas'
      ],
    }
  },
  async created() {
    const elementStore = useElementStore();
    elementStore.initFromLocalStorage();
    await elementStore.fetchElements();
    this.createGrid(elementStore.elements);
    window.addEventListener('click', this.handleOutsideClick);
  },
  computed: {
    loading() {
      return useElementStore().loading;
    },
    flatGrid() {
      // Aplatir le tableau 2D en une liste d'éléments
      return this.grid.flat();
    },
    electronConfig() {
      return this.parseElectronConfig(this.selectedElement.electron_configuration);
    },
  },
  methods: {
    createGrid(elements) {
      this.grid = Array(10).fill(null).map(() => Array(18).fill(null));

      elements.forEach(element => {
        const position = this.getElementPosition(element.number);
        if (position) {
          this.grid[position.row][position.column] = {
            ...element,
            row: position.row,
            column: position.column
          };
        }
      });
    },
    getElementPosition(atomicNumber) {
      let row = 0;
      let column = 0;

      if (atomicNumber <= 2) { // 1st row
        column = atomicNumber === 1 ? 0 : 17;
      }
      else if (atomicNumber <= 10) { // 2nd row
        row = 1;
        column = atomicNumber <= 4 ? atomicNumber - 3 : atomicNumber + 7;
      }
      else if (atomicNumber <= 18) { // 3rd row
        row = 2;
        column = atomicNumber <= 12 ? atomicNumber - 11 : atomicNumber - 1;
      }
      else if (atomicNumber <= 36) { // 4th row
        row = 3;
        column = atomicNumber - 19;
      }
      else if (atomicNumber <= 54) { // 5th row
        row = 4;
        column = atomicNumber - 37;
      }
      else if (atomicNumber >= 57 && atomicNumber <= 71) { // Lanthanides on 8th row
        row = 8;
        column = atomicNumber - 57 + 2;
      }
      else if (atomicNumber >= 89 && atomicNumber <= 103) { // Actinides on 9th
        row = 9;
        column = atomicNumber - 89 + 2;
      }
      else if (atomicNumber <= 56 || (atomicNumber >= 72 && atomicNumber <= 86)) { // 6th row
        row = 5;
        column = atomicNumber <= 56 ? atomicNumber - 55 : atomicNumber - 69;
      }
      else if (atomicNumber <= 88 || (atomicNumber >= 104 && atomicNumber <= 118)) { // 7th row
        row = 6;
        column = atomicNumber <= 88 ? atomicNumber - 87 : atomicNumber - 101;
      }

      return {row, column};
    },
    selectElement(element) {
      this.selectedElement = element;
      this.selectedCategory = element.category;

      const elementStore = useElementStore();
      elementStore.selectedElement = element;
      elementStore.saveToLocalStorage();
      this.$nextTick(() => {
        this.animateElectrons(this.electronConfig);
      });
    },
    getColorByCategory(category) {
      switch (category) {
        case 'alkali metal': return '#8a4545';
        case 'alkaline earth metal': return '#4D4341';
        case 'actinide': return '#3B2E48';
        case 'lanthanide': return '#453F60';
        case 'transition metal': return '#384357';
        case 'post-transition metal': return '#28514B';
        case 'metalloid': return '#29455D';
        case 'nonmetal': return '#2F325F';
        case 'halogen': return '#535482';
        case 'noble gas': return '#523C6D';
        case 'unknown': return '#ffffff';
        default: return '';
      }
    },
    parseElectronConfig(config) {
      let electronLayers = config.split(' ');
      let electronCount = {};

      electronLayers.forEach((layer, index) => {
        let matchResult = layer.match(/(\d)[spdfghijklmnoqrtuvwxyz](\d+)/);
        if (matchResult) {
          let [, shell, numElectrons] = matchResult;
          shell = Number(shell); // convertir la coquille en nombre
          numElectrons = Number(numElectrons); // convertir les électrons en nombre
          if (electronCount[shell]) {
            // si cette coquille existe déjà, ajouter les électrons
            for (let i = 0; i < numElectrons; i++) {
              electronCount[shell].push(i);
            }
          } else {
            // sinon, initialiser la coquille avec le nombre d'électrons
            electronCount[shell] = Array.from({ length: numElectrons }, (_, i) => i);
          }
        }
      });
      return electronCount;
    },
    animateElectrons(electronConfig) {
      Object.keys(electronConfig).forEach(layer => {
        const electronLayer = this.$refs[`electronLayer-${layer}`][0];

        gsap.to(electronLayer, {
          rotation: "+=360", // Add 360 degrees to the current rotation
          duration: 10, // Animation duration in seconds
          repeat: -1, // Repeat indefinitely
          ease: "linear", // Uniform movement
        });
      });
    },
    RoundNumber(number) {
      return Number(number.toFixed(3));
    },
    handleOutsideClick(event) {
      // Vérifiez si l'événement provient d'un élément du tableau
      if (!event.target.closest('.elements')) {
        this.selectedCategory = null;
      }
    },
  },
  beforeDestroy() {
    // Supprimez l'écouteur d'événement lorsque le composant est détruit pour éviter les fuites de mémoire
    window.removeEventListener('click', this.handleOutsideClick);
  },
}
</script>

<template>
<!--  <h1 class="title">Periodic Table</h1>-->
  <div v-if="loading">
    Loading...
  </div>
  <div v-else-if="!grid.length">
    No data available.
  </div>
  <div v-else-if="flatGrid.length" class="tableau">
    <div v-for="(element, i) in flatGrid.filter(e => e !== null)"
         :key="i" @click.prevent="selectElement(element)"
         class="elements"
         :class="{ selectedElement: selectedElement && selectedElement.number === element.number, notSelectedClass: selectedCategory && selectedCategory !== element.category, selectedClass: selectedCategory === element.category }"
         :style="{ gridColumn: `${element.column + 1} / span 1`, gridRow: `${element.row + 1} / span 1`, backgroundColor: `${getColorByCategory(element.category)}` }"
    >
      <p class="number">{{ element.number }}</p>
      <h3 class="symbol">{{ element.symbol }}</h3>
      <p class="name">{{ element.name }}</p>
    </div>

    <div class="information" v-if="selectedElement">
      <div class="info1">
        <h1><router-link :to="{ name: 'ElementDetails', params: { symbol: selectedElement.symbol }, props: { selectedElement: selectedElement } }">{{ selectedElement.number }} - {{ selectedElement.name }}</router-link></h1>
        <h2 :style="{
          color: `${getColorByCategory(selectedElement.category)}`, textTransform: 'capitalize',}">{{ selectedElement.category }}</h2>
      </div>
      <div class="info2">
        <h2>Phase</h2>
        <img v-if="selectedElement.phase === 'Solid'" class="element-etat" src="/solid.svg" alt="icon solid">
        <img v-if="selectedElement.phase === 'Liquid'" class="element-etat" src="/liquid.svg" alt="icon liquid">
        <img v-if="selectedElement.phase === 'Gas'" class="element-etat" src="/gas.svg" alt="icon gas">
      </div>
      <div class="info3">
        <h2>Atomic Mass</h2>
        <h1>{{ RoundNumber(selectedElement.atomic_mass)}}</h1>
      </div>
      <div class="info4">
        <h2>Density</h2>
        <h1>{{  RoundNumber(selectedElement.density) }}</h1>
      </div>

      <div class="atom">
        <div class="nucleon" :style="{ backgroundColor: `${getColorByCategory(selectedElement.category)}` }">
          <h2 style="z-index: 999"><router-link :to="`/element/${selectedElement.symbol}`" :element="selectedElement">{{ selectedElement.symbol }}</router-link></h2>
        </div>
        <div v-for="(electronCount, layer) in electronConfig"
             :key="layer"
             class="electron-layer"
             :style="{ width: `${70 + layer * 20}px`, height: `${70 + layer * 20}px`, border: `1px solid ${getColorByCategory(selectedElement.category)}` }"
             :ref="`electronLayer-${layer}`">
          <div v-for="(electron, index) in electronCount"
               :key="index"
               class="electron"
               :style="{ backgroundColor: `${getColorByCategory(selectedElement.category)}`, transform: `rotate(${360 * index / electronCount.length}deg) translate(${30 + layer * 10}px)` }">
          </div>
        </div>
      </div>
    </div>
    <div :class="{'tab-57-71': true, 'selectedClass': selectedCategory === 'lanthanide', 'notSelectedClass': selectedCategory && selectedCategory !== 'lanthanide'}">
      <p class="number">57-71</p>
      <p class="name">Lanthanides</p>
    </div>
    <div :class="{'tab-89-103': true, 'selectedClass': selectedCategory === 'actinide', 'notSelectedClass': selectedCategory && selectedCategory !== 'actinide'}">
      <p class="number">89-103</p>
      <p class="name">Actinides</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "src/assets/atom.scss";
$width-height-cell: 70px;
//.title{
//  grid-column: 1/2;
//  grid-row: 1/2;
//  display: flex;
//  justify-content: center;
//  align-items: center;
//  font-size: 2.5rem;
//}

.tableau {
  grid-column: 1/2;
  grid-row: 1/3;
  display: grid;
  grid-template-rows: repeat(7, 1fr) 25px repeat(2, 1fr);
  grid-template-columns: repeat(18, 1fr);
  gap: 1px;
  width: fit-content;
  height: fit-content;
  margin: auto;

  .selectedElement {
    transition: 0.2s ease-in-out ;
    color: white !important;
  }

  .selectedClass {
    transition: 0.2s ease-in-out ;
    filter: drop-shadow(2px 4px 6px black);
    opacity: 1 !important;
  }

  .notSelectedClass {
    transition: 0.2s ease-in-out ;
    opacity: 0.5;
  }

  .elements{
    //width: $width-height-cell;
    //height:  $width-height-cell;
    display: grid;
    grid-template-rows: 20px 1fr 20px;
    grid-template-columns: 25px 1fr;
    text-decoration: none;
    color: #919EAB;
    cursor: pointer;
    transition: 0.2s ease-in-out;
    &:hover{
      filter: drop-shadow(2px 4px 6px black);
    }

    .number {
      grid-column: 1/2;
      grid-row: 1/2;
      margin: 5px 0 0 5px;
      font-size: 0.7rem;
      font-weight: bold;
    }

    .symbol {
      grid-column: 1/3;
      grid-row: 2/3;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .name {
      grid-column: 1/3;
      grid-row: 3/4;
      font-size: 0.7rem;
      margin: 0 4px;
      text-align: center;
    }

  }
  .information{
    grid-column: 3/13;
    grid-row: 1/4;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr 1fr 2fr;
    text-decoration: none;

    .info1{
      grid-column: 1/4;
      grid-row: 1/2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 0 50px;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .info2{
      grid-column: 1/2;
      grid-row: 2/3;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: center;
      .element-etat{
        width: 50px;
        height: 50px;
      }
    }

    .info3{
      grid-column: 2/3;
      grid-row: 2/3;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: center;
    }

    .info4{
      grid-column: 3/4;
      grid-row: 2/3;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: center;
    }
  }
  .tab-57-71{
    grid-column: 3/4;
    grid-row: 6/7;
    //width: $width-height-cell;
    //height: $width-height-cell;
    background-color: #453F60;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    font-weight: bold;
  }
  .tab-89-103{
    grid-column: 3/4;
    grid-row: 7/8;
    //width: $width-height-cell;
    //height: $width-height-cell;
    background-color: #3B2E48;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    font-weight: bold;
  }
  .categories{
    grid-column: 1/4;
    grid-row: 9/11;
    padding: 0 10px 0 0;
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: 1fr;
    div{
      display: flex;
      font-size: 16px;
      writing-mode: vertical-rl;
      cursor: pointer;
    }

  }
}

@media screen and (max-width: 1920px){
  .elements{

    .number {
      margin: 5px 0 0 5px;
      font-size: 0.9rem;
      font-weight: bold;
    }

    .symbol {
      font-size: 1.7rem;
      font-weight: bold;
    }

    .name {
      font-size: 0.9rem;
      margin: 0 4px;
      text-align: center;
    }

  }
}
</style>