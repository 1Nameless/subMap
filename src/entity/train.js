

export default class Train{

    #trainNumber;
    #stations;
    #line;
    #direction
    #marker;
    #distance;
    #allStations;

    constructor(trainNumber, stations, line, direction, marker, distance, allStations){
        this.trainNumber = trainNumber;
        this.stations = stations;
        this.line = line;
        this.direction = direction;
        this.marker = marker;
        this.distance = distance;
        this.allStations = allStations;
    }

    set trainNumber(trainNumber){
        this.#trainNumber = trainNumber;
        //this[trainNumber] = trainNumber;
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
