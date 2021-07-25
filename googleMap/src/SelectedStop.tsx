import {stoppingType} from "./Map";
import {TimetableRoute} from "./state";
import {trips_by_daysType} from "./times";
import React from "react";
import {v1} from "uuid";


type selectedStopType = {
    timetableRoute: TimetableRoute
    setTable: (a: Array<{ time: Array<number>, days_of_week: Array<number> }>) => void
}

const SelectedStop = React.memo(function (props: selectedStopType) {

    const showTimetable = (objStop: stoppingType) => {
        const selectedStop = props.timetableRoute?.trips_by_days.map((t: trips_by_daysType) => {
            return {
                time: t.timeArrivals[props.timetableRoute?.stops_by_route.indexOf(objStop)],
                days_of_week: t.days_of_week
            }
        })
        props.setTable(selectedStop)
    }
    let stopCounter = 0
    ;
    return <div> <strong>Остановки:</strong>
        <select size={5} className={'select_stop'}>{props.timetableRoute?.stops_by_route.map((objStop: stoppingType) => {
        stopCounter++
        return <option key={v1()} onClick={() => showTimetable(objStop)}>
            {objStop.Name === '' ? `остановка № ${stopCounter}` : objStop.Name}
        </option>
    })}</select></div>
})

export default SelectedStop;