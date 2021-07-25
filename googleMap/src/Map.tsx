import React, {useState} from 'react';
import './style.css';
import {promiseDataMinskTransStops, initMap, handlerMarkers} from "./state";
import InformationTable from "./InformationTable";


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

    const [dataStopping, setDataStopping] = useState<Array<stoppingType>>()
    promiseDataMinskTransStops.then(data => setDataStopping(data))

    let locations: Array<locationsType>

    if(dataStopping) {
        locations = dataStopping.map((objStopping: stoppingType) => handlerMarkers(objStopping))
            .filter((loc: locationsType) => loc.lat !== 0 && loc.lng !== 0)
        initMap( locations, dataStopping)
    }

    return <div className={'wrapper_map_infoTable'}>
        <div className={'wrap_map'}><div id={'map'}/></div>
        {dataStopping && <InformationTable stopping={dataStopping}/>}
    </div>
}

export default Map;
