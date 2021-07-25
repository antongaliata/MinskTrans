import {Loader} from "@googlemaps/js-api-loader";
import MarkerClusterer from "@googlemaps/markerclustererplus";
import {locationsType, stoppingType} from "./Map";
import {routesType} from "./Route";
import getTimes, {timetableType, trips_by_daysType} from './times'
import {tableType} from "./InformationTable";


export const promiseDataMinskTransStops = apiRequestHandler('http://www.minsktrans.by/city/minsk/stops.txt')
export const promiseDataMinskTransRoutes = apiRequestHandler('http://www.minsktrans.by/city/minsk/routes.txt')
export const promiseDataMinskTransTimes = apiRequestHandlerTimes('http://www.minsktrans.by/city/minsk/times.txt').then((data) => getTimes(data))

async function apiRequestHandlerTimes(link: string) {
    const request = await fetch(`https://api.allorigins.win/get?url=${link}`)
    const text = (await request.json()).contents.trim()
    return text.trim().split('\n')
}

async function apiRequestHandler(link: string) {
    const request = await fetch(`https://api.allorigins.win/get?url=${link}`)
    const text = (await request.json()).contents.trim().split('\n')
    const keys = text.shift().split(';')
    return text.map((t: string) => {
        return Object.fromEntries(t.split(';')
            .map((value, index) => [keys[index], value]))
    })
}


export class TimetableRoute {
    idRoute: string
    trips_by_days: Array<trips_by_daysType>
    nameRoute: string
    stops_by_route: Array<stoppingType>

    constructor(idRoute: string, trips_by_days: Array<trips_by_daysType>, nameRoute: string, stops_by_route: Array<stoppingType>) {
        this.idRoute = idRoute
        this.nameRoute = nameRoute
        this.trips_by_days = trips_by_days
        this.stops_by_route = stops_by_route
    }
}



export const handlerMarkers = (objStopping: stoppingType): locationsType => {
    const handlerLatLng = (LatLng: string) => {
        const result = LatLng.split('')
        result.splice(2, 0, '.')
        return result.join('')
    }
    return {
        lat: Number(handlerLatLng(objStopping.Lat)),
        lng: Number(handlerLatLng(objStopping.Lng))
    }
}

let directionsService: google.maps.DirectionsService
let directionsRenderer: google.maps.DirectionsRenderer
let map: google.maps.Map

const arrayDirectionsRenderer_for_calcRoute: Array<google.maps.DirectionsRenderer> = []
const arrayDirectionsRenderer_for_calcRouteClick: Array<google.maps.DirectionsRenderer> = []
const arrayDirectionsRenderer_for_calcRouteClick2: Array<google.maps.DirectionsRenderer> = []
const arrayDirectionsRenderer_for_walking_route: Array<google.maps.DirectionsRenderer> = []
const render_route_walking: Array<{ pointStart: locationsType, pointEnd: locationsType }> = []

const markersClick: Array<google.maps.Marker> = []
let distance_from_a_to_b: number

let dataRoute: Array<routesType>
export const callbackDataRoute = (dataRoutes: Array<routesType>) => {
    dataRoute = dataRoutes
}

const handlerWindowInfo = (dataStopping: Array<stoppingType>, location: google.maps.LatLngLiteral | undefined) => {

    const locationsClick: stoppingType | undefined = dataStopping.find((objStopping: stoppingType) => handlerMarkers(objStopping).lng === location?.lng && handlerMarkers(objStopping).lat === location.lat)

    const passingRoutes = dataRoute.filter((objRoute: routesType) => objRoute.RouteStops.split(',').find((stop) => locationsClick?.ID.toString() === stop))

    return (
        '<div>' + (locationsClick?.Name === '' ? '<h1>' + 'Остановка' + '</h1>' : '<h1>' + locationsClick?.Name) + '</h1>' + '</div>' +
        '<h4>' + 'Проходящие маршруты:' + '</h4>' + '</br>' +
        passingRoutes.map((t) => t.RouteName + '</br>')
    )
}


