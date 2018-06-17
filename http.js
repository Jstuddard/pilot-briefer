'use strict';

const https = require("https");
const http = require("http");
const numberToWords = require('number-to-words');

// Set custom headers for CheckWX API
  // const options = { headers: { 'X-API-KEY': '5a47bbf03f1bbf3bf7e05ef949' }};
  var icao = 'KPBI'
  var url = 'https://api.checkwx.com/metar/' + icao + '/decoded';
  var options = {
    host: 'api.checkwx.com',
    path: '/metar/' + icao + '/decoded',
    //This is the only line that is new. `headers` is an object with the headers to request
    headers: { 'X-API-KEY': '5a47bbf03f1bbf3bf7e05ef949' }
  };
  // Call the weather API
  fetchMetar(icao).then((output) => {
    // Return the results of the weather API to Dialogflow
    console.log(output);
    //agent.add(output);
  }).catch((error) => {
    // If there is an error let the user know
    console.log(error);
    //agent.add(error);
  });


function fetchMetar (icao) {
  return new Promise((resolve, reject) => {
    var decodedSpeech = '';
    // Create the path for the HTTP request to get the weather
    console.log('API Request: ' + url);
    // Make the HTTP request to get the weather
    https.get(options, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let jsonMetar = JSON.parse(body);
        decodedSpeech = decodedSpeech += jsonMetar.data[0].name + ' weather, ';
        // Resolve the promise with the output text
        console.log(decodedSpeech);
        resolve(decodedSpeech);
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}