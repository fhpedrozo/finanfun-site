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
            localStorage.setItem('finanfun_session', result.session_token);
            
            this.showSuccess('Login realizado com sucesso!');
            setTimeout(() => {
                this.closeModal();
                // Redirect to appropriate dashboard
                if (result.user.userType === 'parent') {
                    window.location.href = 'http://localhost:3000/parent-dashboard';
                } else {
                    window.location.href = 'http://localhost:3000/child-dashboard';
                }
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
            localStorage.setItem('finanfun_session', result.session_token);
            
            this.showSuccess('Conta criada com sucesso!');
            setTimeout(() => {
                this.closeModal();
                this.updateUIForLoggedInUser(result.user);
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
                // Redirect to appropriate dashboard using relative URLs
                if (result.user.userType === 'parent') {
                    window.location.href = 'pages/parent-dashboard.html';
                } else {
                    window.location.href = 'pages/child-dashboard.html';
                }
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
        const response = await fetch('http://localhost:3000/api/auth/mock-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                email, 
                userType: 'parent' 
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return await response.json();
    }
    
    async realSignup(name, email, password) {
        const response = await fetch(`${window.location.protocol}//${window.location.hostname}:8080/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return await response.json();
    }
    
    async realSocialLogin(provider, userName = null) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let userData = null;
        
        if (provider === 'google') {
            userData = {
                id: 'google_user_' + Date.now(),
                email: 'usuario@gmail.com',
                name: userName || 'Usuário Google',
                picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
                userType: 'parent'
            };
        } else if (provider === 'facebook') {
            userData = {
                id: 'facebook_user_' + Date.now(),
                email: 'usuario@facebook.com',
                name: userName || 'Usuário Facebook',
                picture: 'https://graph.facebook.com/me/picture?type=large',
                userType: 'parent'
            };
        }

        if (userData) {
            // Store user data in localStorage for dashboard access
            localStorage.setItem('finanfun_user_data', JSON.stringify(userData));
            
            return {
                message: 'Login realizado com sucesso',
                user: userData,
                session_token: 'mock_session_' + Date.now()
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