export function initMap(locations: Array<locationsType>, dataStopping: Array<stoppingType>) {

    const loader = new Loader({
        apiKey: "AIzaSyC_B7FYGdGaaosiiHqVjXsn4JBvAvKDZpg",
        version: "weekly",
        libraries: ["geometry"]
    });
    loader.load().then(() => {
        map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: {lat: 53.902214, lng: 27.561817},
            zoom: 10
        });

        directionsService = new google.maps.DirectionsService()
        directionsRenderer = new google.maps.DirectionsRenderer()
        directionsRenderer.setMap(map)


        map.addListener("click", (e) => {
            if (markersClick.length === 2) {
                for (let i = 0; i < markersClick.length; i++) {
                    markersClick[i].setMap(null)
                }
                markersClick.length = 0
            }
            placeMarkerAndPanTo(e.latLng, map)
        });

        function placeMarkerAndPanTo(latLng: google.maps.LatLng, map: google.maps.Map) {

            start_and_end_point.push(latLng.toJSON())
            if (start_and_end_point.length === 2) {

                distance_from_a_to_b = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(start_and_end_point[0]), new google.maps.LatLng(start_and_end_point[1])) * 0.001

                calcRouteClick(start_and_end_point[0], start_and_end_point[1], dataStopping, dataRoute)
                start_and_end_point.length = 0
            }
            const marker = new google.maps.Marker({
                position: latLng,
                map: map,
                animation: markersClick.length < 1 ? google.maps.Animation.BOUNCE : google.maps.Animation.DROP,
                icon: {
                    url: markersClick.length < 1 ? "https://img.icons8.com/doodle/48/000000/standing-man.png" : "https://img.icons8.com/emoji/48/000000/cross-mark-emoji.png",
                    scaledSize: <google.maps.Size>{height: 35, width: 35}
                }
            });
            map.panTo(latLng);
            markersClick.push(marker)
        }


        const markers = locations.map((location: locationsType) => {
            return new google.maps.Marker({
                position: location,
                icon: {
                    url: "https://img.icons8.com/dusk/48/000000/marker.png",
                    scaledSize: <google.maps.Size>{height: 35, width: 35}
                }
            })
        });

        markers.map((m) => {
            m.addListener("click", () => {
                const infowindow = new google.maps.InfoWindow({
                    content: handlerWindowInfo(dataStopping, m.getPosition()?.toJSON())
                });
                infowindow.open(map, m);
            });
        })
        new MarkerClusterer(map, markers, {
            imagePath:
                "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
        });
    })
}


export function calcRoute(dataRoutes: Array<routesType>, dataStopping: Array<stoppingType>, timetable: Array<timetableType>, setTimetableRoute: (TimetableRoute: TimetableRoute) => void, setTable: (t: tableType) => void) {

    setTable(null)
    //cleaning routes
    arrayDirectionsRenderer_for_calcRoute.forEach((directionsRenderer: google.maps.DirectionsRenderer) => {
        directionsRenderer.setDirections({
            geocoded_waypoints: [],
            routes: []
        })
    });

    const routeId = (document.getElementById('routes') as HTMLInputElement).value
    const stoppingRoute = dataRoutes.filter((objRoute: routesType) => objRoute.RouteID === routeId)
        [0].RouteStops.split(',')

    const selectedTimetable = timetable.filter((objTimetable) => {
        return objTimetable.routeID === Number(routeId)
    })[0]

    const routeName = dataRoutes.filter((objRoute: routesType) => objRoute.RouteID === routeId ? objRoute.RouteName : null)

    const dataStopsForRoute: Array<stoppingType> = []
    dataStopping.forEach((objStopping: stoppingType) => {
        for (let i = 0; i < stoppingRoute.length; i++) {
            if (objStopping.ID === stoppingRoute[i]) {
                dataStopsForRoute.push(objStopping)
            }
        }
    });

    const timetableRoute = new TimetableRoute(routeId, selectedTimetable.trips_by_days, routeName[0].RouteName, dataStopsForRoute)
    setTimetableRoute(timetableRoute)

    const route: Array<locationsType> = route_building(dataStopping, stoppingRoute)

    const markerOptions = {
        suppressMarkers: false,
        preserveViewport: false,
        markerOptions: {
            animation: google.maps.Animation.DROP,
            icon: {
                url: "https://img.icons8.com/dusk/64/000000/bus2.png",
                scaledSize: <google.maps.Size>{height: 30, width: 30}
            }
        }
    };

    split_and_show_route(route, arrayDirectionsRenderer_for_calcRoute, markerOptions, true)

}


const start_and_end_point: Array<google.maps.LatLngLiteral> = []


// let arrayDirectionsRenderer: Array<Array<google.maps.DirectionsRenderer>> = []


