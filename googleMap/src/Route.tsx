import {calcRoute, callbackDataRoute, promiseDataMinskTransRoutes, TimetableRoute} from "./state";
import React, {useState} from "react";
import {stoppingType} from "./Map";
import {timetableType} from "./times";
import {tableType} from "./InformationTable";

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
    setTimetableRoute: (TimetableRoute: TimetableRoute) => void
    timetable: Array<timetableType>
    setTable: (t: tableType) => void
}


const Route = React.memo(function (props: componentRouteType) {

    const [dataRoutes, setDataRoutes] = useState<Array<routesType>>()
    promiseDataMinskTransRoutes.then(data => {
        setDataRoutes(data)
        callbackDataRoute(data)
    })

    return <div className={'route'}>
        <strong>Маршруты:</strong>
        {dataRoutes &&
        <select className={'select_route'}
                id="routes"
                onChange={() => {
                    calcRoute(dataRoutes, props.stopping, props.timetable, props.setTimetableRoute, props.setTable)
                }} size={10}>

            {dataRoutes.map((objRoutes: routesType) => {
                return objRoutes.RouteStops.length !== 0 &&
                    <option value={objRoutes.RouteID} key={objRoutes.RouteID}>{objRoutes.RouteName}</option>
            })}
        </select>}
    </div>
})

export default Route;