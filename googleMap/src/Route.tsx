import {calcRoute, promiseDataMinskTransRoutes} from "./state";
import React, {useState} from "react";
import {stoppingType} from "./Map";

export type routesType = {
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
type componentRouteType = {
    stopping: Array<stoppingType>
}

function Route(props: componentRouteType) {

    const [dataRoutes, setDataRoutes] = useState<Array<routesType>>()
    promiseDataMinskTransRoutes.then(data => setDataRoutes(data))

    return <div>
        <strong>Route: </strong>
    {dataRoutes && <select id="routes" onChange={() => calcRoute(dataRoutes, props.stopping)}>
        {dataRoutes.map((objRoutes: routesType) => {
            return objRoutes.RouteStops.length !== 0 && <option value={objRoutes.RouteID} key={objRoutes.RouteID}>{objRoutes.RouteName}</option>
        })}
    </select>}
    </div>
}

export default Route;