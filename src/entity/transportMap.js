
import { Layer } from "leaflet";
import Station from "./station";

export default class TransportMap{

    #trains = [];
    #stations = [];

    #map;

    constructor(map){
        this.#map = map;
    }


    getLatLngForStation_VAG(VAG_name){
        for (let i = 0; i < this.#stations.length; i++) {
            if(this.#stations[i].VAG_Name === VAG_name){
                return [this.#stations[i].latitude, this.#stations[i].longitude];
            }
        }
    }

    getStation(VAG_name){
        for (let i = 0; i < this.#stations.length; i++) {
            
            if(this.#stations[i].VAG_Name === VAG_name){
                return this.#stations[i];
            }

        
        }
        return undefined;
    }

    addStation(station){
        this.#stations.push(station);
    }


    loadStations() {
        //get Haltestelle by name (% as wildcard for everything) ("%" gets encoded as "%25")
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
                    stops.forEach(stop => {

                        this.#stations.push(new Station(
                            stop['Haltestellenname'],
                            stop['VAGKennung'],
                            stop['VGNKennung'],
                            stop['Longitude'],
                            stop['Latitude'],
                            stop['Produkte']
                        ))
                    });
                })
                .then(() => {
                    //this.drawAllStations();
                    this.drawUbahnStations();
                    this.drawTramStations();
                    this.drawBusStations();
                })
    }

    #getUbahnStations(){
        return this.#stations.filter(s => {
            if(typeof s.transportType === 'undefined') return false;
            return s.transportType.includes("UBahn");
        })
    }

    #getTramStations(){
        return this.#stations.filter(s => {
            if(typeof s.transportType === 'undefined') return false;

            return s.transportType.includes("Tram") && !s.transportType.includes("UBahn");
        })
    }

    #getBusStations(){
        return this.#stations.filter(s => {
            if(typeof s.transportType === 'undefined') return false;
            return s.transportType.includes("Bus") && !s.transportType.includes("UBahn") && !s.transportType.includes("Tram");
        })
    }


    drawUbahnStations(){
        this.#getUbahnStations().forEach(station => {
            L.circle([station.latitude, station.longitude], {radius: 100, color: "#000000", weight: 3, opacity: 1, fillColor: '#FFFFFF', fillOpacity: 1, pane: 'stationPane'})
                .bindPopup(station.name + "  -  " + station.transportType)
                .addTo(this.#map)
                            
        });
    }

    drawTramStations(){
        this.#getTramStations().forEach(station => {
            L.circle([station.latitude, station.longitude], {radius: 50, color: "#000000", weight: 3, opacity: 1, fillColor: '#FFBBBB', fillOpacity: 1, pane: 'stationPane'})
                .bindPopup(station.name + "  -  " + station.transportType)
                .addTo(this.#map)
                            
        });
    }

    drawBusStations(){
        this.#getBusStations().forEach(station => {
            L.circle([station.latitude, station.longitude], {radius: 30, color: "#000000", weight: 3, opacity: 1, fillColor: '#BBFFBB', fillOpacity: 1, pane: 'stationPane'})
                .bindPopup(station.name + "  -  " + station.transportType)
                .addTo(this.#map)
                            
        });
    }

    

    /**
    * 
    * @param {String} station_VAG VAG short for station
    * @param {String} transportType UBahn | Tram | Bus
    */
    drawTransportAtStation(station_VAG, marker, transportType){
        let station = this.#stations.find((s) => {
            return s.VAG_Name === station_VAG;
        })
        marker.setLatLng([station.latitude, station.longitude]);
    }

    /**
     * 
     * @param {String} first_station_VAG 
     * @param {String} second_station_VAG 
     * @param {number} distance 0-1
     * @param {Layer} marker 
     * @param {String} transportType UBahn | Tram | Bus
     */
    drawTransportBetweenStations(first_station_VAG, second_station_VAG, distance,  marker, transportType){
        let firstStation = this.#stations.filter((s) => {
            return s.VAG_Name === first_station_VAG;
        })[0];

        let secondStation = this.#stations.filter((s) => {
            return s.VAG_Name === second_station_VAG;
        })[0];


        let latitudeDifference = secondStation.latitude - firstStation.latitude;
        let latitude = firstStation.latitude + latitudeDifference * distance;


        let longitudeDifference = secondStation.longitude - firstStation.longitude;
        let longitude = firstStation.longitude + longitudeDifference * distance;

        marker.setLatLng([latitude, longitude]);
    }


    drawAllStations(){

        this.#stations.forEach(station => {
            
            if(typeof station.latitude === 'undefined'){
            }

            L.circle([station.latitude, station.longitude], {radius: 20, color: "#000000", weight: 3, opacity: 1, fillColor: '#FFFFFF', fillOpacity: 1, pane: 'stationPane'})
                .bindPopup(station.name + "  -  " + station.transportType)
                .addTo(this.#map)
                            
        });

    }


}
