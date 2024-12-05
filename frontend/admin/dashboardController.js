var app = angular.module('adminApp', []);

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



app.controller('DashboardController', function($scope, $window) {
    $scope.username = JSON.parse(localStorage.getItem('user'))?.username;

    $scope.logout = function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        $window.location.href = '../index.html';
    };
});

app.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('change', function() {
                $parse(attrs.fileModel).assign(scope, element[0].files[0]);
                scope.$apply();
            });
        }
    };
}]);