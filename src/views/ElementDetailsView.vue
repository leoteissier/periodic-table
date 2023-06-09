<template>
  <div>
    <h1>{{ element.name }}</h1>
    <p>{{ element.symbol }}</p>
    <p>{{ element.atomicNumber }}</p>
  </div>
</template>

<script>
import { useElementStore } from '@/stores'

export default {
  name: 'ElementDetailsView',
  props: {
    symbol: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { elements } = useElementStore()
    const element = elements.find(e => e.symbol === props.symbol)

    return { element }
  }
}
</script>
