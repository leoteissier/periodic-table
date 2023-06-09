<script>
import { useElementStore } from '@/stores/index.js'

export default {
  name: 'PeriodicTableView',
  setup() {
    const store = useElementStore()
    store.fetchElements()

    return { grid: store.grid }
  }
}
</script>

<template>
  <div v-if="grid.length">
    <div v-for="(row, i) in grid" :key="i">
      <div v-for="(element, j) in row" :key="`${i}-${j}`" v-if="element">
        <router-link :to="`/element/${element.symbol}`">
          {{ element.symbol }}
        </router-link>
      </div>
    </div>
  </div>
  <div v-else>
    Chargement en cours...
  </div>
</template>


<style scoped>

</style>