import {Loader} from "@googlemaps/js-api-loader";
import MarkerClusterer from "@googlemaps/markerclustererplus";
import {locationsType, stoppingType} from "./Map";
import {routesType} from "./Route";


export const promiseDataMinskTransStops = apiRequestHandler('http://www.minsktrans.by/city/minsk/stops.txt')
export const promiseDataMinskTransRoutes = apiRequestHandler('http://www.minsktrans.by/city/minsk/routes.txt')

function apiRequestHandler(link: string) {
    return (async () => {
        const request = await fetch(`https://api.allorigins.win/get?url=${link}`)
        const text = (await request.json()).contents.trim()
        const r = text.split(/\r?\n/)
        const keys = r.shift().split(/;/)
        return r.map((s: string) => Object.fromEntries(s.split(/;/)
            .map((v: string, i: number) => [keys[i], v]))
        )
    })()
}

let directionsService: google.maps.DirectionsService
let directionsRenderer: google.maps.DirectionsRenderer
let map: google.maps.Map
let render: google.maps.DirectionsRenderer

export function initMap(locations: Array<locationsType>) {

    const loader = new Loader({
        apiKey: "AIzaSyC_B7FYGdGaaosiiHqVjXsn4JBvAvKDZpg",
        version: "weekly"
    });
    loader.load().then(() => {
        map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: {lat: 53.902214, lng: 27.561817},
            zoom: 10
        });
        directionsService = new google.maps.DirectionsService()
        directionsRenderer = new google.maps.DirectionsRenderer()
        directionsRenderer.setMap(map);

        const markers = locations.map((location: locationsType) => {
            return new google.maps.Marker({
                position: location
            })
        })
        new MarkerClusterer(map, markers, {
            imagePath:
                "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
        })
    })
}


export function calcRoute(dataRoutes: Array<routesType>, dataStopping: Array<stoppingType>) {
    // let request = {
    //     origin: {},
    //     destination: {},
    //     waypoints: [],
    //     travelMode: google.maps.TravelMode.DRIVING
    // }

    // let service_callback2 = (result: any, status: any) => {
    //     directionsRenderer = new google.maps.DirectionsRenderer()
    //     if (status === 'OK') {
    //         directionsRenderer.setDirections(result)
    //         directionsRenderer.setMap(null)
    //         directionsRenderer.setOptions({ suppressMarkers: false, preserveViewport: false })
    //     }
    // }
    // directionsService.route(request, service_callback2);

    const routeId = (document.getElementById('routes') as HTMLInputElement).value
    const stoppingRoute = dataRoutes.filter((objRout: routesType) => objRout.RouteID === routeId)
        [0].RouteStops.split(',')

    const dataStopsForRoute: Array<stoppingType> = []
    dataStopping.map((objStopping: stoppingType) => {
        for (let i = 0; i < stoppingRoute.length; i++) {
            if (objStopping.ID === stoppingRoute[i]) {
                dataStopsForRoute.push(objStopping)
            }
        }
        return null
    })

    const index = []
    const copyStopsDataForRoute = [...dataStopsForRoute]
    for (let i = 0; i < stoppingRoute.length; i++) {
        index.push(stoppingRoute.indexOf(dataStopsForRoute[i].ID))
        copyStopsDataForRoute[index[i]] = dataStopsForRoute[i]
    }
    const loc: Array<locationsType> = copyStopsDataForRoute.map((objStops: stoppingType) => handlerMarkers(objStops))

    for (var i = 0, parts = [], max = 8 - 1; i < loc.length; i = i + max) {
        parts.push(loc.slice(i, i + max + 1))
    }


    console.log(parts.length)
    let aa = 0
    let service_callback = (result: any, status: any) => {
        render = new google.maps.DirectionsRenderer()
        aa++
        if(aa === parts.length){
        console.log("directionsRenderer")
        directionsRenderer.setDirections(result)
        directionsRenderer.setMap(map)
        directionsRenderer.setOptions({ suppressMarkers: false, preserveViewport: false })
    }
        if (status === 'OK') {
                console.log("render")
                render.setDirections(result)
                render.setMap(map)
                render.setOptions({ suppressMarkers: false, preserveViewport: false })
        }
    }



    for (let i = 0; i < parts.length; i++) {
        let waypoints = [];
        for (let j = 1; j < parts[i].length - 1; j++) {
            waypoints.push({location: new google.maps.LatLng(parts[i][j].lat, parts[i][j].lng), stopover: true})
        }


        let request = {
            origin: parts[i][0],
            destination: parts[i][parts[i].length - 1],
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING
        }

        directionsService.route(request, service_callback);

        // directionsService.route(request, (result, status) => {
        //      directionsRenderer
        //     let renderer = new google.maps.DirectionsRenderer
        //     if (status === 'OK') {
        //         renderer.setDirections(result)
        //         renderer.setMap(map)
        //         renderer.setOptions({ suppressMarkers: false, preserveViewport: false })
        //
        //     }
        // })
    }
}

export const handlerMarkers = (objStopping: stoppingType): locationsType => {
    const handlerLatLng = (LatLng: string) => {
        let result = LatLng.split('')
        result.splice(2, 0, '.')
        return result.join('')
    }
    return {
        lat: Number(handlerLatLng(objStopping.Lat)),
        lng: Number(handlerLatLng(objStopping.Lng))
    }
}