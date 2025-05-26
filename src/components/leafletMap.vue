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

        

        
        setInterval(() => {
            updateTrainLocations()
        }, 1000 * 5)


        setInterval(() => {
            drawTrains()
        }, 1000 / 30)
        

    })

    function test(){
        updateTrainLocations()
        drawTrains()
    }

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

                        let radius = 0.001

                        let bounds = [[stop.Latitude - radius * 0.6, stop.Longitude - radius], [stop.Latitude + radius * 0.6, stop.Longitude + radius]]

                        L.rectangle(bounds, {color: "#666666", weight: 1}).addTo(map)
                            .bindPopup(stop.Haltestellenname + "\n" + stop.VAGKennung)

                        //L.marker([stop.Latitude, stop.Longitude]).addTo(map)
                        //    .bindPopup(stop.Haltestellenname + "\n" + stop.VAGKennung)
                        
                    })
                })

        }

    let trainMarkers = []


    /*
        fahrtnummer
        stations
        line
        direction
        marker
    */
    let trains = []

    function drawTrains(){


        let currenttime = new Date().getTime()
        



        trains.forEach(train => {

            let distance = 0
            if(train.distance !== 0){
                let lastDeparture = new Date(train.stations[1].AbfahrtszeitIst).getTime()
                let arrival = new Date(train.stations[0].AnkunftszeitIst).getTime()
                distance = (currenttime - lastDeparture) / (arrival - lastDeparture)
            }
            if(distance > 1){
                distance = 1
            }
            

            let color = "#000000"
            if (train.line === "U1") {
                color = "#0269b6"
            }
            else if (train.line === "U2") {
                color = "#e30713"
            }
            else if (train.line === "U3") {
                color = "#32b7bc"
            }
            


            let latitude = null
            let longitude = null


            if(distance === 0){
                // at station

                latitude = train.stations.Latitude
                longitude = train.stations.Longitude
            }
            else{
                // between two stations
                let latitudeDifference = train.stations[0].Latitude - train.stations[1].Latitude
                latitude = train.stations[1].Latitude + latitudeDifference * distance


                let longitudeDifference = train.stations[0].Longitude - train.stations[1].Longitude
                longitude = train.stations[1].Longitude + longitudeDifference * distance
            }


            if(typeof train.marker !== 'undefined' && train.marker !== null){
                // move marker from existing train
                train.marker.setLatLng([latitude, longitude])
            }
            else{
                // create new train
                let c = L.circle([latitude, longitude], { radius: 200, color: color })
                        .bindPopup(train.line + " richtung: " + train.direction)

                c.addTo(map)

                train.marker = c
            }

        });

    }


    function updateTrainLocations(){

        //clear trains
        //trainMarkers.filter((e) => { e !== null } )

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
                    return data.Fahrten
                })
                .then(fahrten => {

                    let oldTrainNumbers = fahrten.map(e => e.Fahrtnummer)

                    for (let i = 0; i < trains.length; i++) {
                        if(oldTrainNumbers.indexOf(trains[i].fahrtnummer) === -1){
                            console.log("removing train")
                            console.log(trains[i])
                            map.removeLayer(trains[i].marker)
                            trains.splice(i, 1)
                            i--;
                        }
                        
                    }


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
                                if(route.Richtungstext === "Bärenschanze"){
                                    console.log("BÄRENSCHANZE")
                                    console.log(route)
                                }

                                for (let i = 0; i < route.Fahrtverlauf.length; i++) {
                                const stop = route.Fahrtverlauf[i];

                                if(typeof stop.AbfahrtszeitIst === 'undefined' || currenttime <= stop.AbfahrtszeitIst){

                                    if(i == 0 || typeof stop.AnkunftszeitIst === 'undefined'){
                                        //erster stop
                                        return {
                                            stations: stop,
                                            distance: 0,
                                            line: route.Linienname,
                                            fahrtnummer: fahrtnummer,
                                            richtung: route.Richtungstext
                                        }

                                    }
                                    else if(currenttime >= stop.AnkunftszeitIst){
                                        //an dieser Station
                                        return {
                                            stations: stop,
                                            distance: 0,
                                            line: route.Linienname,
                                            fahrtnummer: fahrtnummer,
                                            richtung: route.Richtungstext
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
                                            fahrtnummer: fahrtnummer,
                                            richtung: route.Richtungstext
                                        }

                                    }
                                    
                                }
                                
                                }

                                console.log("HOW???")
                                console.log(route)


                            })
                            .then(trainLocation => {

                                let oldMarker = null

                                // remove train if already exists

                                let oldTrain = trains.filter(t => {
                                    
                                    return t.fahrtnummer === trainLocation.fahrtnummer
                                })

                                

                                if(typeof oldTrain[0] !== 'undefined'){
                                    oldMarker = oldTrain[0].marker
                                }

                                if(typeof oldMarker !== 'undefined'){
                                    //map.removeLayer(oldMarker)
                                }
                                

                                if(typeof oldTrain[0] !== 'undefined') {
                                     const index = trains.map(e => e.fahrtnummer).indexOf(oldTrain[0].fahrtnummer);
                                    if (index > -1) {
                                        trains.splice(index, 1)
                                    }

                                }


                                // add new train

                                trains.push({
                                    fahrtnummer: trainLocation.fahrtnummer,
                                    stations: trainLocation.stations,
                                    line: trainLocation.line,
                                    direction: trainLocation.richtung,
                                    marker: oldMarker,
                                    distance: trainLocation.distance
                                })


                            })
                    });

                    
                })

        }

    return {
      mapContainer,
      setMarker,
      updateTrainLocations,
      test
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
