// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Dialogflow fulfillment getting started guide:
// https://dialogflow.com/docs/how-tos/getting-started-fulfillment

'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

const fetch = require('node-fetch');
const numberToWords = require('number-to-words');

// Set custom headers for CheckWX API
const options = { headers: { 'X-API-KEY': '5a47bbf03f1bbf3bf7e05ef949' }};

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  var icao = request.body.queryResult.parameters.airport.ICAO;
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

// Intent Functions
  function welcome (agent) {
      agent.add(`Welcome to Pilot Briefer!`);
  }

  function fallback (agent) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
  }

  function getMetarDecoded(agent) {
    var decodedSpeech = '';
    var url = 'https://api.checkwx.com/metar/' + icao + '/decoded';
    fetch(url, options)
      .then(handleErrors)
      .then(function(response) {
        return response.json();
    }).then(function(metar) {
      if (typeof metar.data[0] == 'object') {
        decodedSpeech = decodedSpeech += metar.data[0].name + ' weather, ';
        decodedSpeech = decodedSpeech += metar.data[0].observed + '. ';
        decodedSpeech = decodedSpeech += decodeWinds(metar);
        decodedSpeech = decodedSpeech += decodeVisibility(metar);
        decodedSpeech = decodedSpeech += decodeTemp(metar);
        decodedSpeech = decodedSpeech += decodeDew(metar);
        decodedSpeech = decodedSpeech += decodeAltimeter(metar);
        decodedSpeech = decodedSpeech += decodeConditions(metar);
        decodedSpeech = decodedSpeech += decodeClouds(metar);
      } else {
        decodedSpeech = metar.data[0];
      }
      console.log(decodedSpeech);
      agent.add(decodedSpeech);
      return decodedSpeech;
    }).catch(function (error) {
      agent.add(error);
      console.error(error);
    });
  }

  function getAltimeterDecoded(agent) {
    var decodedSpeech = '';
    var url = 'https://api.checkwx.com/metar/' + icao + '/decoded';
    fetch(url, options)
      .then(handleErrors)
      .then(function(response) {
        return response.json();
    }).then(function(metar) {
      if (typeof metar.data[0] == 'object') {
        decodedSpeech = decodedSpeech += decodeAltimeter(metar);
      } else {
        decodedSpeech = metar.data[0];
      }
      console.log(decodedSpeech);
      agent.add(decodedSpeech);
      return decodedSpeech;
    }).catch(function (error) {
      agent.add(error);
      console.error(error);
    });
  }

  function getCloudsDecoded(agent) {
    var decodedSpeech = '';
    var url = 'https://api.checkwx.com/metar/' + icao + '/decoded';
    fetch(url, options)
      .then(handleErrors)
      .then(function(response) {
        return response.json();
    }).then(function(metar) {
      if (typeof metar.data[0] == 'object') {
        decodedSpeech = decodedSpeech += decodeCeiling(metar);
        decodedSpeech = decodedSpeech += decodeClouds(metar);
        decodedSpeech = decodedSpeech += decodeConditions(metar);
      } else {
        decodedSpeech = metar.data[0];
      }
      console.log(decodedSpeech);
      agent.add(decodedSpeech);
      return decodedSpeech;
    }).catch(function (error) {
      agent.add(error);
      console.error(error);
    });
  }

  function getCategoryDecoded(agent) {
    var decodedSpeech = '';
    var url = 'https://api.checkwx.com/metar/' + icao + '/decoded';
    fetch(url, options)
      .then(handleErrors)
      .then(function(response) {
        return response.json();
    }).then(function(metar) {
      if (typeof metar.data[0] == 'object') {
        decodedSpeech = decodedSpeech += decodeCategory(metar);
        decodedSpeech = decodedSpeech += decodeCeiling(metar);
        decodedSpeech = decodedSpeech += decodeVisibility(metar);
      } else {
        decodedSpeech = metar.data[0];
      }
      console.log(decodedSpeech);
      agent.add(decodedSpeech);
      return decodedSpeech;
    }).catch(function (error) {
      agent.add(error);
      console.error(error);
    });
  }

