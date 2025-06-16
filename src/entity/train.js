

export default class Train{

    #transportMap;

    #trainNumber;
    #stations;
    #line;
    #direction
    #marker;
    #distance;
    #allStations;

    constructor(trainNumber, stations, line, direction, marker, distance, allStations, transportMap){
        this.trainNumber = trainNumber;
        this.stations = stations;
        this.line = line;
        this.direction = direction;
        this.marker = marker;
        this.distance = distance;
        this.allStations = allStations;
        this.#transportMap = transportMap;
    }


    drawOnMap(){

        let currentTime = new Date().getTime();

        for (let i = 0; i < this.#allStations.length; i++) {
            const station = this.#allStations[i];

            let ankunftszeit = new Date(station.AnkunftszeitIst).getTime();
            let abfahrtszeit = new Date(station.AbfahrtszeitIst).getTime();
            
            if(typeof station.AnkunftszeitIst !== 'undefined' && ankunftszeit > currentTime){
                // zwischen dieser und letzter Station
                let departure = new Date(this.#allStations[i-1].AbfahrtszeitIst).getTime();
                let arrival = new Date(station.AnkunftszeitIst).getTime();
                let distance = (currentTime - departure) / (arrival - departure);

                this.#transportMap.drawTransportBetweenStations(this.#allStations[i-1].VAGKennung, station.VAGKennung, distance, this.marker)
                return;
            }
            else if(typeof station.AbfahrtszeitIst === 'undefined' || abfahrtszeit >= currentTime){
                //at station
                this.#transportMap.drawTransportAtStation(station.VAGKennung, this.marker);
                return;
            }

        }

    }


    set trainNumber(trainNumber){
        this.#trainNumber = trainNumber;
    }

    set stations(stations){
        this.#stations = stations;
    }

    set line(line){
        this.#line = line;
    }

    set direction(direction){
        this.#direction = direction;
    }

    set marker(marker){
        this.#marker = marker;
    }

    set distance(distance){
        this.#distance = distance;
    }

    set allStations(allStations){
        this.#allStations = allStations;
    }


    get trainNumber(){
        return this.#trainNumber;
    }

    get stations(){
        return this.#stations;
    }

    get line(){
        return this.#line;
    }

    get direction(){
        return this.#direction;
    }

    get marker(){
        return this.#marker;
    }

    get distance(){
        return this.#distance;
    }

    get allStations(){
        return this.#allStations;
    }


}
