angular.module('ionicParseApp.controllers', [])

.controller('AppController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
	if ($stateParams.clear) {
		$ionicHistory.clearHistory();
		$ionicHistory.clearCache();
	}

	$scope.logout = function() {
		Parse.User.logOut();
		$ionicHistory.clearCache()
		$rootScope.user = null;
		$rootScope.isLoggedIn = false;
		$rootScope.imgURI = undefined;
		$state.go('welcome', {
			clear: true
		});
	};
})

.controller('WelcomeController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
	if ($stateParams.clear) {
		$ionicHistory.clearHistory();
		$ionicHistory.clearCache();
	}

	$scope.login = function() {
		$state.go('app.login');
	};

	$scope.signUp = function() {
		$state.go('app.register');
	};

	if ($rootScope.isLoggedIn) {
		$state.go('app.home');
	}
})

.controller('CreaterController', function($scope, $state, $stateParams, $rootScope, $cordovaCamera, $ionicHistory ) {
	$scope.userscontrib = [];
	$scope.imageArray = [];
	$scope.imgURI = undefined;
	if ($rootScope.isLoggedIn) {
		$scope.takePicture = function() {
			var options = {
				quality: 75,
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: Camera.PictureSourceType.CAMERA,
				allowEdit: false,
				encodingType: Camera.EncodingType.JPEG,
				targetWidth: 300,
				targetHeight: 300,
				popoverOptions: CameraPopoverOptions,
				saveToPhotoAlbum: false
			};

			$cordovaCamera.getPicture(options).then(function(imageData) {
				$scope.imgURI = "data:image/jpeg;base64," + imageData;
				//do other stuff
				}, function(err) {
				// An error occured. Show a message to the user
			});
		}
		$scope.userscontrib.push(Parse.User.current().get('username'));
		var teststuff = $scope.userscontrib;
		//console.dir(teststuff.length);
		//console.dir($scope.userscontrib)
		$scope.sendData = function(){
			$scope.imageArray.push($scope.imgURI)
			var Picture = Parse.Object.extend("Picture");
			var picture = new Picture();
			picture.set("name", $scope.user.nameOfChain)
			picture.set("currenchaincount", 1)
			picture.set("username", Parse.User.current())
			picture.set("image64", $scope.imageArray)
			picture.set("chain", $scope.user.chainLength)
			picture.set("nextuser", $stateParams.createid)
			picture.set("UsersContributed", teststuff)
			picture.save(null, {
				success: function(picture) {
					console.dir('it works')
				},
				error: function(picture, error) {
					console.dir('you suck ass')
				}
			});
			$scope.imgURI = undefined;
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('app.home', {
				clear: true
			});
			$ionicHistory.clearCache()
		}
	}
})

.controller('FriendController', function($scope, $state, $rootScope, $ionicHistory){
	//http://timothywalters-devthoughts.blogspot.com/2014/06/friend-request-in-javascript-using.html <-- use this to help
	$scope.friendsrequest = [];
	$scope.user = {};
	if ($rootScope.isLoggedIn) {
		var RequestStatus = {
			requested: 'requested',
			rejected: 'rejected',
			approved: 'approved'
		};

		var userQuery = new Parse.Query(Parse.User);

		$scope.sendInfo = function(){
			userQuery.equalTo("username", $scope.user.userSearched);
			userQuery.find({
				success: function (friend) {//friend is an array
					if (friend.length == 1 && $scope.user.userSearched != Parse.User.current().get("username")) { //should probably also check if they are already friends
						//console.dir(friend[0].id);
						var friendRequest = Parse.Object.extend("FriendRequest");
						var currentUser = Parse.User.current().get('username');
						var requestObject = new friendRequest();//I don't know

						requestObject.set("userFrom", currentUser)
						requestObject.set("userFromid", Parse.User.current())
						requestObject.set("userTo", $scope.user.userSearched)
						requestObject.set("userToId", friend[0].id)
						requestObject.set("valid", true);


						requestObject.save(null, {
							success: function(friendRequest) {

							},
							error: function(friendRequest, error) {
							}
						});
						$scope.message = "Request sent!"
					} else if (friend.length == 0){
						$scope.message = "User not found"
					} else {
						$scope.message = "Cannot send request to self"
					}
				},
				error: function (error) {

				}
			});

			$scope.imgURI = undefined;
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
		}


		var mRequests = Parse.Object.extend("FriendRequest");
		var requests = new Parse.Query(mRequests);
		requests.equalTo("userTo", Parse.User.current().get('username'));
		requests.find({
			success: function(results) {

				for(var i = 0; i<results.length; i++){
					if(results[i].attributes.status != "accepted" && results[i].attributes.status != "rejected") {
						$scope.list = results[i]
						$scope.friendsrequest.push($scope.list)
						$scope.$broadcast('scroll.refreshComplete');
					}
				}
			},
			error: function(error) {

			}
		});
		$scope.doRefresh = function() {
			requests.equalTo("userTo", Parse.User.current().get('username'));
			requests.find({
				success: function(results) {
					for(var i = 0; i<results.length; i++){
						if(results[i].attributes.status != "accepted" && results[i].attributes.status != "rejected") {
							$scope.list = results[i]
							$scope.friendsrequest.push($scope.list)

						}
					}
					$scope.$broadcast('scroll.refreshComplete');
				},
				error: function(error) {

				}
			});
		}
	}
})

