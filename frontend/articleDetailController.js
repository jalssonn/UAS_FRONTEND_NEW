angular.module('articleApp').controller('ArticleDetailController', function($scope, $http, $window) {
    $scope.article = null;
    $scope.loading = true;
    $scope.error = null;

    // Ambil ID artikel dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    // Fungsi untuk kembali ke halaman utama
    $scope.backToHome = function() {
        $window.location.href = 'index.html';
    };

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
                $scope.loading = false;
            })
            .catch(function(error) {
                $scope.error = 'Gagal memuat artikel: ' + 
                              (error.data ? error.data.message : error.message);
                $scope.loading = false;
            });
    }

    // Muat artikel saat halaman dimuat
    loadArticleDetail();
}); 