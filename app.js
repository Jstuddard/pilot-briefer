const fetch = require('node-fetch');
const numberToWords = require('number-to-words');
const options = { headers: { 'X-API-KEY': '5a47bbf03f1bbf3bf7e05ef949' }};

var icao = 'f45';


//Get the Metar
//getMetarDecoded(icao);
//getAltimeterDecoded(icao);
//getCloudsDecoded(icao);
getCategoryDecoded(icao);

//Functions
function makeWords(input) {
  var spokenNumber = '';
  var digits = input.toString()
  d = digits.split('');
  for (i = 0; i < d.length; i++) {
    if (d[i] >= '0' && d[i] <= '9') {
      spokenNumber += numberToWords.toWords(d[i]);
      if (i < d.length-1) {
        spokenNumber += ' ';
      }
    }
  }
  return spokenNumber;
};

//decode the Winds
function decodeWinds(objMetar) {
  var winds = 'Winds ';
  winds += makeWords(objMetar.data[0].wind.degrees) +' at ' + objMetar.data[0].wind.speed_kts;
  if (objMetar.data[0].wind.gust_kts){
    winds += ' gusting to ' + objMetar.data[0].wind.gust_kts;
  };
  winds += '. ';
  return winds;
};

//Decode the Visibility
function decodeVisibility(objMetar) {
  var visibility = 'Visibility ';
  visibility += objMetar.data[0].visibility.miles + ' miles. ';
  return visibility;
};

//Decode the Temperature
function decodeTemp(objMetar) {
  var temp = 'Temperature ';
  if (objMetar.data[0].temperature) {
    temp += objMetar.data[0].temperature.celsius + '. ';
    return temp;
  }
};

//Decode the Dew Point
function decodeDew(objMetar) {
  var dew = 'Dewpoint ';
  if (objMetar.data[0].dewpoint) {
    dew += objMetar.data[0].dewpoint.celsius + '. ';
    return dew;
  }
};

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
};

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
  var clouds = ''
  if (objMetar.data[0].clouds) {
    clouds = 'Sky conditions '
    var i;
    for (i = 0; i < objMetar.data[0].clouds.length; i++) {
      clouds += objMetar.data[0].clouds[i].text + ' ' + objMetar.data[0].clouds[i].base_feet_agl + ' ';
    }
  }
  return clouds;
};

//Decode the Ceiling
function decodeCeiling(objMetar) {
  var ceiling = ''
  if (objMetar.data[0].ceiling) {
    var ceiling = 'Ceiling '
    ceiling += objMetar.data[0].ceiling.text + ' ' + objMetar.data[0].ceiling.feet_agl + '. ';
  }
  return ceiling;
};

//Decode the Flight Category
function decodeCategory(objMetar) {
  var category = ''
  if (objMetar.data[0].flight_category) {
    var category = 'Airfield is currently '
    switch(objMetar.data[0].flight_category) {
      case 'VFR':
        category += 'VFR. ';
        break;
      case 'MVFR':
        category += 'Marginal VFR. '
        break;
      case 'IFR':
        category += 'IFR. '
      case 'LIFR':
        category += 'Low IFR. '
    }
    return category;
  }
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.status + ' - ' + response.statusText);
    }
  return response;
};

function getMetarDecoded(icao) {
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
    return decodedSpeech;
  }).catch(function (error) {
    console.error(error);
  });
};

function getAltimeterDecoded(icao) {
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
    return decodedSpeech;
  }).catch(function (error) {
    console.error(error);
  });
};

function getCloudsDecoded(icao) {
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
    return decodedSpeech;
  }).catch(function (error) {
    console.error(error);
  });
};

function getCategoryDecoded(icao) {
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
    return decodedSpeech;
  }).catch(function (error) {
    console.error(error);
  });
};