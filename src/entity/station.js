


export default class Station{


    #name;
    #VAG_Name;
    #VGN_Name;
    #longitude;
    #latitude;
    #transportType;

    constructor(name, VAG_Name, VGN_Name, longitude, latitude, transportType){
        this.#name = name;
        this.#VAG_Name = VAG_Name;
        this.#VGN_Name = VGN_Name;
        this.#longitude = longitude;
        this.#latitude = latitude;
        this.#transportType = transportType;
    }
    

    get name(){
        return this.#name;
    }

    get latitude(){
        return this.#latitude;
    }

    get longitude(){
        return this.#longitude;
    }

    get transportType(){
        return this.#transportType;
    }

    get VAG_Name(){
        return this.#VAG_Name;
    }

}