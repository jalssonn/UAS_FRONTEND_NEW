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

app.controller('ArticleController', function($scope, $http, $window) {
    $scope.articles = [];
    $scope.loading = false;
    $scope.showForm = false;
    $scope.editMode = false;
    $scope.formData = {};
    $scope.username = JSON.parse(localStorage.getItem('user'))?.username;

    // Load articles
    $scope.loadArticles = function() {
        var params = {};
        if ($scope.filter && $scope.filter.status) {
            params.status = $scope.filter.status;
        }
        
        $http.get('http://localhost:5000/api/admin/articles', { params: params })
            .then(function(response) {
                $scope.articles = response.data.articles || [];
                console.log('Articles loaded:', $scope.articles);
            })
            .catch(function(error) {
                alert('Gagal memuat artikel');
                console.error('Error loading articles:', error);
            });
    };

    // Show add form
    $scope.showAddForm = function() {
        $scope.editMode = false;
        $scope.formData = {};
        $scope.showForm = true;
    };

    // Edit article
    $scope.editArticle = function(article) {
        $scope.editMode = true;
        const { description, ...articleWithoutDesc } = article;
        $scope.formData = { ...articleWithoutDesc };
        $scope.showForm = true;
    };

    // Cancel form
    $scope.cancelForm = function() {
        $scope.showForm = false;
        $scope.formData = {};
        $scope.editMode = false;
    };

    // Handle file select
    $scope.handleFileSelect = function(fileInput) {
        $scope.formData.image = fileInput.files[0];
    };

    // Save article
    $scope.saveArticle = function() {
        $scope.loading = true;
        var formData = new FormData();
        
        try {
            // Ambil userId dari localStorage
            const userId = localStorage.getItem('userId');
            
            if (!userId) {
                alert('Anda harus login terlebih dahulu');
                $scope.loading = false;
                return;
            }

            // Append semua data form
            for (var key in $scope.formData) {
                if (key === 'image' && $scope.formData[key] instanceof File) {
                    formData.append('image', $scope.formData[key]);
                } else if (key !== '_id') {
                    formData.append(key, $scope.formData[key]);
                }
            }

            // Append author ID
            formData.append('author', userId); // userId harus berupa string 24 karakter hex

            $http({
                method: $scope.editMode ? 'PUT' : 'POST',
                url: 'http://localhost:5000/api/admin/articles' + ($scope.editMode ? '/' + $scope.formData._id : ''),
                data: formData,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity
            })
            .then(function(response) {
                alert($scope.editMode ? 'Artikel berhasil diupdate' : 'Artikel berhasil ditambahkan');
                $scope.loadArticles();
                $scope.cancelForm();
            })
            .catch(function(error) {
                console.error('Error detail:', error);
                alert('Gagal menyimpan artikel: ' + (error.data?.message || 'Terjadi kesalahan'));
            })
            .finally(function() {
                $scope.loading = false;
            });
        } catch(error) {
            console.error('Error:', error);
            $scope.loading = false;
        }
    };

    // Delete article
    $scope.deleteArticle = function(id) {
        if (confirm('Yakin ingin menghapus artikel ini?')) {
            $http.delete('http://localhost:5000/api/admin/articles/' + id)
                .then(function(response) {
                    alert('Artikel berhasil dihapus');
                    $scope.loadArticles();
                })
                .catch(function(error) {
                    alert('Gagal menghapus artikel');
                    console.error(error);
                });
        }
    };

    // Logout
    $scope.logout = function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        $window.location.href = '../login.html';
    };

    // Load articles when page loads
    $scope.loadArticles();
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

app.run(function($rootScope, $window) {
    $rootScope.$on('$routeChangeStart', function() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            $window.location.href = '../index.html';
        }
    });
});