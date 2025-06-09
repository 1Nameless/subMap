<template>
  <div class="container">
    <h1 class="header">U-Bahn Map Nürnberg</h1>
    
    <div class="test">
      <LeafletMap class="mapContainer" ref="myMap"/>
    </div>
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

<style>
body{
  background-color: rgb(238, 236, 232);
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  flex-flow: column;
  align-items: stretch;
  position: absolute;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

.header{
  flex: 0 1 auto;
}

.mapContainer{
  position: relative;
  height: 95%;
  margin-top: 20px;
  margin-left: 2%;
  width: 96%;
  flex: 1 1 auto;
}

.test{
  flex: 1 1 auto;
  height: 100%
}

</style>