function calcRouteClick(start: locationsType, end: locationsType, dataStopping: Array<stoppingType>, dataRoute: Array<routesType>) {

    const cleaning_routes = (arrayDirectionsRenderer: Array<google.maps.DirectionsRenderer>) => {

        arrayDirectionsRenderer.forEach((directionsRenderer: google.maps.DirectionsRenderer) => {
            directionsRenderer.setDirections({
                geocoded_waypoints: [],
                routes: []
            })
        })
        render_route_walking.length = 0
    }

    cleaning_routes(arrayDirectionsRenderer_for_calcRouteClick)
    cleaning_routes(arrayDirectionsRenderer_for_calcRouteClick2)
    cleaning_routes(arrayDirectionsRenderer_for_walking_route)


    type optimalRouteType = {
        distance_to_end_point: number,
        distance_to_start_point: number,
        stop_to_exit: stoppingType,
        start_stop: stoppingType,
        route: routesType
    }

    const search_optimal_route = (start_point: locationsType, end_point: locationsType) => {

        const arrayRouteStopsId: Array<string> = []
        dataRoute.forEach((route) => {
            const array = route.RouteStops.split(',')
            arrayRouteStopsId.push(...array)
        })

        const stops_with_route = dataStopping.filter((stop) => {
            if (arrayRouteStopsId.find((stopId) => stop.ID === stopId)) {
                return stop
            }
        })

        const distance_km_to_stops = stops_with_route.map((stop) => {
            return {
                distance_km_to_stop: google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(start_point), new google.maps.LatLng(handlerMarkers(stop))) * 0.001,
                stop: stop
            }
        })

        let distance_limit_km_to_stops: Array<{ distance_km_to_stop: number, stop: stoppingType }> = []
        let search_radius_km = 1

        while (distance_limit_km_to_stops.length < 1) {
            distance_limit_km_to_stops = distance_km_to_stops.filter((obj) => obj.distance_km_to_stop < search_radius_km && obj.distance_km_to_stop !== 0)
            search_radius_km++
        }


        const passing_routes_from_start_stop: Array<{ route: routesType, stop_and_distance: { distance_km_to_stop: number, stop: stoppingType } }> = []
        dataRoute.forEach((objRoute) => {
            for (let i = 0; i < distance_limit_km_to_stops.length; i++) {
                const routeStop = objRoute.RouteStops.split(',')
                for (let j = 0; j < routeStop.length; j++) {
                    if (routeStop[j] === distance_limit_km_to_stops[i].stop.ID) {
                        passing_routes_from_start_stop.push({
                            route: objRoute,
                            stop_and_distance: distance_limit_km_to_stops[i]
                        })
                    }
                }
            }
        })


        const date = new Date()
        const day = date.getDay()
        const optimal_route_options: Array<optimalRouteType> = []

        const optimal_route: Array<Array<optimalRouteType>> = []
        passing_routes_from_start_stop.forEach((route_and_distance) => {

            if (route_and_distance.route.Weekdays.split('').indexOf(day.toString())) {

                route_and_distance.route.RouteStops.split(',').forEach((stopID) => {

                    for (let i = 0; i < dataStopping.length; i++) {

                        if (dataStopping[i].ID === stopID) {
                            const indexStopStart = route_and_distance.route.RouteStops.split(',').indexOf(route_and_distance.stop_and_distance.stop.ID)
                            const indexStopEnd = route_and_distance.route.RouteStops.split(',').indexOf(dataStopping[i].ID)

                            //search route in the right direction
                            if (indexStopStart < indexStopEnd) {

                                optimal_route_options.push({
                                    distance_to_end_point: google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(handlerMarkers(dataStopping[i])), new google.maps.LatLng(end_point)) * 0.001,
                                    distance_to_start_point: route_and_distance.stop_and_distance.distance_km_to_stop,
                                    stop_to_exit: dataStopping[i],
                                    start_stop: route_and_distance.stop_and_distance.stop,
                                    route: route_and_distance.route
                                })
                            }
                        }
                    }
                    optimal_route_options.sort((a, b) => (a.distance_to_end_point + a.distance_to_start_point) - (b.distance_to_end_point + b.distance_to_start_point))
                    optimal_route.push(optimal_route_options)
                })
            }
        })

        optimal_route.sort((a, b) => (a[0].distance_to_end_point + a[0].distance_to_start_point) - (b[0].distance_to_end_point + b[0].distance_to_start_point))
        return optimal_route[0][0]
    }


    const true_route_section = (start: locationsType, end: locationsType, dataStopping: Array<stoppingType>): { points_along_route: Array<locationsType> } => {
        const optimalRoute: optimalRouteType = search_optimal_route(start, end)
        const points_along_route = route_building(dataStopping, optimalRoute.route.RouteStops.split(','))

        return {
            points_along_route: points_along_route.slice(optimalRoute.route.RouteStops.split(',').indexOf(optimalRoute.start_stop.ID),
                optimalRoute.route.RouteStops.split(',').indexOf(optimalRoute.stop_to_exit.ID.toString()))
        }
    }

    const markerOptions = {
        polylineOptions: {
            strokeColor: 'red',
            strokeWeight: 6,
            strokeOpacity: .6
        }
    }
    const route = true_route_section(start, end, dataStopping)
    const distance = (route: { points_along_route: Array<locationsType> }) => {
        const distance_from_last_stop_to_end_point = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(route.points_along_route[route.points_along_route.length - 1]),
            new google.maps.LatLng(end)) * 0.001


        let distance_route = 0
        for (let i = 0; i < route.points_along_route.length; i++) {
            if (route.points_along_route[i + 1]) {
                distance_route += google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(route.points_along_route[i]), new google.maps.LatLng(route.points_along_route[i + 1])) * 0.001
            }
        }

        return {distance_from_last_stop_to_end_point, distance_route}
    }


    //===========================================рефакторить==============================================
    if (distance(route).distance_route > 1) {
        render_route_walking.push({pointStart: start, pointEnd: route.points_along_route[0]})

        split_and_show_route(route.points_along_route, arrayDirectionsRenderer_for_calcRouteClick, markerOptions, false)
        const route2 = true_route_section(route.points_along_route[route.points_along_route.length - 1], end, dataStopping)

        if (distance(route2).distance_route > 1) {

            render_route_walking.push({
                pointStart: route.points_along_route[route.points_along_route.length - 1],
                pointEnd: route2.points_along_route[0]
            })
            split_and_show_route(route2.points_along_route, arrayDirectionsRenderer_for_calcRouteClick2, markerOptions, false)

            render_route_walking.push({
                pointStart: route2.points_along_route[route2.points_along_route.length - 1],
                pointEnd: end
            })

        } else {
            render_route_walking.push({
                pointStart: route.points_along_route[route.points_along_route.length - 1],
                pointEnd: end
            })
        }
    } else {
        render_route_walking.push({pointStart: start, pointEnd: end})
    }

    walking_route(render_route_walking)

    //
    // console.log(distance_from_a_to_b + ' км от А до Б')
    // console.log(distance(route).distance_route + ' км маршрут')
    // console.log(distance(route).distance_from_last_stop_to_end_point + ' км от последней отсановки до конечной точки')
    // console.log(route)
}


