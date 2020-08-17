app.controller('MyaccountController', ['$rootScope','$scope', '$location', 'HttpService', '$http','$window', 'FlashService', 'MetaService', '__env', function( $rootScope,$scope,$location,HttpService,$http,$window,FlashService, MetaService, __env ){
    var vm = this;

    $rootScope.metaservice = MetaService;
    $rootScope.metaservice.set();

    let statusStyle = {
        "background-color": "aqua", 
        "max-width": "60px", 
        "padding": "4px", 
        "color": "white",
		"text-align": 'center'
    };

    $scope.getStatusStyle = function(item) {
        switch(item.status.toLowerCase()) {
            case __env.status.ACTIVE:
                if(isExpired(item.created)) {
                    statusStyle['background-color'] = '#7f7f7f';
                    break;
                }
                statusStyle['background-color'] = '#22b14c';//env
                break;
            case __env.status.FLAGGED:
                statusStyle['background-color'] = '#ed1c24';//env
                break;
            case __env.status.INACTIVE:
                statusStyle['background-color'] = "#00a2e8";//env
                break;
            default:
                statusStyle['background-color'] = '#7f7f7f';//env
                break;
        }
        return statusStyle;
    }

    $scope.changeCase = function(item) {
        
        if(item.status == __env.status.INACTIVE) {
            return __env.status.DELETED[0].toUpperCase() + __env.status.DELETED.substring(1);
        }

        if(item.status == __env.status.ACTIVE) { 
            if(isExpired(item.created)) {
                return __env.status.EXPIRED[0].toUpperCase() + __env.status.EXPIRED.substring(1);
            } else {
                return __env.status.LIVE[0].toUpperCase() + __env.status.LIVE.substring(1);
            }
        }

        return item.status[0].toUpperCase() + item.status.substring(1);
    }

    var isExpired = function(createdDate) {
        // let date = new Date().getTime();
        // let cDate = new Date(createdDate).getTime();
        // let difDate = (date - cDate)/(1000*60*60*24);
        if($scope.diffDate(createdDate) > __env.expirationDays) {
            return true;
        }

        return false;
    }

    $scope.diffDate = function(date1) {
      var dateFirst = new Date(date1);
      var dateSecond = new Date();

      // time difference
      var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());

      // days difference
      return (Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }

    $scope.createPage = function() {
        if (!$rootScope.user) {
            return alert("You need to be logged in!");
        }
    }

    $rootScope.pageTitle = "Healthy Fling";

    $scope.countries = $rootScope.countryList;
    $scope.states = $rootScope.stateList;
    $scope.regions = $rootScope.regionList;

    $rootScope.savedPreference = $window.localStorage.getItem("healthyfling_preference");

    if ($rootScope.savedPreference == "locked") {
        $rootScope.search.country = $window.localStorage.getItem("healthyfling_preference_country") || "Country";
        $rootScope.search.state = $window.localStorage.getItem("healthyfling_preference_state") || "State";
        $rootScope.search.region = $window.localStorage.getItem("healthyfling_preference_region") || "Region";
        $rootScope.search.category = $window.localStorage.getItem("healthyfling_preference_category") || "Category";
    }

    $scope.savedPreference = ($rootScope.savedPreference == "locked");
    vm.savedPreference = ($rootScope.savedPreference == "locked");

    if ($scope.regions && $scope.regions.indexOf("Region") == -1){
        $scope.regions.unshift("Region");
    }

    $scope.categories = $rootScope.categoryList;

    $scope.changeListInCtrl = function(data){
        if(data != "" && data != undefined && data != "State" && data != "Provinces"){
            $rootScope.regionList = $rootScope.masterList[data];

            $scope.regions = $rootScope.regionList;
            $scope.regions.unshift("Region");
            var temp = $scope.regions;
            $scope.regions = temp.filter(function(item, pos){
              return temp.indexOf(item)== pos;
            });
        }else{
            if (vm.country == "United States" || vm.country == "Canada") {
                $scope.regions = ['Region'];
            }
        }
   };

   $scope.changeStateListInCtrl = function(data){
        if(data != "" && data != undefined && data != "Country"){
            $rootScope.masterList = $rootScope.masterListAll[data];
            $rootScope.stateList = Object.keys($rootScope.masterListAll[data]);
            $scope.states = $rootScope.stateList;
            // $rootScope.regionList = $rootScope.masterListAll[data];

            if (data != "United States" && data != "Canada") {
                $rootScope.regionList = $rootScope.masterList["State"];
                $scope.regions = $rootScope.regionList;
                $scope.regions.unshift("Region");
                var temp = $scope.regions;
                $scope.regions = temp.filter(function(item, pos){
                  return temp.indexOf(item)== pos;
                });
            }else if(data == "Canada"){

                vm.state = "Provinces";
            }
        }else{
            // $scope.regions = ['Region'];
        }
   };

    $rootScope.loading = true;

    $rootScope.adPosts = {};

    // vm.currentPage = 0;
    var path = $location.search();

    vm.currentPage = path.page || 0;
    vm.pageSize = 100;

    vm.country = $rootScope.search.country || "Country";
    vm.state = $rootScope.search.state || "State";
    vm.region = $rootScope.search.region || "Region";
    vm.category = $rootScope.search.category || "Category";

     vm.post = function () {
        $location.path('/post');
    };

    vm.pages = function () {
        vm.dataLoading = true;
        $location.path('/pages');
    };

    vm.login = function () {
        $rootScope.modalInstance = $modal.open({
           templateUrl: 'app-view/login/LoginView.html'
       });
    };

    vm.logout = function () {
        vm.dataLoading = true;

        // remove token from localstorage
        $window.localStorage.removeItem("token");

        $location.path('/');
        window.location.reload();
    };


    vm.lockPreference = function () {
        $window.localStorage.setItem("healthyfling_preference","locked");
        $window.localStorage.setItem("healthyfling_preference_country",vm.country);
        $window.localStorage.setItem("healthyfling_preference_state",vm.state);
        $window.localStorage.setItem("healthyfling_preference_region",vm.region);
        $window.localStorage.setItem("healthyfling_preference_category",vm.category);
        $rootScope.savedPreference = true;
        vm.savedPreference = true;
        $scope.savedPreference = "locked";
        FlashService.Success("Search preference saved for easier browsing.");

    };

    vm.unlockPreference = function () {
        $window.localStorage.setItem("healthyfling_preference","unlocked");

        vm.country = $rootScope.search.country = "Country";
        vm.state = $rootScope.search.state = "State";
        vm.region = $rootScope.search.region = "Region";
        vm.category = $rootScope.search.category = "Category";

        $rootScope.savedPreference = false;
        vm.savedPreference = false;
        $scope.savedPreference = "unlocked";
        FlashService.Success("Search preference has been deleted.");

    };

    vm.search = function () {
        $rootScope.search.country = vm.country;
        $rootScope.search.state = vm.state;
        $rootScope.search.region = vm.region;
        $rootScope.search.category = vm.category;

        $location.path('/search');
    };


    $scope.initController = function () {
        $rootScope.loading = true;
        HttpService.GetPersonalPosts()
        .then(function(response){

            if (response.status == '200') {
                $rootScope.visitedSearchPage = true;
                
                $rootScope.adPosts.data = [];

                for(var i = 0;i<response.data.length;i++){
                    $rootScope.adPosts.data.push(response.data[i]);
                    
                }

                $rootScope.refreshAds();
                $rootScope.loading = false;
            }else{
                vm.dataLoading = false;
                $location.path('/');
                $rootScope.loading = false;
            };

        });

    }

}]);

