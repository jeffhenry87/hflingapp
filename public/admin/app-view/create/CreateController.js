app.controller('CreateController', ['$rootScope','$scope','$location' ,'HttpService', '$window', function( $rootScope,$scope,$location,HttpService,$window ){
    var vm = this;
    vm.users = function () {
        $rootScope.loading = true;
        vm.dataLoading = true;
        $location.path('/users');
    };
    vm.testing = "Asdasdasdasda";
 }]);
