const https = require("https");
const http = require("http");
//const fetch = require("fetch")
    
let icao = 'KF45';
let url =  'https://avwx.rest/api/metar/' + icao + '?options=info,speech';




return new Promise((resolve, reject) => {
        https.get(url, res => {
            res.setEncoding('utf8');
            let body = "";
            res.on('data', data => {body += data;});
            res.on('end', () => {
                let response = JSON.parse(body);
                if (!response.Error.length) {
                    let speech = response.Speech;
                    let name = response.Info.Name;
                    let time = response.Time;
                    let output = 'METAR for ' + icao + ' as of ' + time + '. ' +speech;
                } else {
                    let output = response.Error
                }
                resolve(output);
                });
            res.on('error', (error) => {
                reject();
                console.log('Error calling the AVWX API: ${error}');
            });
        });
    });