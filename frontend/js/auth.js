/**
 * Auth.js - Session Management
 */
class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.initPromise = this.init();
    }

    async init() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.getProfile();
                this.user = response.user;
                this.isAuthenticated = true;
                this.updateUI();
            } catch (error) {
                console.error('Session verification failed:', error);
                this.logout();
            }
        }
    }

    saveSession(token, user) {
        localStorage.setItem('token', token);
        this.user = user;
        this.isAuthenticated = true;
        this.updateUI();
    }

    logout() {
        localStorage.removeItem('token');
        this.user = null;
        this.isAuthenticated = false;
        // Simple redirect to home/login
        window.location.href = '/';
    }

    updateUI() {
        const nameEl = document.getElementById('navUsername');
        const avatarEl = document.getElementById('navAvatar');
        
        document.querySelectorAll('.admin-only').forEach(el => {
            const isVisible = (this.isAuthenticated && this.user && this.user.is_admin);
            if (el.tagName === 'DIV' && !el.classList.contains('nav-spacer')) {
                el.style.display = isVisible ? 'block' : 'none';
            } else {
                el.style.display = isVisible ? 'flex' : 'none';
            }
        });

        document.querySelectorAll('.user-only').forEach(el => {
            // Only show user links if authenticated AND not an admin
            const isVisible = (this.isAuthenticated && this.user && !this.user.is_admin);
            el.style.display = isVisible ? 'flex' : 'none';
        });

        if (this.user) {
            if (nameEl) nameEl.textContent = this.user.username;
            if (avatarEl) {
                avatarEl.style.background = `linear-gradient(135deg, var(--primary), var(--secondary))`;
                avatarEl.innerHTML = `<span style="color: white; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; height: 100%; font-weight: bold;">${this.user.username[0].toUpperCase()}</span>`;
            }
        }
    }
}

const auth = new AuthManager();
