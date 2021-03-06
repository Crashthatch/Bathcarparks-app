angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('ListingCtrl', function($scope, $http, $interval) {
  $scope.carparks = [];

  $scope.refreshCarparks = function(){
    $scope.error = '';

    $http.get('https://data.bathhacked.org/resource/u3w2-9yme.json').then(function(response){
      $scope.carparks = response.data;

      //Calculate the spaces and the address without carpark name (since that is shown above).
      $scope.carparks.forEach( function(carpark){
        var utc = new Date(carpark.lastupdate);
        carpark.lastupdate = new Date(utc.getTime() + utc.getTimezoneOffset()*60*1000); //Should test to make sure this works in Winter / from other countries.
        //Validation. The data from the datastore can be timestamps in the future (wrong time on the council server?)
        if( carpark.lastupdate > new Date() ){
          carpark.lastupdate = new Date();
        }


        carpark.description = carpark.description.split("/")
          .slice(1) //Remove the carpark name from the first line of the address since it's already shown above.
          .map(function(x){ return x.trim() } )
          .filter( function(x){ return (x != "CP" && x != "Bath" && x != "P+R"); })//Remove pointless address lines.
          .join(", ")

        //Limit spaces displayed to 0 < spaces < capacity < 1100.
        carpark.spaces = Math.max( Math.min( carpark.capacity, carpark.capacity - carpark.occupancy, 1100), 0);
      });

      //Sort by name because the API does not keep the same order all the time.
      $scope.carparks.sort( function(a,b){
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      });

      $scope.$broadcast('scroll.refreshComplete');
    }, function(err){
      console.error(err);
      $scope.error = "Could not load parking counts. "+err.statusText;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.toggleDetails = function(carpark){
    if( $scope.openCarparkName == carpark.name ){
      $scope.openCarparkName = null;
    }
    else{
      $scope.openCarparkName = carpark.name;
    }
  }

  //Update once a minute.
  $interval( $scope.refreshCarparks, 60000 );

  $scope.refreshCarparks();
})