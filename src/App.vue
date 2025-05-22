<template>
  <div class="container">
    <h1>My Vue Counter</h1>
    <button @click="increment">Count is: {{ count }}</button>
    <LeafletMap />
  </div>
</template>

<script>
import useCounter from './composables/useCounter.js'
import LeafletMap from './components/LeafletMap.vue'

export default {
  components: { LeafletMap },
  setup() {
    const { count, increment, double } = useCounter()
    return { count, increment, double }
  }
}
</script>