.controller('FriendDecController', function($scope, $state, $stateParams, $rootScope, $ionicHistory) {
	if ($rootScope.isLoggedIn) {
		$scope.acceptFriend = function(){
			var currentUser = Parse.User.current();
			var currentUserName = currentUser.get("username")

			//We need to get the other person in the request
			var requests = Parse.Object.extend("FriendRequest");
			var getRequestQuery = new Parse.Query(requests);
			//stateParams.friendDec is the object id of the friend request. I don't know why
			getRequestQuery.equalTo("objectId", $stateParams.friendDec)
			getRequestQuery.find({
				success: function(results){
					console.log("Accepting request id " + results[0].id)
					var userFromName = results[0].get("userFrom")
					var userFromid = results[0].get("userFromid")

					results[0].set("status", "accepted")
					results[0].set("valid", false)
					results[0].save()
					$ionicHistory.clearCache()
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go('app.friend', {
						clear: true,
						reload: true
					});
				}
			});
		}
		$scope.rejectFriend = function(){ //Violates DRY atm but idk
			var currentUser = Parse.User.current();
			var currentUserName = currentUser.get("username")

			//We need to get the other person in the request
			var requests = Parse.Object.extend("FriendRequest");
			var getRequestQuery = new Parse.Query(requests);
			//stateParams.friendDec is the object id of the friend request. I don't know why
			getRequestQuery.equalTo("objectId", $stateParams.friendDec)
			getRequestQuery.find({
				success: function(results){
					console.log("Rejecting request id " + results[0].id)
					var userFromName = results[0].get("userFrom")
					var userFromid = results[0].get("userFromid")

					results[0].set("status", "rejected") //<-- the only changed line from above
					results[0].set("valid", false)
					results[0].save()
				}
			});
			$ionicHistory.clearCache()
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('app.friend', {
				clear: true,
				reload: true
			});
		}
	}
})

