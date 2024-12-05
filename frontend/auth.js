var app = angular.module('authApp', []);

app.controller('AuthController', function($scope, $http, $window) {
    $scope.user = {};
    $scope.loading = false;
    $scope.error = null;
    
    // Cek jika user sudah login
    $scope.isLoggedIn = function() {
        return localStorage.getItem('token') !== null;
    };

    // Ambil username jika sudah login
    $scope.username = JSON.parse(localStorage.getItem('user'))?.username || '';

    // Fungsi logout
    $scope.logout = function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        $window.location.href = 'login.html';
    };

    // Fungsi register yang sudah ada
    $scope.register = function() {
        if (!$scope.user.username || !$scope.user.email || !$scope.user.password) {
            $scope.error = "Semua field harus diisi";
            return;
        }

        $scope.loading = true;
        $scope.error = null;

        $http.post('http://localhost:5000/api/auth/register', {
            username: $scope.user.username,
            email: $scope.user.email,
            password: $scope.user.password
        }).then(function(response) {
            console.log('Success:', response.data);
            alert('Registrasi berhasil! Silakan login.');
            $window.location.href = 'login.html';
        }).catch(function(error) {
            console.log('Error:', error);
            $scope.error = error.data ? error.data.message : 'Terjadi kesalahan';
            $scope.loading = false;
        });
    };

    // Fungsi login yang sudah ada
    $scope.login = function() {
        $http.post('http://localhost:5000/api/auth/login', $scope.user)
            .then(function(response) {
                const { token, user } = response.data;
                
                // Simpan token dan data user
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Redirect berdasarkan role
                if (user.role === 'admin') {
                    window.location.href = '/admin/dashboard.html';
                } else {
                    window.location.href = '/index.html';
                }
            })
            .catch(function(error) {
                $scope.error = error.data?.message || 'Login gagal';
            });
    };
});