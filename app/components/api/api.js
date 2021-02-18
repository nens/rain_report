var angular = require('angular');

angular.module('api', [])
.service('ApiService', ['$http', function ($http) {

  var RRC_BASE_URL = '/api/v3/raster-aggregates/?' +
    'agg=rrc&' +
    'geom=POINT+({lng}+{lat})&' +
    'rasters={uuid}&' +
    'srs=EPSG:4326&' +
    'start={start_date}&' +
    'stop={stop_date}&' +
    'window=1200000';

  $http.get("/bootstrap/lizard/", {withCredentials: true}).then(function (data) {
    if (data && data.user && data.user.authenticated === true) {
      console.log('user logged in')
    } else {
      const nextUrl = window.location.href;
      window.location.href = `${data.sso.login}&next=${nextUrl}`;
    }
  }, function(){
    var urlRegion = window.location.host.split('.')[0];
    const nextUrl = window.location.href;
    if (urlRegion === "nxt3")  {
      urlRegion = window.location.host.split('.')[0] + "."  + window.location.host.split('.')[1];
    }
    window.location.href = `/auth/login/?domain=${urlRegion}&next=${nextUrl}`
  });

  var replaceUuid = function (preUrl, uuid) {
    // replace uuid with staging uuid if on staging
    var url = preUrl;
    if ((window.location.href+'').indexOf('staging') !== -1) {
      url = preUrl.replace(/\{uuid\}/g, "3e5f56a7-b16e-4deb-8449-cc2c88805159");
    } else {
      url = preUrl.replace(/\{uuid\}/g, uuid);
    }
    return url;
  }

  var rainRecurrence = function (location, uuid, date) {
    var preUrl = RRC_BASE_URL
    .replace('{lng}', location.geometry.lng)
    .replace('{lat}', location.geometry.lat)
    .replace('{start_date}', date.start)
    .replace('{stop_date}', date.stop);

    var url = replaceUuid(preUrl, uuid);

    return $http.get(url, {withCredentials: true}).then(function (response) {
      return response.data.data
    });
  };

  var RAIN_BASE_URL = '/api/v3/raster-aggregates/?agg=average&geom='
  + 'POLYGON(('
  + '{west}+{south},+'
  + '{east}+{south},+'
  + '{east}+{north},+'
  + '{west}+{north},+'
  + '{west}+{south}))&'
  + 'rasters={uuid}&'
  + 'srs=EPSG:4326&'
  + 'start={start}-12-31T23:00:00&'
  + 'stop={stop}-12-31T23:00:00&'
  + 'window=2635200000';



  var getMonthlyRain = function (bounds, year, uuid) {
    var north = bounds._northEast.lat;
    var east = bounds._northEast.lng;
    var south = bounds._southWest.lat;
    var west = bounds._southWest.lng;
    var preUrl = RAIN_BASE_URL
    .replace('{start}', year - 1) // year starts a few hours before our year -- timezones
    .replace('{stop}', year) // year starts a few hours before our year -- timezones
    .replace(/\{north\}/g, north)
    .replace(/\{south\}/g, south)
    .replace(/\{east\}/g, east)
    .replace(/\{west\}/g, west);

    var url = replaceUuid(preUrl, uuid);

    return $http.get(url, {withCredentials: true}).then(function (response) {
      return response.data.data;
    });
  };

  return {
    rainRecurrence: rainRecurrence,
    getMonthlyRain: getMonthlyRain,
  }
}]);
