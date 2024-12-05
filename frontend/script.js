var app = angular.module('articleApp', []);

app.filter('truncate', function() {
    return function(text, length, end) {
        if (!text) return '';
        if (isNaN(length)) length = 100;
        if (end === undefined) end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        } else {
            return String(text).substring(0, length - end.length) + end;
        }
    };
});

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

app.controller('ArticleController', function($scope, $http, $window) {
    $scope.articles = [];
    $scope.loading = true;
    $scope.error = null;
    $scope.currentPage = 1;
    $scope.totalPages = 0;
    $scope.filter = {
        category: '',
        country: ''
    };
    $scope.searchQuery = '';
    $scope.categories = ['Kuliner', 'Pantai', 'Gunung', 'Budaya', 'Sejarah', 'Alam'];

    $scope.loadArticles = function() {
        $scope.loading = true;
        
        var params = {
            page: $scope.currentPage,
            limit: 6
        };

        if ($scope.filter.category) {
            params.category = $scope.filter.category;
        }

        $http({
            method: 'GET',
            url: 'http://localhost:5000/api/articles',
            params: params
        }).then(function(response) {
            response.data.articles = response.data.articles.map(article => {
                console.log('Original image path:', article.image);
                
                if (article.image && !article.image.startsWith('http')) {
                    article.image = 'http://localhost:5000' + article.image;
                }
                
                console.log('Final image URL:', article.image);
                return article;
            });
            
            $scope.articles = response.data.articles;
            $scope.totalPages = response.data.totalPages;
            $scope.currentPage = response.data.currentPage;
            $scope.loading = false;
        }, function(error) {
            console.error('Error loading articles:', error);
            $scope.error = 'Gagal memuat artikel: ' + (error.data ? error.data.message : error.message);
            $scope.loading = false;
        });
    };

    $scope.searchArticles = function() {
        console.log('Searching for:', $scope.searchQuery);
        
        if (!$scope.searchQuery || $scope.searchQuery.length < 2) {
            return;
        }

        $window.location.href = './search.html?q=' + encodeURIComponent($scope.searchQuery);
    };

    $scope.changePage = function(page) {
        if (page < 1 || page > $scope.totalPages) return;
        $scope.currentPage = page;
        $scope.loadArticles();
    };

    $scope.getPages = function() {
        var pages = [];
        for (var i = 1; i <= $scope.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    $scope.isLoggedIn = function() {
        return localStorage.getItem('token') !== null;
    };

    $scope.username = JSON.parse(localStorage.getItem('user'))?.username || '';

    $scope.logout = function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        $window.location.reload();
    };

    $scope.filterByCategory = function(category) {
        if (category) {
            $http.get('/api/articles?category=' + category)
                .then(function(response) {
                    $scope.articles = response.data;
                });
        } else {
            $scope.loadArticles();
        }
    };

    $scope.readMore = function(article) {
        $window.location.href = `article-detail.html?id=${article._id}`;
    };

    // Load articles pertama kali
    $scope.loadArticles();  
});

app.run(function($rootScope) {
    $rootScope.user = JSON.parse(localStorage.getItem('user')) || null;
    
    $rootScope.isLoggedIn = function() {
        return !!localStorage.getItem('token');
    };
    
    $rootScope.isAdmin = function() {
        return $rootScope.user && $rootScope.user.role === 'admin';
    };
});