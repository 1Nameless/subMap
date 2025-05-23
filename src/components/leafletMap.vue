<template>
  <div id="map" ref="mapContainer" class="map"></div>
</template>

<script>
import { onMounted, ref } from 'vue'
import L from 'leaflet'



export default {
  name: 'LeafletMap',
  setup() {
    const mapContainer = ref(0)

    let map

    function setMarker(latitude, longitude, name) {
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup(name)
            .openPopup()
    }

        
    onMounted(() => {
    
        map = L.map(mapContainer.value).setView([49.45165265689441, 11.076346371026073], 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map)


        getAllStops()

        updateTrainLocations()

        
        timer = setInterval(() => {
            updateTrainLocations()
        }, 1000)
        

    })

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
                        
                    })
                })

        }

    let trainMarkers = []

    function updateTrainLocations(){

        //clear trains
        trainMarkers.filter((e) => {
            e !== null
        } )
        console.log(trainMarkers)

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

                                if(typeof stop.AbfahrtszeitIst === 'undefined' || currenttime <= stop.AbfahrtszeitIst){

                                    if(i == 0 || typeof stop.AnkunftszeitIst === 'undefined'){
                                        //erster stop
                                        return {
                                            stations: stop,
                                            distance: 0,
                                            line: route.Linienname,
                                            fahrtnummer: fahrtnummer
                                        }

                                    }
                                    else if(currenttime >= stop.AnkunftszeitIst){
                                        //an dieser Station
                                        return {
                                            stations: stop,
                                            distance: 0,
                                            line: route.Linienname,
                                            fahrtnummer: fahrtnummer
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
                                            line: route.Linienname,
                                            fahrtnummer: fahrtnummer
                                        }

                                    }
                                    
                                }
                                
                                }

                                console.log("HOW???")
                                console.log(route)


                            })
                            .then(trainLocation => {

                                //remove previous marker from same train

                                for (let i = 0; i < trainMarkers.length; i++) {
                                    if(typeof trainMarkers[i] !== 'undefined' && trainMarkers[i].fahrtnummer === trainLocation.fahrtnummer){
                                        map.removeLayer(trainMarkers[i].marker);
                                        delete trainMarkers[i]
                                    }
                                    
                                }

                                

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

                                if(trainLocation.distance === 0){
                                    // at station

                                    let c = L.circle([trainLocation.stations.Latitude, trainLocation.stations.Longitude], {radius: 200, color: color})
                                        .bindPopup(trainLocation.line)

                                    c.addTo(map)
                                    
                                    trainMarkers.push({
                                        fahrtnummer: trainLocation.fahrtnummer,
                                        marker: c
                                    })

                                }
                                else{
                                    // between two stations
                                    let latitudeDifference = trainLocation.stations[0].Latitude - trainLocation.stations[1].Latitude
                                    let latitude = trainLocation.stations[1].Latitude + latitudeDifference * trainLocation.distance


                                    let longitudeDifference = trainLocation.stations[0].Longitude - trainLocation.stations[1].Longitude
                                    let longitude = trainLocation.stations[1].Longitude + longitudeDifference * trainLocation.distance

                                    let c = L.circle([latitude, longitude], {radius: 200, color: color})
                                        .bindPopup(trainLocation.line)

                                    
                                    c.addTo(map)
                                    
                                    trainMarkers.push({
                                        fahrtnummer: trainLocation.fahrtnummer,
                                        marker: c
                                    })

                                }

                            })
                    });

                    
                })

        }

    return {
      mapContainer,
      setMarker,
      updateTrainLocations
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
