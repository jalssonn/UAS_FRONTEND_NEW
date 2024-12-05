var app = angular.module('articleApp', []);

app.controller('SearchController', function($scope, $http, $window) {
    $scope.articles = [];
    $scope.loading = true;
    $scope.error = null;
    
    $scope.searchQuery = new URLSearchParams(window.location.search).get('q');
    console.log('Search Query:', $scope.searchQuery);

    function performSearch() {
        if (!$scope.searchQuery) {
            $scope.loading = false;
            return;
        }

        $http({
            method: 'GET',
            url: 'http://localhost:5000/api/articles/search',
            params: { q: $scope.searchQuery }
        }).then(function(response) {
            console.log('Search Results:', response.data);
            response.data = response.data.map(article => {
                if (article.image && !article.image.startsWith('http')) {
                    article.image = 'http://localhost:5000' + article.image;
                }
                return article;
            });
            $scope.articles = response.data;
            $scope.loading = false;
        }).catch(function(error) {
            console.error('Search Error:', error);
            $scope.error = 'Gagal memuat hasil pencarian: ' + 
                          (error.data ? error.data.message : error.message);
            $scope.loading = false;
        });
    }

    $scope.searchArticles = function() {
        if (!$scope.searchQuery) return;
        $window.location.href = './search.html?q=' + encodeURIComponent($scope.searchQuery);
    };

    performSearch();
});