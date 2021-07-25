export type trips_by_daysType = {
    timeArrivals: Array<Array<number>>,
    days_of_week: Array<number>,
}

export type timetableType = {
    routeID: number
    trips_by_days: Array<trips_by_daysType>
}


function getTimes(encodedSchedule: Array<string>) {
    return encodedSchedule.map(encoded_line => {
        const index = encoded_line.indexOf(",");
        const routeID = parseInt(encoded_line.substr(0, index));
        const decoded_data = decodeTimes(encoded_line.substr(index + 1));

        // const days_of_week_groups = Array.from(new Set(decoded_data.workdays));

        let trips_by_days: Array<trips_by_daysType> = Array.from(new Set(decoded_data.workdays)).map(function (element) {
            return {
                days_of_week: element.replace('7', '0').split('').map((item: string) => parseInt(item)).sort(),
                tmp_days_of_week_str: element,
                timeArrivals: []
            };
        });
        const jump_step = decoded_data.workdays.length;
        for (let j = 0, m = decoded_data.times.length / jump_step; j < m; j++) {
            let myMap: any = new Map();
            for (let i = 0, str_days_of_week = decoded_data.workdays[0]; i < jump_step; str_days_of_week = decoded_data.workdays[++i]) {
                let tmp = myMap.get(str_days_of_week);
                if (!tmp) {
                    tmp = {
                        str_days_of_week,
                        timeArrivals: []
                    };
                    myMap.set(str_days_of_week, tmp);
                }
                tmp.timeArrivals.push(decoded_data.times[i + j * jump_step]);
            }
            for (let [key, value] of myMap) {
                //@ts-ignore
                trips_by_days.find((item) => item.tmp_days_of_week_str === key).timeArrivals.push(value.timeArrivals);
            }
        }

        trips_by_days.map((item:any) => delete item.tmp_days_of_week_str);

        return {
            routeID: routeID,
            trips_by_days
        };
    });
}


function decodeTimes(encoded_data: any) {

    var timetable = []; // atkoduoti laikai
    var weekdays = []; // atkoduotos savaites dienos
    var valid_from = []; // isigaliojimo datos
    var valid_to = []; // pasibaigimo datos

    var w; // laiku lenteles plotis, gausim atkoduodami reisu pradzias
    var h; // laiku lenteles aukstis;

    var times = encoded_data.split(",");
    var i, prev_t;
    var i_max = times.length;

    var zero_ground = [], plus = "+", minus = "-";

    for (i = -1, w = 0, h = 0, prev_t = 0; ++i < i_max;) { // atkoduojam reisu pradzios laikus
        var t = times[i];

        if (t === "") { //pasibaige reisu pradzios
            break;
        }

        var tag = t.charAt(0);
        if (tag === plus || (tag === minus && t.charAt(1) === "0")) {
            zero_ground[i] = "1";
        }

        prev_t += +(t);
        timetable[w++] = prev_t;
    }

    for (var j = zero_ground.length; --j >= 0;) {
        if (!zero_ground[j]) {
            zero_ground[j] = "0";
        }
    }

    // atkoduojame isigaliojimo datas
    for (var j = 0; ++i < i_max;) {
        var day = +(times[i]); // skaitom isigaliojimo data
        var k = times[++i]; // kiek kartu pakartoti

        if (k === "") { // pabaiga
            k = w - j; // irasysim reiksme i likusius elementus
            i_max = 0; // kad iseitu is atkodavimo ciklo
        } else {
            k = +(k);
        }

        while (k-- > 0) {
            valid_from[j++] = day;
        }
    }

    // atkoduojame pasibaigimo datas
    --i;

    for (var j = 0, i_max = times.length; ++i < i_max;) {
        var day = +(times[i]); // pasibaigimo data
        var k = times[++i]; // kiek kartu pakartoti

        if (k === "") { // pabaiga
            k = w - j; // irasysim reiksme i likusius elementus
            i_max = 0; // kad iseitu is atkodavimo ciklo
        } else {
            k = +(k);
        }

        while (k-- > 0) {
            valid_to[j++] = day;
        }
    }

    // atkoduojame savaites dienas
    --i;

    for (var j = 0, i_max = times.length; ++i < i_max;) {
        var weekday = times[i]; // skaitom savaites dienas
        var k = times[++i]; // kiek kartu pakartoti

        if (k === "") { // pabaiga
            k = w - j; // irasysim savaites dienas i likusius elementus
            i_max = 0; // kad iseitu is savaites dienu atkodavimo cikla
        } else {
            k = +(k);
        }

        while (k-- > 0) {
            weekdays[j++] = weekday;
        }
    }

    // atkoduojame vaziavimo laikus iki sekancios stoteles kiekviename reise
    --i;
    h = 1;

    for (var j = w, w_left = w, dt = 5, i_max = times.length; ++i < i_max;) {
        dt += +(times[i]) - 5; // vaziavimo laikas nuo ankstesnes stoteles
        var k = times[++i]; // kiek reisu tinka tas pats vaziavimo laikas

        if (k !== "") { // ne visiems likusiems reisams
            k = +(k);
            w_left -= k; // kiek liko neuzpildytu lenteles elementu eiluteje
        } else {
            k = w_left; // vaziavimo laikas tinka visiems likusiems reisams
            w_left = 0;
        }

        while (k-- > 0) {
            timetable[j] = dt + timetable[j - w]; // jei lentele vienmatis masyvas
            ++j;
        }

        if (w_left <= 0) {
            w_left = w; // vel nustatome, kad neuzpildytas visas lenteles plotis sekancioje eiluteje
            dt = 5; // pradinis laiko postumis +5 sekanciai eilutei
            ++h;
        }
    }

    const  final_data = {
        workdays: weekdays,
        times: timetable,
        tag: zero_ground.join(""),
        valid_from: valid_from,
        valid_to: valid_to
    };

    return final_data;
}


export default getTimes;

