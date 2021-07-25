import {v1} from "uuid";
import React from 'react';
import {tableType} from "./InformationTable";

type timetableType = {
    table: tableType
}

function Timetable(props: timetableType) {
    let hour: number
    const daysOfWeek = [' Вс ', ' Пн ', ' Вт ', ' Ср ', ' Чт ', ' Пт ', ' Сб ']


    const handlerTimes = (time: number) => {
        let hour = Math.floor(time / 60)
        let minute = Math.round(((time / 60) - hour) * 60)
        return {hour: hour >= 24 ? hour - 24 : hour, minute: minute.toString().length < 2 ? '0' + minute : minute}
    }

    return <table>
        <thead>{}</thead>
        <tbody className={'table'}>{
            props.table?.map((objTimetable) => {
                return<tr className={'table'} key={v1()}><td key={v1()} className={'day_timetable'}>{objTimetable.days_of_week.map((day) =>{
                    return <span className={'day' + day.toString()} key={v1()}>{daysOfWeek[day]}</span>
                })}</td>
                <td key={v1()}>{objTimetable.time.map((timeHour) => {
                    if (hour !== handlerTimes(timeHour).hour || objTimetable.time.length < 2) {
                        hour = handlerTimes(timeHour).hour
                        return <table key={v1()}>
                            <tbody>
                            <tr key={v1()}>
                                <td key={v1()} className={'hour'}>{hour}</td>
                                {objTimetable.time.map((timeMinute) => {
                                    if (hour === handlerTimes(timeMinute).hour) {
                                        return <td key={v1()} className={'minute'}>{handlerTimes(timeMinute).minute}</td>
                                    }
                                })}
                            </tr>
                            </tbody>
                        </table>
                    }
                })
                }
                </td></tr>
            })
        }
        </tbody>

    </table>
}

export default Timetable