


export default class TransportStop{

    VAG_StationName;
    VGN_StationName;
    #plannedArrival
    #actualArrival
    #plannedDeparture
    #actualDeparture


    fromJson(json){
        this.VAG_StationName = json.VAGKennung;
        this.VGN_StationName = json.VGNKennung;
        this.#plannedArrival = json.AnkunftszeitSoll;
        this.#actualArrival = json.AnkunftszeitIst;
        this.#plannedDeparture = json.AbfahrtszeitSoll;
        this.#actualDeparture = json.AbfahrtszeitIst;

        return this;
    }


    get VAG_stationName(){
        return this.VAG_StationName;
    }

    get plannedArrival(){
        return this.#plannedArrival;
    }

    get actualArrival(){
        return this.#actualArrival;
    }

    get plannedDeparture(){
        return this.#plannedDeparture;
    }

    get actualDeparture(){
        return this.#actualDeparture;
    }

}