

export default class Transport{

    #transportMap;

    #transportNumber;
    #line;
    #direction
    #marker;
    #allStations;
    #transportMode

    constructor(transportNumber, line, direction, marker, allStations, transportMap, transportMode){
        this.transportNumber = transportNumber;
        this.line = line;
        this.direction = direction;
        this.marker = marker;
        this.allStations = allStations;
        this.#transportMap = transportMap;
        this.#transportMode = transportMode;
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


    set transportNumber(transportNumber){
        this.#transportNumber = transportNumber;
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


    set allStations(allStations){
        this.#allStations = allStations;
    }


    get transportNumber(){
        return this.#transportNumber;
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


    get allStations(){
        return this.#allStations;
    }


}