const route_building = (dataStopping: Array<stoppingType>, stoppingRoute: Array<string>) => {

    const dataStopsForRoute: Array<stoppingType> = []
    dataStopping.forEach((objStopping: stoppingType) => {
        for (let i = 0; i < stoppingRoute.length; i++) {
            if (objStopping.ID === stoppingRoute[i]) {
                dataStopsForRoute.push(objStopping)
            }
        }
    });

//building a route in the right order
    const index = []
    const copyStopsDataForRoute = [...dataStopsForRoute]
    for (let i = 0; i < stoppingRoute.length; i++) {
        index.push(stoppingRoute.indexOf(dataStopsForRoute[i].ID))
        copyStopsDataForRoute[index[i]] = dataStopsForRoute[i]
    }
    const route: Array<locationsType> = copyStopsDataForRoute.map((objStops: stoppingType) => handlerMarkers(objStops))

    return route
}


function split_and_show_route(route: Array<locationsType>, DirectionsRenderer: Array<google.maps.DirectionsRenderer>, markerOptions: google.maps.DirectionsRendererOptions, stopover: boolean) {

    const partsRoute = []
    const max = 25
    for (let i = 0; i < route.length; i = i + max) {
        partsRoute.push(route.slice(i, i + max + 1))
    }

    for (let i = 0; i < partsRoute.length; i++) {
        let waypoints = [];
        for (let j = 1; j < partsRoute[i].length - 1; j++) {
            waypoints.push({
                location: new google.maps.LatLng(partsRoute[i][j].lat, partsRoute[i][j].lng),
                stopover: stopover
            })
        }

        const request = {
            origin: route[0],
            destination: route[route.length - 1],
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING
        }

        DirectionsRenderer.push(new google.maps.DirectionsRenderer())
        directionsService.route(request, (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
            if (status === 'OK') {
                DirectionsRenderer[i].setDirections(result)
                DirectionsRenderer[i].setMap(map)
                DirectionsRenderer[i].setOptions(markerOptions)
            }
        })
    }
}


const walking_route = (render_route_walking: Array<{ pointStart: locationsType, pointEnd: locationsType }>) => {

    const markerOptions = {
        polylineOptions: {
            strokeColor: 'grey',
            strokeWeight: 4,
            strokeOpacity: .6,
        },
        suppressMarkers: true
    }

    for (let i = 0; i < render_route_walking.length; i++) {
        arrayDirectionsRenderer_for_walking_route.push(new google.maps.DirectionsRenderer())

        const request = {
            origin: render_route_walking[i].pointStart,
            destination: render_route_walking[i].pointEnd,
            travelMode: google.maps.TravelMode.WALKING
        }

        directionsService.route(request, (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
            if (status === 'OK') {
                arrayDirectionsRenderer_for_walking_route[i].setDirections(result)
                arrayDirectionsRenderer_for_walking_route[i].setMap(map)
                arrayDirectionsRenderer_for_walking_route[i].setOptions(markerOptions)
            }
        })
    }
}

























