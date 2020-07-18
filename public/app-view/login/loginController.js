app.controller('LoginController', ['$rootScope','$scope', 'HttpService', 'FlashService','$window', function( $rootScope, $scope, HttpService, FlashService, $window ){
	$scope.user = {};
	$scope.sign = true;
	var signed = function(user){
		$scope.closeModal();
		$rootScope.user = user;
		localStorage.setItem('user', JSON.stringify(user))
	}
	$scope.toggle = function(){
		$scope.sign = !$scope.sign;
	}
	var confirm = function(){
		if(!$scope.user.password) {
			return alert("Please fill your password");
		}
		if(!$scope.user.code) {
			return alert("Please fill code from the email which you received");
		}
		if($scope.verify=='sign'){
			HttpService.sign($scope.user, function(resp){
				if(resp.message){
					alert(resp.message);
				}else{
					signed($scope.user);
				}
			});
		}else{
			HttpService.change($scope.user, function(resp){
				if(resp.message=='done'){
					HttpService.login($scope.user, signed);
				}else if(resp.message=='wrong'){
					alert('Wrong code from email.');
					$scope.user.code = '';
				}else{
					$scope.verify = false;
					$scope.user.code = '';
					$scope.submit();
				}
			});
		}
	}
	var validateEmail = function(email) {
		var re = /\S+@\S+\.\S+/;
		return re.test(email);
	}
	$scope.submit = function(){
		if($scope.verify){
			return confirm();
		}
		if(!$scope.user.email) {
			return alert("Please fill your email");
		}
		if(!validateEmail($scope.user.email)) {
			return alert("Seems like your email is incorect");
		}
		if(!$scope.sign){
			return HttpService.request($scope.user, function(resp){
				if(resp == 'false'){
					alert('Oops: That email doesnt exist in our system');					
				}else{
					alert('Please check your email for the reset code');
					$scope.verify = true;
				}
			});
		}
		if(!$scope.user.password) {
			return alert("Please fill your password");
		}

		HttpService.status($scope.user, function(resp){
			if(resp.user){
				signed(resp.user);
			}else if(!resp.email){
				$scope.verify = 'sign';
				alert('Please check your email for the sign up code');
			}else if(resp.force){
				$scope.verify = true;
			}else if(!resp.pass){
				alert('Password doesnt match with email');
				$scope.user.password = '';
			}else{
				HttpService.login($scope.user, signed);
			}
		});
	};
	$scope.closeModal = function(){
		$rootScope.modalInstance.close();
	}
}]);
