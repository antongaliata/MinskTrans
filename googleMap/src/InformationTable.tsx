import {promiseDataMinskTransTimes, TimetableRoute} from "./state";
import React, {useState} from "react";
import {stoppingType} from "./Map";
import {timetableType} from "./times";
import Route from "./Route";
import SelectedStop from "./SelectedStop";
import Timetable from "./Timetable";

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
export type tableType = Array<{ time: Array<number>, days_of_week: Array<number> }> | null


const InformationTable = React.memo(function (props: componentRouteType) {

    const [timetable, setTimetable] = useState<Array<timetableType>>()
    promiseDataMinskTransTimes.then((data) => setTimetable(data))
    const [timetableRoute, setTimetableRoute] = useState<TimetableRoute>()
    const [table, setTable] = useState<tableType>()


    return <div className={'infoTable'}>
        <div className={'wrapper_heading_route_stop'}>
        <div className={'heading_infoTable'}><h2>{timetableRoute?.nameRoute}</h2></div>
            {timetable && <Route stopping={props.stopping}
                                 setTimetableRoute={setTimetableRoute}
                                 timetable={timetable}
                                 setTable={setTable}
            />}

                {timetableRoute && <SelectedStop timetableRoute={timetableRoute}
                                                 setTable={setTable}
                />}
        </div>
          <div className={'wrap_table'}>{table && <Timetable table={table}/>}</div>
    </div>

})

export default InformationTable;