.controller('FinishedController', function($scope, $state, $rootScope, $ionicHistory) {
	$scope.dataToDisplay = [];
	if ($rootScope.isLoggedIn) {
		var FinishedPic = Parse.Object.extend("Picture");
		var query = new Parse.Query(FinishedPic);
		query.equalTo("UsersContributed",Parse.User.current().get('username'))
		query.find({
			success: function(results) {
				if (results.length === 0) {
					$scope.lonelyText = "No Finished Selfie Chains yet sorry"
				}
				for(var i=0; i< results.length;i++){
					if(results[i].attributes.currenchaincount >= results[i].attributes.chain){
						$scope.tempData = results[i];
						$scope.dataToDisplay.push($scope.tempData)
						console.dir($scope.dataToDisplay)
					}
				}
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
		$scope.doRefresh = function() {
			$scope.dataToDisplay = [];
			query.equalTo("UsersContributed",Parse.User.current().get('username'))
			query.find({
				success: function(results) {
					if (results.length === 0) {
						$scope.lonelyText = "No Finished Selfie Chains yet sorry"
					}
					for(var i=0; i< results.length;i++){
						if(results[i].attributes.currenchaincount >= results[i].attributes.chain){
							$scope.tempData = results[i];
							$scope.dataToDisplay.push($scope.tempData)
						}
					}
					$scope.$broadcast('scroll.refreshComplete');
				},
				error: function(error) {
					alert("Error: " + error.code + " " + error.message);
				}
			});
		};
	}
})

.controller('ViewFinishedController', function($scope, $state,$stateParams, $rootScope, $ionicHistory) {
	$scope.user = {};
	if ($rootScope.isLoggedIn){
		var Pic = Parse.Object.extend("Picture");
		var PicNew = new Pic();
	 	var queryThatPic = new Parse.Query(Pic);
		$scope.titleOfPic = $stateParams.viewfinishid;
		queryThatPic.equalTo("objectId", $scope.titleOfPic)
		queryThatPic.find({
			success: function (EachPic) {
				$scope.PicArray = EachPic[0].attributes.image64;
				$scope.UsersContrib = EachPic[0].attributes.UsersContributed;
			},
			error: function (error) {
				alert(error);
			}
		});
	}
})

.controller('RequestController', function($scope, $state, $rootScope, $ionicHistory) {
	$scope.user = {};
	if ($rootScope.isLoggedIn) {
		var Picture = Parse.Object.extend("Picture");
		var userQuery = new Parse.Query(Picture);

		userQuery.equalTo("nextuser", Parse.User.current().get('username'));
		userQuery.find({
			success: function (friend) {
				if (friend.length === 0) {
					$scope.lonelyText = "Looks a little lonely in here... Why not try sending a selfie to someone?"
				}
				$scope.pictureRecieveds = friend
			},
			error: function (error) {
				alert(error);
			}
		});
		$scope.doRefresh = function() {

			userQuery.equalTo("nextuser", Parse.User.current().get('username'));
			userQuery.find({
				success: function (friend) {
					if (friend.length === 0) {
						$scope.lonelyText = "Looks a little lonely in here... Why not try sending a selfie to someone?"
					}
					$scope.pictureRecieveds = friend
					$scope.$broadcast('scroll.refreshComplete');
				},
				error: function (err) {
					//do something if error
				}
			});
		};
	}
})

.controller('ViewController', function($scope, $state, $stateParams, $rootScope,$cordovaCamera, $ionicHistory) {
	$scope.user = {};
	if ($rootScope.isLoggedIn){
		var Pic = Parse.Object.extend("Picture");
		var PicNew = new Pic();
	 	var queryThatPic = new Parse.Query(Pic);
		$scope.titleOfPic = $stateParams.viewid;
		queryThatPic.equalTo("objectId", $scope.titleOfPic)
		queryThatPic.find({
			success: function (EachPic) {
				$scope.chain = EachPic[0].attributes.chain
				$scope.currentcount = EachPic[0].attributes.currenchaincount

				$scope.PicArray = EachPic[0].attributes.image64;
				//console.dir($scope.love.length)
				//console.dir($scope.lengthofPicArray)
				$scope.currentUsersContrib = EachPic[0].attributes.UsersContributed;
			},
			error: function (error) {
				alert(error);
			}
		});
		$scope.takePicture = function() {
			var options = {
				quality: 75,
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: Camera.PictureSourceType.CAMERA,
				allowEdit: false,
				encodingType: Camera.EncodingType.JPEG,
				targetWidth: 300,
				targetHeight: 300,
				popoverOptions: CameraPopoverOptions,
				saveToPhotoAlbum: false
			};

			$cordovaCamera.getPicture(options).then(function(imageData) {
				$scope.imgURI = "data:image/jpeg;base64," + imageData;
				//do other stuff
				}, function(err) {
				// An error occured. Show a message to the user
			});
		}
		$scope.newPicChain = function(){
			//alert("hello")
			$scope.nextuser = $scope.user.nextUser
			$scope.PicArray.push($scope.imgURI)
			console.dir($scope.imgURI)
			queryThatPic.equalTo("objectId", $scope.titleOfPic)
			queryThatPic.find({
				success: function (EachPic) {
					//console.dir(EachPic[0].attributes)
					//console.dir(EachPic[0].attributes.UsersContributed)
					$scope.life = EachPic[0];
					$scope.currentUsersContrib = EachPic[0].attributes.UsersContributed;
					$scope.currentUsersContrib.push(Parse.User.current().get('username'))
					$scope.life.increment("currenchaincount")
					$scope.life.set("nextuser",$scope.user.nextUser)
					$scope.life.set("UsersContributed",$scope.currentUsersContrib)
					$scope.life.set("image64", $scope.PicArray)
					$scope.life.save();
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$ionicHistory.clearCache()
					$state.go('app.home', {
						clear: true
					});
				},
				error: function (error) {
					alert(error);
				}
			});
		}
	}
})

.controller('HomeController', function($scope, $state, $rootScope) {
	if (!$rootScope.isLoggedIn) {
		$state.go('welcome');
	}else{
		$state.go($state.current, {}, {reload: true});
	}
})

.controller('LoginController', function($scope, $state, $rootScope, $ionicLoading, $ionicHistory) {
	$scope.user = {
		username: null,
		password: null
	};

	$scope.error = {};

	$scope.login = function() {
		$scope.loading = $ionicLoading.show({
			content: 'Logging in',
			animation: 'fade-in',
			showBackdrop: true,
			maxWidth: 200,
			showDelay: 0
		});

		var user = $scope.user;
		Parse.User.logIn(('' + user.username).toLowerCase(), user.password, {
			success: function(user) {
				$ionicLoading.hide();
				$rootScope.user = user;
				$rootScope.isLoggedIn = true;
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('app.home', {
					clear: true
				});

			},
			error: function(user, err) {
				$ionicLoading.hide();
				// The login failed. Check error to see why.
				if (err.code === 101) {
					$scope.error.message = 'Invalid login credentials';
				} else {
					$scope.error.message = 'An unexpected error has ' +
					'occurred, please try again.';
				}
				$scope.$apply();
			}
		});
	};

	$scope.forgot = function() {
		$state.go('app.forgot');
	};
})

.controller('ForgotPasswordController', function($scope, $state, $ionicLoading) {
	$scope.user = {};
	$scope.error = {};
	$scope.state = {
		success: false
	};

	$scope.reset = function() {
		$scope.loading = $ionicLoading.show({
			content: 'Sending',
			animation: 'fade-in',
			showBackdrop: true,
			maxWidth: 200,
			showDelay: 0
		});

		Parse.User.requestPasswordReset($scope.user.email, {
			success: function() {
				// TODO: show success
				$ionicLoading.hide();
				$scope.state.success = true;
				$scope.$apply();
			},
			error: function(err) {
				$ionicLoading.hide();
				if (err.code === 125) {
					$scope.error.message = 'Email address does not exist';
				} else {
					$scope.error.message = 'An unknown error has occurred, ' +
					'please try again';
				}
				$scope.$apply();
			}
		});
	};

	$scope.login = function() {
		$state.go('app.login');
	};
})

.controller('RegisterController', function($scope, $state, $ionicLoading, $rootScope, $ionicHistory) {
	$scope.showButton = false;
	$scope.user = {};
	$scope.error = {};
	$scope.friends = [];
	if(true)
		$scope.showButton = true;

	$scope.register = function() {

		// TODO: add age verification step

		$scope.loading = $ionicLoading.show({
			content: 'Sending',
			animation: 'fade-in',
			showBackdrop: true,
			maxWidth: 200,
			showDelay: 0
		});

		var user = new Parse.User();
		user.set("username", $scope.user.username);
		user.set("password", $scope.user.password);
		user.set("email", $scope.user.email);
		user.set("friends", $scope.friends)

		user.signUp(null, {
			success: function(user) {
				$ionicLoading.hide();
				$rootScope.user = Parse.User.current();
				$rootScope.isLoggedIn = true;
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('app.home', {
					clear: true
				});
			},
			error: function(user, error) {
				$ionicLoading.hide();
				if (error.code === 125) {
					$scope.error.message = 'Please specify a valid email ' +
					'address';
				} else if (error.code === 202) {
					$scope.error.message = 'The username is already ' +
					'registered';
				} else {
					$scope.error.message = error.message;
				}
				$scope.$apply();
			}
		});
	};
})

.controller('MainController', function($scope, $state, $rootScope, $stateParams, $ionicHistory) {
	if ($stateParams.clear) {
		$ionicHistory.clearHistory();
	}

	$scope.rightButtons = [{
		type: 'button-positive',
		content: '<i class="icon ion-navicon"></i>',
		tap: function(e) {
			$scope.sideMenuController.toggleRight();
		}
	}];

	$scope.logout = function() {
		Parse.User.logOut();
		$rootScope.user = null;
		$rootScope.isLoggedIn = false;
		$rootScope.imgURI = undefined;
		$state.go('welcome', {
			clear: true
		});
	};

	$scope.toggleMenu = function() {
		$scope.sideMenuController.toggleRight();
	};
})

.controller('LoadFriendsController', function($scope, $state, $rootScope, $stateParams, $ionicHistory){
	$scope.friendsList = [];
	var FriendRequest = Parse.Object.extend("FriendRequest")
	var friendRequestFrom = new Parse.Query(FriendRequest);
	var friendRequestTo = new Parse.Query(FriendRequest);
	friendRequestFrom.equalTo("userFrom", Parse.User.current().get("username"))
	friendRequestFrom.find({
		success: function(results){
			for(var i = 0; i<results.length;i++){
				if(results[i].attributes.status === "accepted"){
					var value = results[i].attributes.userTo
					$scope.friendsList.push(value);
					console.dir($scope.friendsList)
				}
			}
		}
	});
	friendRequestTo.equalTo("userTo", Parse.User.current().get("username"))
	friendRequestTo.find({
		success: function(results){
			for(var i = 0; i<results.length;i++){
				if(results[i].attributes.status === "accepted"){
					var value = results[i].attributes.userFrom
					$scope.friendsList.push(value);
					console.dir($scope.friendsList)
				}
			}
		}
	});

})