// Utility Functions
function makeWords(input) {
  var spokenNumber = '';
  var digits = input.toString();
  var d = digits.split('');
  var i = 0;
  for (i = 0; i < d.length; i++) {
    if (d[i] >= '0' && d[i] <= '9') {
      spokenNumber += numberToWords.toWords(d[i]);
      if (i < d.length-1) {
        spokenNumber += ' ';
      }
    }
  }
  return spokenNumber;
}

//decode the Winds
function decodeWinds(objMetar) {
  var winds = 'Winds ';
  winds += makeWords(objMetar.data[0].wind.degrees) +' at ' + objMetar.data[0].wind.speed_kts;
  if (objMetar.data[0].wind.gust_kts){
    winds += ' gusting to ' + objMetar.data[0].wind.gust_kts;
  }
  winds += '. ';
  return winds;
}

//Decode the Visibility
function decodeVisibility(objMetar) {
  var visibility = 'Visibility ';
  visibility += objMetar.data[0].visibility.miles + ' miles. ';
  return visibility;
}

//Decode the Temperature
function decodeTemp(objMetar) {
  var temp = 'Temperature ';
  if (objMetar.data[0].temperature) {
    temp += objMetar.data[0].temperature.celsius + '. ';
    return temp;
  }
}

//Decode the Dew Point
function decodeDew(objMetar) {
  var dew = 'Dewpoint ';
  if (objMetar.data[0].dewpoint) {
    dew += objMetar.data[0].dewpoint.celsius + '. ';
    return dew;
  }
}

//Decode the Altimeter
function decodeAltimeter(objMetar) {
  var altimeter = '';
  if (objMetar.data[0].barometer) {
    altimeter = 'Altimeter ' + makeWords(objMetar.data[0].barometer.hg);
    var checkAlt = altimeter.split(' ');
    if (checkAlt.length == 4) { //Means the trailing 0 was truncated
      altimeter = altimeter + ' zero. ';
    } else {
      altimeter = altimeter + '. ';
    }
  altimeter = altimeter.replace(/nine/gi,'niner');
  }
  return altimeter;
}

//Decode the Conditions
function decodeConditions(objMetar) {
  var conditions = '';
  if (objMetar.data[0].conditions) {
    conditions = 'Current conditions ';
    var i;
    for (i = 0; i < objMetar.data[0].conditions.length; i++) {
      conditions += objMetar.data[0].conditions[i].text + '. ';
    }
  }
  return conditions;
}

//Decode the Clouds
function decodeClouds(objMetar) {
  var clouds = '';
  if (objMetar.data[0].clouds) {
    clouds = 'Sky conditions ';
    var i;
    for (i = 0; i < objMetar.data[0].clouds.length; i++) {
      clouds += objMetar.data[0].clouds[i].text + ' ' + objMetar.data[0].clouds[i].base_feet_agl + ' ';
    }
  }
  return clouds;
}

//Decode the Ceiling
function decodeCeiling(objMetar) {
  var ceiling = '';
  if (objMetar.data[0].ceiling) {
    ceiling = 'Ceiling ';
    ceiling += objMetar.data[0].ceiling.text + ' ' + objMetar.data[0].ceiling.feet_agl + '. ';
  }
  return ceiling;
}

//Decode the Flight Category
function decodeCategory(objMetar) {
  var category = '';
  if (objMetar.data[0].flight_category) {
    category = 'Airfield is currently ';
    switch(objMetar.data[0].flight_category) {
      case 'VFR':
        category += 'VFR. ';
        break;
      case 'MVFR':
        category += 'Marginal VFR. ';
        break;
      case 'IFR':
        category += 'IFR. ';
        break;
      case 'LIFR':
        category += 'Low IFR. ';
        break;
    }
    return category;
  }
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.status + ' - ' + response.statusText);
  }
  return response;
}

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase inline editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://dialogflow.com/images/api_home_laptop.svg',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://docs.dialogflow.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Metar', getMetarDecoded);
  // intentMap.set('<INTENT_NAME_HERE>', googleAssistantHandler);
  agent.handleRequest(intentMap);
});