function checkAdminAuth() {
    // Tampilkan loading screen terlebih dahulu
    document.body.style.visibility = 'hidden';
    
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = `
        <div class="loading-spinner"></div>
    `;
    document.body.appendChild(loadingScreen);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    // Jika tidak ada token atau user, redirect ke login
    if (!token || !user) {
        window.location.href = '../login.html';
        return;
    }
    
    // Jika bukan admin, redirect ke homepage
    if (user.role !== 'admin') {
        window.location.href = '../index.html';
        return;
    }

    // Jika admin, tampilkan konten
    setTimeout(() => {
        loadingScreen.remove();
        document.body.style.visibility = 'visible';
    }, 500); // Delay 500ms untuk transisi yang lebih smooth
}

// Jalankan pengecekan saat halaman dimuat
document.addEventListener('DOMContentLoaded', checkAdminAuth); 