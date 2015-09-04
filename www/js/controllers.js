angular.module('gps.controllers', ['location-retriever'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
})
  .controller('RapidCtrl', function($scope, GPSRetrieval){
    $scope.data = {
      positions: []
    };

    var MAX = 5;

    var watchId = null;
    var service = null;
    var startService=  null, stopService = null;

    var basicWrapper = function(callback) {
      startService = stopService = function(){};

      callback();
    };

    var continuousWrapper = function(callback) {
      startService =  ($scope.data.webview) ? GPSRetrieval.startWebviewWatch : GPSRetrieval.startNativeWatch;
      stopService = ($scope.data.webview) ? GPSRetrieval.stopWebviewWatch : GPSRetrieval.stopNativeWatch;
      var firstTime = true;

      watchId = startService().then(null, null, function(){
        if (firstTime) {
          firstTime = false;
          callback();
        }
      });
    };

    $scope.rapidFire = function(){
      service =  ($scope.data.webview) ? GPSRetrieval.getWebviewGPS : GPSRetrieval.getNativeGPS;

      var wrapperFn = ($scope.data.turnOnWatch) ? continuousWrapper : basicWrapper;

      $scope.data.positions = [];
      wrapperFn(function() {
        runRetrieval(0, function (position) {
          $scope.data.positions.push(position);
        }, function () {
          console.log('done');
          console.log('Finished retrieving at '+Date.now());
          stopService(watchId);
        });
      });
    };

    function runRetrieval(counter, notify, resolve) {
      console.log('Retrieving Position #'+counter +' at '+Date.now());
      service().then(function (position) {
        notify(position);
        if (counter < MAX) {
          counter += 1;
          runRetrieval(counter, notify, resolve);
        } else {
          resolve();
        }
      })
    }
  })

  .controller('ContinuousCtrl', function($scope, GPSRetrieval) {
    $scope.data = {
      started: false
    };

    $scope.start = function(){
      GPSRetrieval.startNativeWatch().then(function(){
        $scope.data.nativeStop = false;
      }, function(err){
        $scope.data.error = err;
        $scope.data.nativeStop = false;
      }, function(position){
        $scope.data.nativeStop = true;
        $scope.data.nativePosition = position;
        $scope.data.nativecoords = position.coords;
      });

      GPSRetrieval.startWebviewWatch().then(function(){
        $scope.data.webviewStop = false;
      }, function(err){
        $scope.data.error = err;
        $scope.data.webviewStop = false;
      }, function(position){
        $scope.data.webviewStop = true;
        $scope.data.webviewPosition = position;
        $scope.data.webviewcoords = position.coords;
      });
    };

    $scope.stopNative = function (){
      GPSRetrieval.stopNativeWatch();
    };

    $scope.stopWebview = function(){
      GPSRetrieval.stopNativeWatch();
    }

    $scope.stop = function(){};

    $scope.getNativeGPS = function(){
      $scope.data.retrieving = true;
      $scope.data.position = null;
      GPSRetrieval.getNativeGPS().then(function(position){
        $scope.data.position = position;
      })
        .catch(function(err){
          $scope.error = err.message;
        })
        .finally (function(){
        $scope.data.retrieving = false;
      });
    }
  })

.controller('SingleGPSCtrl', function($scope, LocationRetriever) {
    $scope.data = {};
    $scope.getGPS = function(){
      LocationRetriever.retrieveLocation().then(function(position){
        $scope.data.position = position;
      })
        .catch(function(err){
          $scope.error = err.message;
        })
        .finally (function(){
        $scope.data.retrieving = false;
      });
    };

    /*$scope.getNativeGPS = function(){
      $scope.data.retrieving = true;
      $scope.data.nativePosition = null;
      GPSRetrieval.getNativeGPS().then(function(position){
        $scope.data.nativePosition = position;
      })
        .catch(function(err){
          $scope.error = err.message;
        })
        .finally (function(){
        $scope.data.retrieving = false;
      });
  }

    $scope.getWebviewGPS = function(){
      $scope.data.retrieving = true;
      $scope.data.webviewPosition = null;
      GPSRetrieval.getWebviewGPS().then(function(position){
        $scope.data.webviewPosition = position;
      })
        .catch(function(err){
          $scope.error = err.message;
        })
        .finally (function(){
        $scope.data.retrieving = false;
      });
    }*/
});
