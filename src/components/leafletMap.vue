<template>
  <div id="map" ref="mapContainer" class="map"></div>
</template>

<script>
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import Transport from '../entity/transport'
import '../external/leaflet-corridor'
import TransportMap from '../entity/transportMap'


export default {
  name: 'LeafletMap',
  setup() {
    const mapContainer = ref(0)

    let map;
    let transportMap;


    let trainPane;
    let stationPane;
    let routePane;
    let popupPane;

    function setMarker(latitude, longitude, name) {
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup(name)
            .openPopup()
    }

        
    onMounted(() => {
    
        map = L.map(mapContainer.value).setView([49.45165265689441, 11.076346371026073], 13)

        let basicMap = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

        let watercolorMap = 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg'

        let basicDarkMap = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'

        let basicLightMap = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png'

        let sateliteMap = 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg'

        let humanitarianMap = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'


        L.tileLayer(humanitarianMap, {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map)


        //instantiate all Panes

        trainPane = map.createPane('trainPane');
        routePane = map.createPane('routePane');
        stationPane = map.createPane('stationPane');
        popupPane = map.createPane('popupPane'); //popupPane already exists by default

        trainPane.style.zIndex = 1100;
        stationPane.style.zIndex = 1200;
        routePane.style.zIndex = 1000;
        popupPane.style.zIndex = 2000;

        //getAllStops()

        transportMap = new TransportMap(map);
        transportMap.loadStations();


        updateTrainLocations()


    

        
        setInterval(() => {
            updateTrainLocations()
        }, 1000 * 5)


        setInterval(() => {
            //drawTrains()
            drawAllTrains();
        }, 1000 / 30)
        

    })


    /*
        transportNumber
        stations
        line
        direction
        marker
    */
    let trains = []

    function drawAllTrains(){

        trains.forEach(train => {
            if(typeof train.marker === 'undefined' || train.marker === null){

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


                // create new train
                let c = L.circle([0, 0], { radius: 200, color: color, pane: 'trainPane'})
                    .bindPopup(train.line + " richtung: " + train.direction,
                        {
                            autoPan: false
                        }
                    )

                let stations = train.allStations;
                var latlngs = [];

                stations.forEach(station => {
                    latlngs.push([station.Latitude, station.Longitude])
                });

                //let path = L.polyline(latlngs, {color: color, opacity: 0, weight: 20, fill: false, fillColor: color, interactive: false}).addTo(map);
                let path = L.corridor(latlngs, {color: color, opacity: 0, corridor: 30, fill: false, fillColor: color, interactive: false, pane: 'routePane'}).addTo(map);
                c.on('popupopen', function (e) {
                    path.setStyle({opacity: 1})
                });

                c.on('popupclose', function (e) {
                    path.setStyle({opacity: 0})
                });

                c.addTo(map)
                train.marker = c;
            }
            train.drawOnMap();
        })
    }


    function updateTrainLocations(){

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
                        if(oldTrainNumbers.indexOf(trains[i].transportNumber) === -1){
                            console.log("removing train")
                            console.log(trains[i].transportNumber)
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

                                return {
                                    line: route.Linienname,
                                    fahrtnummer: fahrtnummer,
                                    richtung: route.Richtungstext,
                                    allStations: route.Fahrtverlauf
                                }

                            })
                            .then(trainLocation => {

                                let oldMarker = null

                                // remove train if already exists

                                let oldTrain = trains.filter(t => {
                                    
                                    return t.transportNumber === trainLocation.fahrtnummer
                                })

                                

                                if(typeof oldTrain[0] !== 'undefined'){
                                    oldMarker = oldTrain[0].marker
                                }

                                if(typeof oldMarker !== 'undefined'){
                                    //map.removeLayer(oldMarker)
                                }
                                

                                if(typeof oldTrain[0] !== 'undefined') {
                                     const index = trains.map(e => e.transportNumber).indexOf(oldTrain[0].transportNumber);
                                    if (index > -1) {
                                        trains.splice(index, 1)
                                    }

                                }


                                // add new train

                                let newTrain = new Transport(
                                    trainLocation.fahrtnummer,
                                    trainLocation.line,
                                    trainLocation.richtung,
                                    oldMarker,
                                    trainLocation.allStations,
                                    transportMap,
                                    'UBahn'
                                )

                                trains.push(newTrain)


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
  position: relative;
  top: 0;
  bottom: 0;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
