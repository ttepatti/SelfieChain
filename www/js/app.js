// Ionic Parse Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'ionicParseApp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'ionicParseApp.controllers' is found in controllers.js
angular.module('ionicParseApp',
        [ 'ionic', 'ionicParseApp.controllers', 'ngCordova']
    )
    .config(function($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('welcome', {
                url: '/welcome?clear',
                templateUrl: 'templates/welcome.html',
                controller: 'WelcomeController'
            })

            .state('app', {
                url: '/app?clear',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppController'
            })

            .state('app.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/home.html',
                        controller: 'HomeController'
                    }
                }
            })

            .state('app.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/login.html',
                        controller: 'LoginController'
                    }
                }
            })

            .state('app.create', {
                url: '/create',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/create.html',
                        controller: 'CreaterController'
                    }
                }
            })

            .state('app.requests', {
                url: '/requests',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/requests.html',
                        controller: 'RequestController'
                    }
                }
            })

            .state('app.view', {
                url: '/view/:viewid',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/view.html',
                        controller: 'ViewController'
                    }
                }
            })

            .state('app.friend', {
                url: '/friend',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/friend.html',
                        controller: 'FriendController'
                    }
                }
            })

            .state('app.forgot', {
                url: '/forgot',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/forgotPassword.html',
                        controller: 'ForgotPasswordController'
                    }
                }
            })

            .state('app.register', {
                url: '/register',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/register.html',
                        controller: 'RegisterController'
                    }
                }
            });


        $urlRouterProvider.otherwise('/welcome');
    })
    .run(function ($state, $rootScope) {
        Parse.initialize('z6qmzbMoG6ftVkX2O61KyEbaNLOg421ZL01xg3d1', '773ll7VnrCyDrVnfIJLdxgU7t71Hnam8k5aN5CXm');
        var currentUser = Parse.User.current();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;

        if (currentUser) {
            $rootScope.user = currentUser;
            $rootScope.isLoggedIn = true;
            $state.go('app.home');
        }
    });
