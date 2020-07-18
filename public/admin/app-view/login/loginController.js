app.controller('LoginController',['$rootScope','$scope','$location' ,'HttpService', '$window', 'AuthenticationService', 'FlashService', function($rootScope, $scope, $location ,HttpService, $window, AuthenticationService, FlashService){
    (function initController() {
        // reset login status
        AuthenticationService.ClearCredentials();
    })();

}]);
