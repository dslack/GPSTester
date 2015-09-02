angular.module('gps.services',[])
  .factory('GPSRetrieval', function($q){

    var NATIVE = (ionic.Platform.isAndroid()) ? GPSLocation : navigator.geolocation;

    var OPTS = {enableHighAccuracy: true};

    var watchIds = {
      native: {}, webview: {}
    };

    var api = {
      getNativeGPS : getNativeGPS,
      getWebviewGPS: getWebviewGPS,
      startNativeWatch: startNativeWatch,
      stopNativeWatch: stopNativeWatch,
      startWebviewWatch: startWebviewWatch,
      stopWebviewWatch: stopWebviewWatch
    };

    return api;

    function getNativeGPS() {
      return getGPS(NATIVE);
    }

    function getWebviewGPS(){
      return getGPS(navigator.geolocation);
    }

    function startNativeWatch() {
      return startWatch(NATIVE, "native");
    }

    function stopNativeWatch() {
      NATIVE.clearWatch(watchIds.native.watchId);
      watchIds.native.promise.resolve();
    }

    function startWebviewWatch() {
      return startWatch(navigator.geolocation, "webview");
    }

    function stopWebviewWatch() {
      navigator.geolocation.clearWatch(watchIds.webview.watchId);
      watchIds.webview.promise.resolve();
    }

    function getGPS(service) {
      return $q(function(resolve, reject){
        service.getCurrentPosition(function(position){
          resolve(position);
        }, function(err) {
          reject(err);
        }, OPTS)
      });
    }

    function startWatch(service, watchName){
      var deferred = $q.defer();
      var firstTime = null;
      watchIds[watchName].promise = deferred;
      watchIds[watchName].watchId = service.watchPosition(function(position){
        deferred.notify(position);
      }, function(err){
        deferred.reject();
      }, OPTS);

      return deferred.promise;
    }
  });
