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
        $http.get('http://localhost:5000/api/admin/articles')
            .then(function(response) {
                $scope.articles = response.data.articles || [];
                console.log('Articles reloaded:', $scope.articles);
            })
            .catch(function(error) {
                console.error('Error loading articles:', error);
                alert('Gagal memuat artikel');
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
        $scope.formData = {
            _id: article._id,
            title: article.title,
            content: article.content,
            category: article.category,
            country: article.country,
            status: article.status,
            author: article.author
        };
        $scope.showForm = true;
        console.log('Editing article:', $scope.formData);
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
        
        try {
            console.log('Form Data sebelum dikirim:', $scope.formData);
            
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            
            if (!user || !token) {
                alert('Anda harus login terlebih dahulu');
                $scope.loading = false;
                return;
            }

            // Untuk update artikel, kirim data langsung tanpa FormData
            if ($scope.editMode) {
                const updateData = {
                    title: $scope.formData.title,
                    content: $scope.formData.content,
                    category: $scope.formData.category,
                    country: $scope.formData.country,
                    status: $scope.formData.status,
                    author: user.id
                };

                console.log('Update data:', updateData);

                $http({
                    method: 'PUT',
                    url: 'http://localhost:5000/api/admin/articles/' + $scope.formData._id,
                    data: updateData,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                })
                .then(function(response) {
                    console.log('Response update:', response.data);
                    if (response.data) {
                        alert('Artikel berhasil diupdate');
                        $scope.loadArticles();
                        $scope.cancelForm();
                    } else {
                        throw new Error('Gagal mengupdate artikel');
                    }
                })
                .catch(function(error) {
                    console.error('Error update:', error);
                    alert('Gagal mengupdate artikel: ' + (error.response?.data?.message || error.message));
                })
                .finally(function() {
                    $scope.loading = false;
                });
            } else {
                // Untuk artikel baru, gunakan FormData karena ada upload gambar
                var formData = new FormData();
                formData.append('title', $scope.formData.title);
                formData.append('content', $scope.formData.content);
                formData.append('category', $scope.formData.category);
                formData.append('country', $scope.formData.country);
                formData.append('status', $scope.formData.status);
                formData.append('author', user.id);

                if ($scope.formData.image instanceof File) {
                    formData.append('image', $scope.formData.image);
                }

                $http({
                    method: 'POST',
                    url: 'http://localhost:5000/api/admin/articles',
                    data: formData,
                    headers: {
                        'Content-Type': undefined,
                        'Authorization': 'Bearer ' + token
                    },
                    transformRequest: angular.identity
                })
                .then(function(response) {
                    console.log('Response create:', response.data);
                    if (response.data) {
                        alert('Artikel berhasil ditambahkan');
                        $scope.loadArticles();
                        $scope.cancelForm();
                    } else {
                        throw new Error('Gagal menambahkan artikel');
                    }
                })
                .catch(function(error) {
                    console.error('Error create:', error);
                    alert('Gagal menambahkan artikel: ' + (error.response?.data?.message || error.message));
                })
                .finally(function() {
                    $scope.loading = false;
                });
            }
        } catch(error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan: ' + error.message);
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