app.controller("AdssController",['$scope','$rootScope','$location','HttpService', function ($scope,$rootScope,$location,HttpService) {
    var vm = {};
    vm.state = $rootScope.search.state;
    vm.region = $rootScope.search.region;
    vm.category = $rootScope.search.category;
    $scope.pagename = "Personal";
    $scope.PN_color = { "color" : "#f80101", };
    $scope.is_setting = false;
    $scope.my_mail = $rootScope.user.email;
    $scope.pwd = '';
    $scope.confirm_pwd = '';

    $rootScope.loading = true;
  
    $rootScope.currentPost = {};
  
     $rootScope.viewDetail = function(data){
  
          $rootScope.currentPost.data = data;
          $location.path("/detail/"+data['_id']);
     }
  
    $rootScope.refreshAds = function(){
  
      HttpService.GetPersonalPosts()
      .then(function(response){

        if (response.status == '200') {
              $rootScope.adPosts.data = [];
  
              if($rootScope.search.region != "Region" && $rootScope.search.region != ""){
                  $rootScope.pageTitle = $rootScope.search.region;
              }else{
                  $rootScope.pageTitle = "All Regions";
              }
  
              for(var i = 0;i<response.data.length;i++){
                  $rootScope.adPosts.data.push(response.data[i]);
              }
  
              $rootScope.loading = false;
          }else{
              $rootScope.loading = false;
              vm.dataLoading = false;
              $location.path('/');
          };
  
      });
  
        $scope.data = $rootScope.adPosts.data.reverse();
  
    }

    $scope.selectPage = function(selectedpage){
        if (selectedpage == "personal") {
            $scope.pagename = "Personal";
            $scope.PN_color = { "color" : "#f80101", }
            $scope.PG_color = { "color" : "#000", }
            $scope.S_color = { "color" : "#000", }
            $scope.is_setting = false;

            $scope.initController();
        } else if (selectedpage == "pages") {
            $scope.pagename = "Pages";
            $scope.PN_color = { "color" : "#000", }
            $scope.PG_color = { "color" : "#f80101", }
            $scope.S_color = { "color" : "#000", }
            $scope.is_setting = false;

            $scope.get_my_post();
        } else {
            $scope.pagename = "Settings";
            $scope.PN_color = { "color" : "#000", }
            $scope.PG_color = { "color" : "#000", }
            $scope.S_color = { "color" : "#f80101", }
            $scope.is_setting = true;

        }
    }

    $scope.get_my_post = function() {
        $rootScope.loading = true;
        HttpService.GetMyPagesPosts()
        .then(function(response){

            if (response.status == '200') {
                $rootScope.visitedSearchPage = true;
                
                $rootScope.adPosts.data = [];

                for(var i = 0;i<response.data.length;i++){
                    $rootScope.adPosts.data.push(response.data[i]);
                    
                }
                HttpService.GetMyPagesPosts()
                .then(function(response){
        
                    if (response.status == '200') {
                        $rootScope.adPosts.data = [];
            
                        if($rootScope.search.region != "Region" && $rootScope.search.region != ""){
                            $rootScope.pageTitle = $rootScope.search.region;
                        }else{
                            $rootScope.pageTitle = "All Regions";
                        }
            
                        for(var i = 0;i<response.data.length;i++){
                            $rootScope.adPosts.data.push(response.data[i]);
                        }
            
                        $rootScope.loading = false;
                    }else{
                        $rootScope.loading = false;
                        vm.dataLoading = false;
                        $location.path('/');
                    };
            
                });

                $scope.data = $rootScope.adPosts.data.reverse();
                $rootScope.loading = false;
            }else{
                vm.dataLoading = false;
                $location.path('/');
                $rootScope.loading = false;
            };

        });
    }
    
    $scope.setting_save = function () {
        if( $scope.pwd == "" ){
            alert("Password is not valid");return;
        } else if ( $scope.confirm_pwd == "" ) {
            alert("Comfirm Password is not valid");return;
        } else if ( $scope.confirm_pwd !== $scope.pwd ) {
            alert("Password doesn't match confimation");return;
        }

        $rootScope.loading = true;
        var pageData = {
            pwd : $scope.pwd,
            email: $rootScope.user.email
        }
            
		HttpService.resetSetting(pageData, function(response){
            if (response == 'true') {
                $rootScope.loading = false;
                // alert("Password changed successfully.");
                
            } else {
                $rootScope.loading = false;
                vm.dataLoading = false;
                $location.path('/');
            }
		});
    }
  
  }]);
  
app.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        if (input) {
            return input.slice(start);
        }else{
            return 0;
        }

    }
});