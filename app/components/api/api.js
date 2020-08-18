var angular = require('angular');

angular.module('api', [])
.service('ApiService', ['$http', function ($http) {

  var RRC_BASE_URL = '/api/v2/raster-aggregates/?' +
    'agg=rrc&' +
    'geom=POINT+({lng}+{lat})&' +
    'rasters={uuid}&' +
    'srs=EPSG:4326&' +
    'start={start_date}&' +
    'stop={stop_date}&' +
    'window=1200000';

  var redirect = function () {
    // Comment out the next 2 lines to prevent the redirect for development.
    // They should be uncommented when merging to master and putting it on staging/ master.
    // window.location.href = '//' + window.location.host +
    //     '/accounts/login/?next=' + window.location.href;
  };

  var rainRecurrence = function (location, uuid, date) {
    var url = RRC_BASE_URL
    .replace('{lng}', location.geometry.lng)
    .replace('{lat}', location.geometry.lat)
    .replace('{start_date}', date.start)
    .replace('{stop_date}', date.stop)
    .replace(/\{uuid\}/g, uuid);
    return $http.get(url, {withCredentials: true}).then(function (response) {
      if (response.data.data === null) {
        redirect();
      } else {
        return response.data.data
      }
    }, redirect);
  };

  var RAIN_BASE_URL = '/api/v2/raster-aggregates/?agg=average&geom='
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
    var url = RAIN_BASE_URL
    .replace('{start}', year - 1) // year starts a few hours before our year -- timezones
    .replace('{stop}', year) // year starts a few hours before our year -- timezones
    .replace(/\{north\}/g, north)
    .replace(/\{south\}/g, south)
    .replace(/\{east\}/g, east)
    .replace(/\{west\}/g, west)
    .replace(/\{uuid\}/g, uuid);
    return $http.get(url, {withCredentials: true}).then(function (response) {
      if (response.data.data === null) {
        redirect();
      } else {
        return response.data.data;
      }
    }, redirect);
  };

  return {
    rainRecurrence: rainRecurrence,
    getMonthlyRain: getMonthlyRain
  }
}]);
