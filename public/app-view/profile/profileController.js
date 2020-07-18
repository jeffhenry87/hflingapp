app.controller("ProfileController", [
  "$rootScope",
  "$location",
  "$scope",
  "$http",
  "$modal",
  function($rootScope, $location, $scope, $http, $modal) {
    if(!$rootScope.user) return $location.path('/');
    $scope.user = {};
    $scope.changePassword = function(){
      if(!$scope.user.oldPass) {
        return alert("Please fill your old password");
      }
      if(!$scope.user.newPass) {
        return alert("Please fill your new password");
      }
      $http.post('/api/user/changePassword', $scope.user).then(function(resp){
        if(resp.data){
          alert('Your password has been changed successfully');
        }else{
          alert('Your old password is incorrect');
        }
      });  
    };
  	$scope.posts = [];
    $scope.pages = [];
  	$http.get('/api/post/get').then(function(resp){
      if(resp.data=='false') resp.data=false;
  		$scope.posts = resp.data || [];
  		$scope.posts.sort(function(a, b){
  			if(a.created<b.created) return 1;
  			return -1;
  		});
  	});
    $http.get('/api/page/get').then(function(resp){
      if(resp.data=='false') resp.data=false;
      $scope.pages = resp.data || [];
      $scope.pages.sort(function(a, b){
        if(a.created<b.created) return 1;
        return -1;
      });
    });
  	$scope.tab = 1;
  	$scope.set_tab = function(tab){
  		$scope.tab = tab;
  	};
  	$scope.show_new = true;
  	$scope.toggle_new = function(){
  		$scope.show_new = !$scope.show_new;
  	};
    $scope.delete = function(post) {
      if (confirm('Are you sure that you want to delete this post?')) {
        $http.post('/api/post/delete', post);
      }
    };
    $scope.deletePage = function(page) {
      if (confirm('Are you sure that you want to delete this post?')) {
        $http.post('/api/page/delete', page);
      }
    };
  }
]);
