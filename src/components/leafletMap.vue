<template>
    <div class="mapContainerInner">
        <div id="map" ref="mapContainer" class="map"></div>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import Transport from '../entity/transport'
import '../external/leaflet-corridor'
import TransportMap from '../entity/transportMap'
import Station from '../entity/station'
import TransportStop from '../entity/transportStop.js'


export default {
    name: 'LeafletMap',
    setup() {
        const mapContainer = ref(0)

        let map;
        let transportMap;


        let trainPane;
        let busStationPane;
        let tramStationPane;
        let subwayStationPane;
        let routePane;
        let popupPane;

        /**
         * busNetwork - Layergroup containing busses and busStations
         * buses - Layergroup of all bus vehicles
         * busStations - Layergroup of all bus stations
         */
        let buses = L.layerGroup();
        let busStations = L.layerGroup();
        let busNetwork = L.layerGroup([buses, busStations]);


        /**
         * tramNetwork - Layergroup containing trams and tramStations
         * trams - Layergroup of all tram vehicles
         * tramStations - Layergroup of all tram stations
         */
        let trams = L.layerGroup();
        let tramStations = L.layerGroup();
        let tramNetwork = L.layerGroup([trams, tramStations]);


        /**
         * subwayNetwork - Layergroup containing subways and subwayStations
         * subways - Layergroup of all subway vehicles
         * subwayStations - Layergroup of all subway stations
         */
        let subways = L.layerGroup();
        let subwayStations = L.layerGroup();
        let subwayNetwork = L.layerGroup([subways, subwayStations]);



        function setMarker(latitude, longitude, name) {
            L.marker([latitude, longitude]).addTo(map)
                .bindPopup(name)
                .openPopup()
        }


        onMounted(() => {

            map = L.map(mapContainer.value).setView([49.45165265689441, 11.076346371026073], 13)

            let basicMap = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

            let watercolorMap = 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.jpg'

            let basicDarkMap = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'

            let basicLightMap = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png'

            let sateliteMap = 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg'

            let humanitarianMap = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'


            let baseMap = L.tileLayer(humanitarianMap, {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);


            //instantiate all Panes

            trainPane = map.createPane('trainPane');
            routePane = map.createPane('routePane');
            busStationPane = map.createPane('busStationPane');
            tramStationPane = map.createPane('tramStationPane');
            subwayStationPane = map.createPane('subwayStationPane');
            popupPane = map.createPane('popupPane'); //popupPane already exists by default

            busNetwork.addTo(map);
            tramNetwork.addTo(map);
            subwayNetwork.addTo(map);


            let transportOverlay = {
                "Bus": busNetwork,
                "Tram": tramNetwork,
                "U-Bahn": subwayNetwork
            }


            let layerControl = L.control.layers({ "humanMap": baseMap }, transportOverlay, { hideSingleBase: true, collapsed: false }).addTo(map);

            trainPane.style.zIndex = 1100;
            busStationPane.style.zIndex = 1200;
            tramStationPane.style.zIndex = 1210;
            subwayStationPane.style.zIndex = 1220;
            routePane.style.zIndex = 1000;
            popupPane.style.zIndex = 2000;

            //getAllStops()

            transportMap = new TransportMap(map, busStations, tramStations, subwayStations);
            transportMap.loadStations();


            setInterval(() => {
                updateTramLocations('UBahn');
                updateTramLocations('Tram');
                updateTramLocations('Bus');
            }, 1000 * 5)


            setInterval(() => {
                //drawTrains()
                drawAllTrains();
            }, 1000 / 30)


        })


        let busVisible = true;


        function toggleBus() {

            busVisible = !busVisible;
        }


        /*
            transportNumber
            stations
            line
            direction
            marker
        */
        let trains = []


        function getTrainMarker(train) {
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
            let c = L.circle([0, 0], { radius: 200, color: color, pane: 'trainPane' })
                .bindPopup(train.line + " richtung: " + train.direction,
                    {
                        autoPan: false
                    }
                )

            let stations = train.allStations;
            var latlngs = [];

            stations.forEach(station => {
                latlngs.push(transportMap.getLatLngForStation_VGN(station.VGN_StationName));
            });

            //let path = L.polyline(latlngs, {color: color, opacity: 0, weight: 20, fill: false, fillColor: color, interactive: false}).addTo(map);
            let path = L.corridor(latlngs, { color: color, opacity: 0, corridor: 30, fill: false, fillColor: color, interactive: false, pane: 'routePane' }).addTo(map);
            c.on('popupopen', function (e) {
                path.setStyle({ opacity: 1 })
            });

            c.on('popupclose', function (e) {
                path.setStyle({ opacity: 0 })
            });

            return c;
        }

        function getTramMarker(tram) {
            let color = "#FF9900"

            let c = L.circle([0, 0], { radius: 150, color: color, pane: 'trainPane' })
                .bindPopup(tram.line + " richtung: " + tram.direction,
                    {
                        autoPan: false
                    }
                )

            let stations = tram.allStations;
            var latlngs = [];

            stations.forEach(station => {
                latlngs.push(transportMap.getLatLngForStation_VGN(station.VGN_StationName));
            });

            //let path = L.polyline(latlngs, {color: color, opacity: 0, weight: 20, fill: false, fillColor: color, interactive: false}).addTo(map);
            let path = L.corridor(latlngs, { color: color, opacity: 0, corridor: 20, fill: false, fillColor: color, interactive: false, pane: 'routePane' }).addTo(map);
            c.on('popupopen', function (e) {
                path.setStyle({ opacity: 1 })
            });

            c.on('popupclose', function (e) {
                path.setStyle({ opacity: 0 })
            });

            return c;
        }

        function getBusMarker(bus) {
            let color = "#99FF99"

            let c = L.circle([0, 0], { radius: 100, color: color, pane: 'trainPane' })
                .bindPopup(bus.line + " richtung: " + bus.direction,
                    {
                        autoPan: false
                    }
                )

            let stations = bus.allStations;
            var latlngs = [];

            stations.forEach(station => {
                let cords = transportMap.getLatLngForStation_VGN(station.VGN_StationName);
                if (typeof cords !== 'undefined') {
                    latlngs.push(cords);
                }
            });

            //let path = L.polyline(latlngs, {color: color, opacity: 0, weight: 20, fill: false, fillColor: color, interactive: false}).addTo(map);
            let path = L.corridor(latlngs, { color: color, opacity: 0, corridor: 15, fill: false, fillColor: color, interactive: false, pane: 'routePane' }).addTo(map);
            c.on('popupopen', function (e) {
                path.setStyle({ opacity: 1 });
            });

            c.on('popupclose', function (e) {
                path.setStyle({ opacity: 0 })
            });

            return c;
        }

        function drawAllTrains() {

            trains.forEach(train => {
                if (typeof train.marker === 'undefined' || train.marker === null) {

                    if (train.transportMode === 'UBahn') {
                        let marker = getTrainMarker(train);
                        marker.addTo(subways);
                        train.marker = marker;

                    }
                    else if (train.transportMode === 'Tram') {
                        let marker = getTramMarker(train);
                        marker.addTo(trams);
                        train.marker = marker;
                    }
                    else if (train.transportMode === 'Bus') {
                        let marker = getBusMarker(train);
                        marker.addTo(buses);
                        train.marker = marker;
                    }

                }

                if (train.transportMode === "Bus" && busVisible === true) {
                    //train.marker.setStyle({ opacity: 1, fillOpacity: 0.2, interactive: false })
                    train.drawOnMap();
                }
                else if (train.transportMode === "Tram") {
                    //train.marker.setStyle({ opacity: 1, fillOpacity: 0.2, interactive: true })
                    train.drawOnMap();
                }
                else if (train.transportMode === "UBahn") {
                    //train.marker.setStyle({ opacity: 1, fillOpacity: 0.2, interactive: true })
                    train.drawOnMap();
                }
                else {
                    //train.marker.setStyle({ opacity: 0, fillOpacity: 0, interactive: false});
                    //train.marker.redraw();
                    //train.marker.closePopup();
                }

            })
        }


        function updateTramLocations(transportMode) {

            const url = "https://start.vag.de/dm/api/v1/fahrten/" + transportMode + "?timespan=1"

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    return data.Fahrten;
                })
                .then(fahrten => {

                    let newTramNumbers = fahrten.map(e => e.Fahrtnummer)

                    for (let i = 0; i < trains.length; i++) {
                        if (trains[i].transportMode === transportMode && newTramNumbers.indexOf(trains[i].transportNumber) === -1) {
                            map.removeLayer(trains[i].marker)
                            trains.splice(i, 1)
                            i--;
                        }
                    }

                    fahrten.forEach(e => {
                        fetch("https://start.vag.de/dm/api/v1/fahrten/" + transportMode + '/' + e.Fahrtnummer)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }

                                return response.json();
                            })
                            .then(ride => {


                                let oldTrain = trains.filter(t => {
                                    return t.transportNumber === ride.Fahrtnummer;
                                })[0]

                                if (typeof oldTrain === 'undefined') {

                                    // check if all stations are already loaded and if not fix them in

                                    ride.Fahrtverlauf.forEach(station => {
                                        if (typeof transportMap.getStationVgn(station.VGNKennung) === 'undefined') {
                                            transportMap.addStation(new Station(station.Haltestellenname, station.VAGKennung, station.VGNKennung, station.Longitude, station.Latitude, 'Bus'))
                                        }
                                    })


                                    oldTrain = new Transport(ride.Fahrtnummer, ride.Linienname, ride.Richtungstext, null, null, transportMap, transportMode);
                                    trains.push(oldTrain);
                                }


                                let stations = [];

                                ride.Fahrtverlauf.forEach(station => {
                                    stations.push(new TransportStop().fromJson(station));
                                })

                                oldTrain.allStations = stations;
                            })

                    })


                })

        }



        return {
            mapContainer,
            setMarker,
            toggleBus
        }
    }
}
</script>

<style scoped>
.mapContainerInner {
    position: relative;
    height: 95%;
    width: 95%;
    flex: 1 1 auto;
    top: 0;
    bottom: 0;
    margin-left: 20px;
}

.map {
    border: 1px solid #ccc;
    border-radius: 8px;
}

.buttons {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1000;
}
</style>
