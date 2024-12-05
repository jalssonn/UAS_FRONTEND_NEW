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

app.controller('ArticleController', function($scope, $http, $window, $interval) {
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

    $scope.viewAllArticles = function() {
        $window.location.href = 'allarticle.html';
    };

    $scope.user = JSON.parse(localStorage.getItem('user')) || null;
    
    $scope.isLoggedIn = function() {
        return $scope.user !== null;
    };

    $scope.isAdmin = function() {
        return $scope.user && $scope.user.role === 'admin';
    };

    $scope.logout = function() {
        // Hapus data user dari localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        $scope.user = null;
        
        // Redirect ke halaman login
        $window.location.href = 'index.html';
    };

    $scope.filterByCategory = function(category) {
        $scope.filter.category = category;
        $scope.currentPage = 1;
        $scope.loadArticles();
    };

    $scope.readMore = function(article) {
        $window.location.href = `article-detail.html?id=${article._id}`;
    };

    // Tambahkan variabel untuk mengontrol scroll
    $scope.scrollAmount = 320; // Lebar card + gap

   

    $scope.travelTips = [
        {
            image: '/images/japan.jpg',
            title: 'FANTASTIC JAPAN TRIP SPECIAL',
            link: '/tours/japan'
        },
        {
            image: '/images/europe.jpg',
            title: 'EUROPE TRIP',
            link: '/tours/europe'
        },
        {
            image: '/images/australia.jpg',
            title: 'AUSTRALIA FUN TRIP',
            link: '/tours/australia'
        },
        {
            image: '/images/korea.jpg',
            title: 'SOUTH KOREA BEAUTIFUL TRIP',
            link: '/tours/korea'
        },
        {
            image: '/images/korea.jpg',
            title: 'SOUTH KOREA BEAUTIFUL TRIP',
            link: '/tours/korea'
        },
        {
            image: '/images/korea.jpg',
            title: 'SOUTH KOREA BEAUTIFUL TRIP',
            link: '/tours/korea'
        },

    ];

    $scope.prevTip = function() {
        const container = document.querySelector('.travel-tips-container');
        container.scrollBy({
            left: -$scope.scrollAmount,
            behavior: 'smooth'
        });
    };

    $scope.nextTip = function() {
        const container = document.querySelector('.travel-tips-container');
        container.scrollBy({
            left: $scope.scrollAmount,
            behavior: 'smooth'
        });
    };

    // Background images untuk carousel
    $scope.backgroundImages = [
        'images/jepang.jpg',
        'images/malaysia.jpg',
        'images/singapore.jpg',
        'images/thailand.jpg'
    ];
    
    $scope.currentBackgroundIndex = 0;
    $scope.prevBackgroundIndex = -1;

    // Fungsi untuk mengganti background
    $scope.setBackground = function(index) {
        $scope.prevBackgroundIndex = $scope.currentBackgroundIndex;
        $scope.currentBackgroundIndex = index;
    };

    function changeBackground() {
        $scope.prevBackgroundIndex = $scope.currentBackgroundIndex;
        $scope.currentBackgroundIndex = ($scope.currentBackgroundIndex + 1) % $scope.backgroundImages.length;
    }

    // Ganti background setiap 5 detik
    var carouselInterval = $interval(changeBackground, 7000);

    // Hentikan interval saat scope dihancurkan
    $scope.$on('$destroy', function() {
        if (carouselInterval) {
            $interval.cancel(carouselInterval);
        }
    });

    // Load articles pertama kali
    $scope.loadArticles();  
});

