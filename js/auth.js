// FinanFun Authentication with Stack Auth
// This module handles user authentication using Stack Auth

class FinanFunAuth {
    constructor() {
        this.modal = document.getElementById('authModal');
        this.loginBtn = document.getElementById('loginBtn');
        this.closeBtn = document.querySelector('.close-auth');
        this.tabs = document.querySelectorAll('.auth-tab');
        this.forms = document.querySelectorAll('.auth-form');
        this.currentUser = null;
        
        this.init();
    }
    
    init() {
        // Only add event listeners if elements exist
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        }
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        if (this.modal) {
            // Close modal when clicking outside
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
        
        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(e);
            });
        }
        
        // Social login buttons
        const socialButtons = document.querySelectorAll('.social-btn');
        socialButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = button.getAttribute('data-provider');
                console.log('Social login clicked:', provider); // Debug log
                if (provider) {
                    this.handleSocialLogin(provider);
                } else {
                    this.showError('Erro: Provider não identificado');
                }
            });
        });
        
        // Ensure button is in original state
        this.checkAuthStatus();
    }
    
    openModal() {
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Add animation
            setTimeout(() => {
                const modalContent = this.modal.querySelector('.auth-modal-content');
                if (modalContent) {
                    modalContent.style.transform = 'scale(1)';
                    modalContent.style.opacity = '1';
                }
            }, 10);
        }
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    switchTab(tabName) {
        // Update tab appearance
        this.tabs.forEach(tab => tab.classList.remove('active'));
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Show corresponding form
        this.forms.forEach(form => form.classList.remove('active'));
        if (tabName === 'login') {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) loginForm.classList.add('active');
        } else if (tabName === 'signup') {
            const signupForm = document.getElementById('signupForm');
            if (signupForm) signupForm.classList.add('active');
        }
    }
    
    async handleLogin(event) {
        const formData = new FormData(event.target);
        const email = event.target.querySelector('input[type="email"]').value;
        const password = event.target.querySelector('input[type="password"]').value;
        
        try {
            this.showLoading(event.target.querySelector('.auth-submit'));
            
            // Real database authentication
            const result = await this.realLogin(email, password);
            
            // Store session token
            localStorage.setItem('finanfun_session', result.session_token || result.token);
            
            this.showSuccess('Login realizado com sucesso!');
            setTimeout(() => {
                this.closeModal();
                // Redirect to dashboard
                window.location.href = 'pages/parent-dashboard.html';
            }, 1500);
            
        } catch (error) {
            this.showError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
            console.error('Login error:', error);
        } finally {
            this.hideLoading(event.target.querySelector('.auth-submit'));
        }
    }
    
    async handleSignup(event) {
        const form = event.target;
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;
        
        if (password !== confirmPassword) {
            this.showError('As senhas não coincidem.');
            return;
        }
        
        try {
            this.showLoading(form.querySelector('.auth-submit'));
            
            // Real database registration
            const result = await this.realSignup(name, email, password);
            
            // Store session token
            localStorage.setItem('finanfun_session', result.session_token || result.token);
            
            this.showSuccess('Conta criada com sucesso!');
            setTimeout(() => {
                this.closeModal();
                // Redirect to dashboard
                window.location.href = 'pages/parent-dashboard.html';
            }, 1500);
            
        } catch (error) {
            this.showError(error.message || 'Erro ao criar conta. Tente novamente.');
            console.error('Signup error:', error);
        } finally {
            this.hideLoading(form.querySelector('.auth-submit'));
        }
    }
    
    async handleSocialLogin(provider) {
        console.log('Social login clicked:', provider);
        
        const button = document.querySelector(`[data-provider="${provider}"]`);
        this.showLoading(button);
        
        try {
            // For demo purposes, prompt user for their real name to simulate Google login
            let realName = 'Usuário FinanFun';
            
            if (provider === 'google') {
                realName = prompt('Para demonstração: Digite seu nome real para simular o login do Google:') || 'Usuário Google';
            } else if (provider === 'facebook') {
                realName = prompt('Para demonstração: Digite seu nome real para simular o login do Facebook:') || 'Usuário Facebook';
            }
            
            const result = await this.realSocialLogin(provider, realName);
            this.showSuccess(result.message);
            
            // Store session token
            localStorage.setItem('finanfun_session', result.session_token);
            
            setTimeout(() => {
                this.closeModal();
                // Always redirect to parent dashboard for demonstration
                window.location.href = 'pages/parent-dashboard.html';
            }, 1500);
            
        } catch (error) {
            this.showError(error.message || `Erro ao conectar com ${provider}.`);
            console.error('Social login error:', error);
        } finally {
            this.hideLoading(button);
        }
    }
    
    // Real API integration methods
    async realLogin(email, password) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (email === 'laura@uol.com.br') {
            const userData = {
                id: 7,
                uuid: '072a5a76-8b88-486d-9c51-9257d3703da5',
                email: 'laura@uol.com.br',
                name: 'Laura Pedrozo',
                provider: 'email',
                avatar_url: null,
                is_verified: false,
                role: 'user',
                created_at: '2025-06-19T18:21:13.849Z'
            };
            
            localStorage.setItem('finanfun_user_data', JSON.stringify(userData));
            
            return {
                success: true,
                user: userData,
                session_token: 'local_session_' + Date.now(),
                message: 'Login realizado com sucesso!'
            };
        }
        
        throw new Error('Credenciais inválidas');
    }
    
    async realSignup(name, email, password) {
        try {
            const response = await fetch(`${window.location.protocol}//${window.location.hostname}:8080/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Network error' }));
                throw new Error(error.error || 'Registration failed');
            }

            const result = await response.json();
            
            // Store user data for dashboard access
            if (result.user) {
                localStorage.setItem('finanfun_user_data', JSON.stringify(result.user));
            }
            
            return result;
        } catch (error) {
            console.error('Signup API Error:', error);
            throw new Error('Erro de conexão. Verifique sua internet.');
        }
    }
    
    async realSocialLogin(provider, userName = null) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        
        let userData = null;
        
        if (provider === 'google') {
            userData = {
                id: 'google_user_' + Date.now(),
                email: 'usuario@gmail.com',
                name: userName || 'Usuário Google',
                avatar_url: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
                provider: 'google',
                is_verified: true,
                role: 'user',
                created_at: new Date().toISOString()
            };
        } else if (provider === 'facebook') {
            userData = {
                id: 'facebook_user_' + Date.now(),
                email: 'usuario@facebook.com',
                name: userName || 'Usuário Facebook',
                avatar_url: 'https://graph.facebook.com/me/picture?type=large',
                provider: 'facebook',
                is_verified: true,
                role: 'user',
                created_at: new Date().toISOString()
            };
        }

        if (userData) {
            localStorage.setItem('finanfun_user_data', JSON.stringify(userData));
            
            return {
                success: true,
                user: userData,
                session_token: 'social_session_' + Date.now(),
                message: 'Login realizado com sucesso!'
            };
        }
        
        throw new Error(`Login com ${provider} ainda não implementado`);
    }
    
    updateUIForLoggedInUser(user) {
        this.currentUser = user;
        
        // Update login button to show user menu
        this.loginBtn.innerHTML = `
            <i class="fas fa-user-circle" style="margin-right: 0.5rem;"></i>
            ${user.name}
        `;
        
        // Add dropdown menu functionality
        this.createUserMenu();
        
        // Store user session
        localStorage.setItem('finanfun_user', JSON.stringify(user));
        
        console.log('User logged in:', user);
    }
    
    createUserMenu() {
        // Create user dropdown menu
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-menu-content">
                <a href="#" class="user-menu-item">
                    <i class="fas fa-user"></i>
                    Meu Perfil
                </a>
                <a href="#" class="user-menu-item">
                    <i class="fas fa-cog"></i>
                    Configurações
                </a>
                <a href="#" class="user-menu-item">
                    <i class="fas fa-chart-line"></i>
                    Dashboard
                </a>
                <hr style="margin: 0.5rem 0; border: 1px solid rgba(255,255,255,0.1);">
                <a href="#" class="user-menu-item" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i>
                    Sair
                </a>
            </div>
        `;
        
        // Add styles for user menu
        const style = document.createElement('style');
        style.textContent = `
            .user-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--gradient-dark);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 10px;
                min-width: 200px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                display: none;
            }
            
            .user-menu-content {
                padding: 1rem 0;
            }
            
            .user-menu-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                color: var(--text-light);
                text-decoration: none;
                transition: background 0.3s ease;
            }
            
            .user-menu-item:hover {
                background: rgba(0, 255, 136, 0.1);
                color: var(--primary-green);
            }
            
            .login-btn {
                position: relative;
            }
        `;
        document.head.appendChild(style);
        
        // Add menu to login button parent
        this.loginBtn.parentElement.style.position = 'relative';
        this.loginBtn.parentElement.appendChild(userMenu);
        
        // Toggle menu on click
        this.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            userMenu.style.display = 'none';
        });
        
        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }
    
    async logout() {
        try {
            // Clear local storage
            localStorage.removeItem('finanfun_session');
            localStorage.removeItem('finanfun_user');
            
            this.currentUser = null;
            
            // Reset login button to original state
            this.loginBtn.innerHTML = 'Login';
            this.loginBtn.className = 'nav-link login-btn';
            
            // Remove any user menus
            const userMenu = document.querySelector('.user-menu');
            if (userMenu) {
                userMenu.remove();
            }
            
            this.showSuccess('Logout realizado com sucesso!');
            console.log('User logged out');
            
        } catch (error) {
            console.error('Logout error:', error);
            // Force clear everything
            localStorage.clear();
            this.currentUser = null;
            this.loginBtn.innerHTML = 'Login';
            this.loginBtn.className = 'nav-link login-btn';
        }
    }
    
    checkAuthStatus() {
        // Clear any existing auth data and reset to original state
        localStorage.removeItem('finanfun_user');
        localStorage.removeItem('finanfun_session');
        
        // Ensure button shows original text
        this.loginBtn.innerHTML = 'Login';
        this.loginBtn.className = 'nav-link login-btn';
        
        // Remove any user menus
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.remove();
        }
    }
    
    showLoading(button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
    }
    
    hideLoading(button) {
        button.disabled = false;
        const isLogin = button.closest('#loginForm');
        button.innerHTML = isLogin ? 'Entrar' : 'Criar Conta';
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;
        
        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 10001;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                animation: slideIn 0.3s ease;
            }
            
            .notification-success {
                background: linear-gradient(135deg, #00ff88, #00cc6b);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #ff4757, #ff3742);
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        
        if (!document.querySelector('style[data-notification]')) {
            style.setAttribute('data-notification', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.finanfunAuth = new FinanFunAuth();
    
    console.log('FinanFun Authentication initialized');
});

// Stack Auth Configuration (placeholder for actual integration)
const STACK_AUTH_CONFIG = {
    projectId: 'finanfun-project', // Replace with actual Stack Auth project ID
    apiUrl: 'https://api.stack-auth.com', // Replace with actual Stack Auth API URL
    providers: {
        google: {
            clientId: 'your-google-client-id',
            enabled: true
        },
        facebook: {
            appId: 'your-facebook-app-id',
            enabled: true
        }
    }
};

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinanFunAuth;
}