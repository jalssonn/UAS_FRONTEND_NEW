var app = angular.module('articleApp', ['ngRoute']);


// Konfigurasi routing
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'index.html',
            controller: 'ArticleController'
        })
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'AuthController'
        })
        .when('/register', {
            templateUrl: 'register.html',
            controller: 'AuthController'
        })
        .otherwise({
            redirectTo: '/home'
        });
}]);

// Konfigurasi interceptor untuk menambahkan token ke setiap request
app.config(function($httpProvider) {
    $httpProvider.interceptors.push(function() {
        return {
            request: function(config) {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            }
        };
    });
});

// Inisialisasi aplikasi
app.run(['$rootScope', function($rootScope) {
    $rootScope.appInitialized = true;
}]);