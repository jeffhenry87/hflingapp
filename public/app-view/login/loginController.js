app.controller('LoginController', ['$rootScope','$scope', 'HttpService', 'FlashService','$window', "__env", function( $rootScope, $scope, HttpService, FlashService, $window, __env ){
	$scope.user = {};
	$scope.sign = false;
	$scope.reset = false;
	$scope.rePassword = '';
	$scope.verify = false;
	$scope.resetPasswordConfirmation = false;

	var signed = function(user){
		$scope.closeModal();
		$rootScope.user = user;
		localStorage.setItem('user', JSON.stringify(user));
	}

	$scope.toggle = function(){
		$scope.sign = !$scope.sign;
		$scope.reset = false;
		$scope.verify = false;
	}

	// var confirm = function() {
	// 	if(!$scope.user.password) {
	// 		return alert("Please fill your password");
	// 	}

	// 	if($scope.verify == 'sign') {
	// 		HttpService.sign($scope.user, function(resp) {
	// 			if(resp.message) {
	// 				alert(resp.message);
	// 			} else {
	// 				signed($scope.user);
	// 			}
	// 		});
	// 	} else {
	// 		HttpService.change($scope.user, function(resp) {
	// 			if(resp.message=='done'){
	// 				HttpService.login($scope.user, signed);
	// 			}else if(resp.message=='wrong'){
	// 				alert('Wrong code from email.');
	// 				$scope.user.code = '';
	// 			}else{
	// 				$scope.verify = false;
	// 				$scope.user.code = '';
	// 				$scope.submit();
	// 			}
	// 		});
	// 	}
	// }

	var validateEmail = function(email) {
		var re = /\S+@\S+\.\S+/;
		return re.test(email);
	}

	$scope.loginUser = function() {

		if(!$scope.user.password) {
			return alert("Please fill your password");
		}

		if(!$scope.user.email) {
			return alert("Please fill your email");
		}

		if(!validateEmail($scope.user.email)) {
			return alert("Seems like your email is incorect");
		}

		HttpService.login($scope.user, function(user) {
			if(user == __env.loginApiStatus.unAuthorize) {
				return alert("Please check password/email");
			}
			signed(user);
		})
	};

	$scope.signup = function() {
		let rePassword = document.getElementById('rePasswordId').value;

		if(!$scope.user.password && $scope.verify) {
			return alert("Please fill your password");
		}

		if(($scope.user.password != rePassword) && !$scope.verify) {
				return alert("Password does not match");
		}

		if(!$scope.user.email) {
			return alert("Please fill your email");
		}

		if(!validateEmail($scope.user.email)) {
			return alert("Seems like your email is incorrect");
		}

		if(!$scope.captcha) {
			alert("Please select the Capcha!");
			return;
		}

		if(!$scope.verify) { 
			return HttpService.status($scope.user, function(resp) {
				// if(resp.user){
				// 	signed(resp.user);
				// } else 
				if(!resp.email){
					$scope.verify = true;
					return alert('Please check your email for the sign up code');
				} 

				return alert("Email already exists");
				// else 
				// if(resp.force){
				// 	$scope.verify = true;
				// } else 
				// if(!resp.pass){
				// 	alert('Password doesnt match with email');
				// 	$scope.user.password = '';
				//  } 
				//  else {
				// 	HttpService.login($scope.user, signed);
				// }
			});
		}

		return HttpService.sign($scope.user, function(resp) {
			if(resp.message) {
				alert(resp.message);
			} else {
				signed($scope.user);
			}
		});


	};

	$scope.closeModal = function(){
		$rootScope.modalInstance.close();
	}

	$scope.toggleResetPasswordView = function() {
		$scope.reset = !$scope.reset;
	}

	$scope.resetPassword = function() {
		if(!$scope.resetPasswordConfirmation) {
			return HttpService.request($scope.user, function(resp) {
				if(resp == 'false') {
					alert('Oops: That email doesnt exist in our system');					
				} else {
					alert('Please check your email for the reset code');
					$scope.verify = true;
					$scope.resetPasswordConfirmation = true;
				}
			});
		} else {
			return changePassword();
		}
	}

	let changePassword = function() {
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

}]);
