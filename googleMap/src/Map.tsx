import React, {useState} from 'react';
import './style.css';
import {promiseDataMinskTransStops, initMap, handlerMarkers} from "./state";
import Route from "./Route";

export type stoppingType = {
    Area: string
    City: string
    ID: string
    Info: string
    Lat: string
    Lng: string
    Name: string
    StopNum: string
    Stops: string
    Street: string
}
export type locationsType = {
    lat: number,
    lng: number
}


function Map() {

    const [dataStopping, SetDataStopping] = useState<Array<stoppingType>>()
    promiseDataMinskTransStops.then(data => SetDataStopping(data))

    let locations: Array<locationsType>

    if (dataStopping) {
        locations = dataStopping.map((objStopping: stoppingType) => handlerMarkers(objStopping))
            .filter((loc: locationsType) => loc.lat !== 0 && loc.lng !== 0)
        initMap(locations)
    }

    return <div>
        <div id={'map'}/>
        {dataStopping && <Route stopping={dataStopping}/>}
    </div>
}

export default Map;
