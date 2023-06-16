<script>
import { useElementStore } from '@/stores/index.js';

export default {
  name: 'PeriodicTableView',
  data() {
    return {
      grid: [],
      selectedElement: null,
    }
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
  async mounted() {
    const elementStore = useElementStore();
    await elementStore.fetchElements();
    this.createGrid(elementStore.elements);
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

      console.log('Grid:', this.grid);
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
      this.selectedElement = element; // Sélectionner un élément
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
      console.log(electronLayers);
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
    }
  }
}
</script>

<template>
  <h1 class="title">Periodic Table</h1>
  <div v-if="loading">
    Chargement en cours...
  </div>
  <div v-else-if="!grid.length">
    Pas de données.
  </div>
  <div v-else-if="flatGrid.length" class="tableau">
    <div v-for="(element, i) in flatGrid.filter(e => e !== null)"
       :key="i" @click.prevent="selectElement(element)"
       class="element"
       :style="{gridColumn: `${element.column+1} / span 1`,gridRow: `${element.row+1} / span 1`, backgroundColor:`${getColorByCategory(element.category)}`}"
    >
      <p class="number">{{ element.number }}</p>
      <h3 class="symbol">{{ element.symbol }}</h3>
      <p class="name">{{ element.name }}</p>
    </div>
    <div class="information" v-if="selectedElement">
      <div class="info1">
        <h1><router-link :to="`/element/${selectedElement.symbol}`">{{ selectedElement.number }} - {{ selectedElement.name }}</router-link></h1>
        <h2 :style="{color:`${getColorByCategory(selectedElement.category)}`}">{{ selectedElement.category }}</h2>
      </div>
      <div class="info2">
        <p>phase</p>
      </div>
      <div class="info3">
        <p>Atomic Mass</p>
        <h2>{{ selectedElement.atomic_mass }}</h2>
      </div>
      <div class="info4">
        <p>Density</p>
        <h2>{{ selectedElement.density }}</h2>
      </div>

      <div class="atom">
        <div class="nucleon" :style="{backgroundColor:`${getColorByCategory(selectedElement.category)}`}">
          <h2>{{selectedElement.symbol}}</h2>
        </div>
        <div v-for="(electronCount, layer) in electronConfig" :key="layer" class="electron-layer" :style="{width: `${70 + layer * 20}px`, height: `${70 + layer * 20}px`, border:`1px solid ${getColorByCategory(selectedElement.category)}`}">
          <div v-for="(electron, index) in electronCount" :key="index" class="electron" :style="{backgroundColor:`${getColorByCategory(selectedElement.category)}`, transform: `rotate(${360 * index / electronCount.length}deg) translate(${30 + layer * 10}px)`}"/>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "src/assets/atom.scss";
.title{
  text-align: center;
  margin: 20px 0;
  font-size: 2rem;
  color: #919EAB;
}

.tableau {
  display: grid;
  grid-template-rows: repeat(7, 1fr) 25px repeat(2, 1fr);
  grid-template-columns: repeat(18, 1fr);
  gap: 1px;

  .element{
    width: 80px;
    height: 80px;
    display: grid;
    grid-template-rows: 20px 1fr 20px;
    grid-template-columns: 20px 1fr;
    text-decoration: none;
    color: #919EAB;
    cursor: pointer;
    z-index: 2;
    &:hover{
      filter: drop-shadow(2px 4px 6px black);
    }

    .number {
      grid-column: 1/2;
      grid-row: 1/2;
      margin: 5px 0 0 5px;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .symbol {
      grid-column: 1/3;
      grid-row: 2/3;
      font-size: 1.7rem;
      font-weight: bold;
    }

    .name {
      grid-column: 1/3;
      grid-row: 3/4;
      font-size: 0.8rem;
      margin: 0 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
}

</style>