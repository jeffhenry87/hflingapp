app.controller('UserController', ['$rootScope','$scope','$location' ,'HttpService', '$window', function( $rootScope,$scope,$location,HttpService, $window ){
    var vm = this;

    $rootScope.pageTitle = "Healthy Fling";

    $rootScope.loading = true;

    vm.currentPage = 0;
    vm.pageSize = 10;

     vm.post = function () {
        $location.path('/post');
    };

    vm.dashboard = function () {
      $location.path('/');
    };

    vm.logout = function () {
        $location.path('/login');
    };
    vm.users = function () {
        $rootScope.loading = true;
        vm.dataLoading = true;
        $location.path('/users');
    };
    vm.flagged_search = function () {
        $rootScope.search.state = vm.state;
        $rootScope.search.region = vm.region;
        $rootScope.search.category = vm.category;
        $rootScope.search.status = "flagged";

        this.reloadSearch();
        $location.path('/search');
    };

    vm.pages = function () {
        $rootScope.loading = true;
        vm.dataLoading = true;
        $location.path('/pages');
    };

    vm.pagePosts = function () {
        $rootScope.loading = true;
        vm.dataLoading = true;
        $location.path('/pagePosts');
    };

    $scope.block = function(email) {
        HttpService.Block({email: email})
        .then(function(response){
            $scope.initController();
        })
    }

    $scope.unblock = function(email) {
        HttpService.Unblock({email: email})
        .then(function(response){
            $scope.initController();
        })
    }

    $scope.initController = function () {

        $rootScope.loading = true;
        HttpService.GetUsers()
        .then(function(response){
            if (response.status == '200') {
                $rootScope.loading = false;
                $scope.data = response.data;
            }else{
                vm.dataLoading = false;
                $location.path('/');
                $rootScope.loading = false;
            };

        });

    }

}]);
