import React, {useState} from 'react';
import './style.css';
import {promiseDataMinskTransStops, initMap, calcRoute, promiseDataMinskTransRoutes, handlerMarkers} from "./state";

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
export type routesType ={
    Authority: string,
    City: string,
    Commercial: string,
    Datestart: string,
    Entry: string,
    Operator: string,
    ['Pikas2012.11.19']: string,
    RouteID: string
    RouteName: string
    RouteNum: string
    RouteStops: string
    RouteTag: string
    RouteType: string
    SpecialDates: string
    Transport: string
    ValidityPeriods: string
    Weekdays: string
}
export type locationsType = {
    lat: number,
    lng: number
}


function App() {

    const [dataStopping, SetDataStopping] = useState<Array<stoppingType>>()
    const [dataRoutes, setDataRoutes] = useState<Array<routesType>>()

    promiseDataMinskTransStops.then(data => SetDataStopping(data))
    promiseDataMinskTransRoutes.then(data => setDataRoutes(data))


    let locations: Array<locationsType>

    if (dataStopping) {
        locations = dataStopping.map((objStopping: stoppingType) => handlerMarkers(objStopping))
            .filter((loc: locationsType) => loc.lat !== 0 && loc.lng !== 0)
        initMap(locations)
    }

    return <div>
        <div id={'map'}/>
        <strong>Route: </strong>
        { (dataRoutes && dataStopping) && <select id="routes" onChange={() => calcRoute(dataRoutes, dataStopping)}>
            {  dataRoutes.map((objRoutes: routesType)=>{
                return objRoutes.RouteStops.length !== 0  && <option value={objRoutes.RouteID} key={objRoutes.RouteID}>{objRoutes.RouteName}</option>
            }) }
        </select> }
    </div>
}

export default App;
