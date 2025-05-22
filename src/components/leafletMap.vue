<template>
  <div id="map" ref="mapContainer" class="map"></div>
</template>

<script>
import { onMounted, ref } from 'vue'
import L from 'leaflet'



export default {
  name: 'LeafletMap',
  setup() {
    const mapContainer = ref(null)

    

    onMounted(() => {
    
        const map = L.map(mapContainer.value).setView([49.45165265689441, 11.076346371026073], 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        L.marker([49.45165265689441, 11.076346371026073]).addTo(map)
            .bindPopup('Nürnberg')
            .openPopup()

        getAllStops()

        getAllTrains()



        function getAllStops(){
            //get haltestelle by distance (0 0 appears to be everything)
            //const url = "https://start.vag.de/dm/api/v1/haltestellen/UBahn/location?lon=0&lat=0&radius=100"

            //get Haltestelle by name (% as wildcard for everything) ("%"" gets encoded as "%25")
            const url = "https://start.vag.de/dm/api/v1/haltestellen/VAG?name=%25"

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    return data["Haltestellen"]
                })
                .then(stops => {
                    let filteredStops = []

                    //filter stops for ubahn
                    stops.forEach(element => {
                        

                        //check if Producte exists, incase stop is depricated
                        if(typeof element.Produkte === 'undefined'){
                            return
                        }

                        if(element.Produkte.includes("UBahn")){
                            filteredStops.push(element)
                        }
                    });
                    return filteredStops
                })
                .then(subwayStops => {
                    
                    subwayStops.forEach(stop =>{
                        
                        L.marker([stop.Latitude, stop.Longitude]).addTo(map)
                            .bindPopup(stop.Haltestellenname + "\n" + stop.VAGKennung)
                            .openPopup()
                        
                    })
                })

        }

        function getAllTrains(){
            const url = "https://start.vag.de/dm/api/v1/fahrten/UBahn?timespan=1"

            let currenttime = null

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json()
                })
                .then(data => {
                    currenttime = data.Metadata.Timestamp
                    console.log(currenttime)
                    return data.Fahrten
                })
                .then(fahrten => {

                    fahrten.forEach(e => {
                        const fahrtnummer = e.Fahrtnummer
                        fetch("https://start.vag.de/dm/api/v1/fahrten/UBahn/" + fahrtnummer)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                
                                return response.json()
                            })
                            .then(route => {
                                for (let i = 0; i < route.Fahrtverlauf.length; i++) {
                                const stop = route.Fahrtverlauf[i];


                                if(currenttime <= stop.AbfahrtszeitIst){

                                    if(i == 0 || typeof stop.AnkunftszeitIst === 'undefined'){
                                        //erster stop
                                        return {
                                            stations: stop,
                                            distance: 0,
                                            line: route.Linienname
                                        }

                                    }
                                    else if(currenttime >= stop.AnkunftszeitIst){
                                        //an dieser Station
                                        return {
                                            stations: stop,
                                            distance: 0,
                                            line: route.Linienname
                                        }
                                    }
                                    else{
                                        //zwischen dieser und letzter Station


                                        let stations = [
                                            stop,
                                            route.Fahrtverlauf[i-1]
                                        ]

                                        let lastDeparture = new Date(route.Fahrtverlauf[i-1].AbfahrtszeitIst).getTime()

                                        let c = new Date(currenttime).getTime()
                                        let ankunft = new Date(stop.AnkunftszeitIst).getTime()

                                        return {
                                            stations: stations,
                                            distance: (c - lastDeparture) / (ankunft - lastDeparture),
                                            line: route.Linienname
                                        }

                                    }
                                    
                                }
                                
                                }
                            })
                            .then(trainLocation => {
                                console.log(trainLocation)

                                if(trainLocation.distance === 0){
                                    // at station
                                    L.circle([trainLocation.stations.Latitude, trainLocation.stations.Longitude], {radius: 200, color: "#3388ff"}).addTo(map);
                                }
                                else{
                                    // between two stations
                                    let latitude = (trainLocation.stations[0].Latitude + trainLocation.stations[1].Latitude) / 2
                                    let longitude = (trainLocation.stations[0].Longitude + trainLocation.stations[1].Longitude) / 2


                                    let color = "#000000"
                                    if(trainLocation.line === "U1"){
                                        color = "#0269b6"
                                    }
                                    else if(trainLocation.line === "U2"){
                                        color = "#e30713"
                                    }
                                    else if(trainLocation.line === "U3"){
                                        color = "#32b7bc"
                                    }

                                    L.circle([latitude, longitude], {radius: 200, color: color}).addTo(map);
                                }

                            })
                    });

                    
                })

        }

    })

    return {
      mapContainer
    }
  }
}








</script>

<style scoped>
.map {
  width: 2000px;
  height: 1200px;
  margin-top: 20px;
  margin-left: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
