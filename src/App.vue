<template>
  <div class="container">
    <h1>My Vue Counter</h1>
    <button @click="increment">Count is: {{ count }}</button>
    <button @click="console.log('waff'); $refs.myMap.test()">Waff!</button>
    <LeafletMap ref="myMap"/>
  </div>
</template>

<script>
import useCounter from './composables/useCounter.js'
import LeafletMap from './components/leafletMap.vue'

export default {
  components: { LeafletMap },
  setup() {
    const { count, increment, double } = useCounter()
    const setMarker = LeafletMap.setMarker
    return { count, increment, double }
  }
}
</script>