import {Loader} from "@googlemaps/js-api-loader";
import MarkerClusterer from "@googlemaps/markerclustererplus";
import {locationsType, routesType, stoppingType} from "./App";


export const promiseDataMinskTransStops = apiRequestHandler('http://www.minsktrans.by/city/minsk/stops.txt')
export const promiseDataMinskTransRoutes = apiRequestHandler('http://www.minsktrans.by/city/minsk/routes.txt')

promiseDataMinskTransStops.then(data => console.log(data))

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

export function initMap(locations: Array<locationsType>) {

    const loader = new Loader({
        apiKey: "AIzaSyC_B7FYGdGaaosiiHqVjXsn4JBvAvKDZpg",
        version: "weekly",
        libraries: ['geometry', 'places']
    });

    loader.load().then(() => {
        map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: {lat: 53.902214, lng: 27.561817},
            zoom: 10
        });
        directionsService = new google.maps.DirectionsService()
        directionsRenderer = new google.maps.DirectionsRenderer()
        directionsRenderer.setMap(map);


        // var request = {
        //     query: 'bus transit',
        //     fields: ['name', 'geometry']
        // }
        //
        //
        // var service = new google.maps.places.PlacesService(map);
        //
        // service.findPlaceFromQuery(request, function(results, status) {
        //     if (status === google.maps.places.PlacesServiceStatus.OK) {
        //         for (var i = 0; i < results.length; i++) {
        //             createMarker(results[i]);
        //         }
        //         //@ts-ignore
        //         map.setCenter(results[0].geometry.location);
        //     }
        // });
        //
        //
        //
        // function createMarker(place: google.maps.places.PlaceResult) {
        //     return new google.maps.Marker({
        //         map,
        //         position: (place.geometry as google.maps.places.PlaceGeometry).location,
        //     });
        // }

            const markers = locations.map((location: locationsType) => {
            return new google.maps.Marker({
                position: location
            });
        });
        new MarkerClusterer(map, markers, {
            imagePath:
                "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
        });


    });
}


export function calcRoute(dataRoutes: Array<routesType>, dataStopping: Array<stoppingType>) {

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
    const location: Array<locationsType> = copyStopsDataForRoute.map((objStops: stoppingType) => handlerMarkers(objStops))


    for (var i = 0, parts = [], max = 25 - 1; i < location.length; i = i + max)
        parts.push(location.slice(i, i + max + 1));




    for (var i = 0; i < parts.length; i++) {
        var waypoints = [];
        for (var j = 1; j < parts[i].length - 1; j++)
            waypoints.push({location: parts[i][j], stopover: true});



        const request = {
            origin: parts[i][0],
            destination: parts[i][parts[i].length - 1],
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING
        };

//@ts-ignore
        directionsService.route(request,  (result, status)=>{
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
            }
        })
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


// const request = {
//     origin: start,
//     destination: end,
//     waypoints: waypts,
//     travelMode: google.maps.TravelMode.DRIVING
// };


// directionsService.route(request, function (result, status) {
//     if (status === 'OK') {
//         directionsRenderer.setDirections(result);
//     }
// });


// let request: any
// let ArrayRequest = locations.map((loc)=>{
//     return request = {
//         location: new google.maps.LatLng(loc.lat, loc.lng),
//         radius: '10000',
//         type: ['transit_station']
//     }
// })
//
// service = new google.maps.places.PlacesService(map);
//
//
// ArrayRequest.map((request)=>{
//     service.nearbySearch(request, callback);
//     return null
// })
//
//
//
//
//
// function createMarker(place:any) {
//     new google.maps.Marker({
//         map,
//         position: place.geometry.location,
//     });
// }
//
//
// function callback(results: any, status: any) {
//     if (status === google.maps.places.PlacesServiceStatus.OK) {
//         for (var i = 0; i < results.length; i++) {
//             createMarker(results[i]);
//         }
//     }
// }








