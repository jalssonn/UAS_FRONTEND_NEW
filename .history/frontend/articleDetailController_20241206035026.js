angular.module('articleApp').controller('ArticleDetailController', function($scope, $http, $window) {
    $scope.article = null;
    $scope.loading = true;
    $scope.error = null;
    $scope.comments = [];
    $scope.newComment = '';
    $scope.user = JSON.parse(localStorage.getItem('user'));
    $scope.isLoggedIn = false;
    $scope.isBookmarked = false;  // New variable to track bookmark status

    // Ambil ID artikel dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    // Fungsi untuk kembali ke halaman utama
    $scope.backToHome = function() {
        $window.location.href = 'index.html';
    };

    // Cek status login
    function checkLoginStatus() {
        const token = localStorage.getItem('token');
        $scope.isLoggedIn = !!token;
    }

    // Fungsi untuk like artikel
    $scope.toggleLike = function() {
        if (!$scope.isLoggedIn) {
            if (confirm('Anda harus login untuk menyukai artikel. Ingin login sekarang?')) {
                $window.location.href = 'login.html';
            }
            return;
        }

        $http.post(`http://localhost:5000/api/articles/${articleId}/like`, {}, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })
        .then(function(response) {
            $scope.hasLiked = response.data.hasLiked;
            $scope.likes = response.data.likes;
        })
        .catch(function(error) {
            alert('Gagal memberikan like: ' + error.data.message);
        });
    };

    // Fungsi untuk menambah komentar
    $scope.addComment = function() {
        if (!$scope.isLoggedIn) {
            if (confirm('Anda harus login untuk berkomentar. Ingin login sekarang?')) {
                $window.location.href = 'login.html';
            }
            return;
        }

        if (!$scope.newComment.trim()) return;

        const commentData = {
            content: $scope.newComment
        };

        $http.post(`http://localhost:5000/api/articles/${articleId}/comments`, commentData, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })
        .then(function(response) {
            // Tambahkan komentar baru ke awal array
            $scope.comments.unshift(response.data);
            $scope.newComment = ''; // Reset form
        })
        .catch(function(error) {
            console.error('Error:', error);
            alert('Gagal menambahkan komentar: ' + (error.data?.message || error.message));
        });
    };

    // Fungsi untuk memuat komentar
    function loadComments() {
        $http.get(`http://localhost:5000/api/articles/${articleId}/comments`)
        .then(function(response) {
            $scope.comments = response.data;
        })
        .catch(function(error) {
            console.error('Gagal memuat komentar:', error);
        });
    }

    // Fungsi untuk memuat detail artikel
    function loadArticleDetail() {
        if (!articleId) {
            $scope.error = 'ID artikel tidak ditemukan';
            $scope.loading = false;
            return;
        }

        $http.get(`http://localhost:5000/api/articles/${articleId}`)
            .then(function(response) {
                if (response.data.image && !response.data.image.startsWith('http')) {
                    response.data.image = 'http://localhost:5000' + response.data.image;
                }
                $scope.article = response.data;
                $scope.likes = response.data.likes.length;
                $scope.hasLiked = response.data.likes.includes($scope.userId);
                $scope.loading = false;
                loadComments();
                checkBookmarkStatus(); // Check if article is bookmarked
            })
            .catch(function(error) {
                $scope.error = 'Gagal memuat artikel: ' + 
                              (error.data ? error.data.message : error.message);
                $scope.loading = false;
            });
    }

    // Fungsi untuk toggle bookmark status
    $scope.toggleBookmark = function() {
        if (!$scope.isLoggedIn) {
            if (confirm('Anda harus login untuk menambahkan artikel ke bookmark. Ingin login sekarang?')) {
                $window.location.href = 'login.html';
            }
            return;
        }

        const action = $scope.isBookmarked ? 'remove' : 'add';

        $http.post(`http://localhost:5000/api/articles/${articleId}/bookmark/${action}`, {}, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })
        .then(function(response) {
            $scope.isBookmarked = !$scope.isBookmarked; // Toggle bookmark status
        })
        .catch(function(error) {
            alert('Gagal menambahkan bookmark: ' + (error.data?.message || error.message));
        });
    };

    // Cek jika artikel sudah dibookmark oleh pengguna
    function checkBookmarkStatus() {
        if (!$scope.isLoggedIn) return;

        $http.get(`http://localhost:5000/api/users/${$scope.user.id}/bookmarks`)
            .then(function(response) {
                const bookmarkedArticles = response.data;
                $scope.isBookmarked = bookmarkedArticles.some(article => article.id === articleId);
            })
            .catch(function(error) {
                console.error('Error checking bookmark status:', error);
            });
    }

    checkLoginStatus();
    loadArticleDetail();
});
