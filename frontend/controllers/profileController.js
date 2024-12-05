angular.module('articleApp').controller('ProfileController', function($scope, $http, $window) {
    $scope.profile = {};
    $scope.passwordData = {};
    $scope.loading = false;
    $scope.successMessage = '';
    $scope.errorMessage = '';

    // Cek token
    const token = localStorage.getItem('token');
    if (!token) {
        $window.location.href = 'login.html';
        return;
    }

    // Konfigurasi header
    const config = {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };

    // Tambahkan base URL
    const API_URL = 'http://localhost:5000/api';

    // Load profile dengan error handling yang lebih baik
    $scope.loadProfile = function() {
        $scope.loading = true;
        $scope.errorMessage = '';
        
        $http.get(`${API_URL}/users/profile`, config)
            .then(function(response) {
                $scope.profile = response.data;
                console.log('Profile loaded:', response.data);
            })
            .catch(function(error) {
                console.error('Error loading profile:', error);
                if (error.status === -1) {
                    $scope.errorMessage = 'Tidak dapat terhubung ke server. Pastikan server berjalan.';
                } else {
                    $scope.errorMessage = error.data?.message || 'Gagal memuat profil';
                }
            })
            .finally(function() {
                $scope.loading = false;
            });
    };

    // Update profile
    $scope.updateProfile = function() {
        $scope.loading = true;
        $scope.successMessage = '';
        $scope.errorMessage = '';

        $http.put('http://localhost:5000/api/users/profile', $scope.profile, config)
            .then(function(response) {
                $scope.successMessage = 'Profil berhasil diperbarui';
                // Update local storage
                const user = JSON.parse(localStorage.getItem('user'));
                user.username = $scope.profile.username;
                user.email = $scope.profile.email;
                localStorage.setItem('user', JSON.stringify(user));
            })
            .catch(function(error) {
                console.error('Error updating profile:', error);
                $scope.errorMessage = error.data?.message || 'Gagal memperbarui profil';
            })
            .finally(function() {
                $scope.loading = false;
            });
    };

    // Change password dengan error handling yang lebih baik
    $scope.changePassword = function() {
        if (!confirm('Apakah Anda yakin ingin mengganti password?')) return;

        $scope.loading = true;
        $scope.errorMessage = '';
        
        $http.put(`${API_URL}/users/change-password`, $scope.passwordData, config)
            .then(function(response) {
                $scope.successMessage = 'Password berhasil diubah';
                $scope.passwordData = {};
            })
            .catch(function(error) {
                console.error('Error changing password:', error);
                if (error.status === -1) {
                    $scope.errorMessage = 'Tidak dapat terhubung ke server. Pastikan server berjalan.';
                } else {
                    $scope.errorMessage = error.data?.message || 'Gagal mengubah password';
                }
            })
            .finally(function() {
                $scope.loading = false;
            });
    };

    // Delete account
    $scope.deleteAccount = function() {
        if (!confirm('PERHATIAN: Akun Anda akan dihapus secara permanen. Lanjutkan?')) return;

        $http.delete('http://localhost:5000/api/users/profile', config)
            .then(function(response) {
                alert('Akun berhasil dihapus');
                localStorage.clear();
                $window.location.href = 'login.html';
            })
            .catch(function(error) {
                console.error('Error deleting account:', error);
                $scope.errorMessage = error.data?.message || 'Gagal menghapus akun';
            });
    };

    // Load profile saat halaman dimuat
    $scope.loadProfile();
}); 