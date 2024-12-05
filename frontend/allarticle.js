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

app.controller('AllArticlesController', function($scope, $http, $window) {
    $scope.articles = [];
    $scope.loading = true;
    $scope.currentPage = 1;
    $scope.totalPages = 0;
    $scope.itemsPerPage = 5; // Menampilkan 9 artikel per halaman
    $scope.filter = {
        category: ''
    };
    $scope.categories = ['Kuliner', 'Pantai', 'Gunung', 'Budaya', 'Sejarah', 'Alam'];
    
    $scope.loadArticles = function() {
        $scope.loading = true;
        
        var params = {
            page: $scope.currentPage,
            limit: $scope.itemsPerPage
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
                if (article.image && !article.image.startsWith('http')) {
                    article.image = 'http://localhost:5000' + article.image;
                }
                return article;
            });
            
            $scope.articles = response.data.articles;
            $scope.totalPages = response.data.totalPages;
            $scope.currentPage = response.data.currentPage;
            $scope.loading = false;
        }).catch(function(error) {
            console.error('Error loading articles:', error);
            $scope.loading = false;
        });
    };

    $scope.filterByCategory = function(category) {
        $scope.filter.category = category;
        $scope.currentPage = 1;
        $scope.loadArticles();
    };

    $scope.changePage = function(page) {
        if (page < 1 || page > $scope.totalPages) return;
        $scope.currentPage = page;
        $scope.loadArticles();
    };

    $scope.getPages = function() {
        var pages = [];
        var startPage = Math.max(1, $scope.currentPage - 2);
        var endPage = Math.min($scope.totalPages, startPage + 4);
        
        for (var i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    $scope.readMore = function(article) {
        $window.location.href = `article-detail.html?id=${article._id}`;
    };

    $scope.user = JSON.parse(localStorage.getItem('user')) || null;
    
    $scope.isLoggedIn = function() {
        return $scope.user !== null;
    };

    $scope.logout = function() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        $scope.user = null;
        $window.location.href = 'login.html';
    };

    $scope.goBack = function() {
        $window.location.href = 'index.html';
    };

    // Load articles saat halaman dimuat
    $scope.loadArticles();
});