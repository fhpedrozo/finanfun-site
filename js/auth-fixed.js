// FinanFun Authentication - Fixed Version
class FinanFunAuthFixed {
    constructor() {
        this.modal = null;
        this.loginBtn = null;
        this.currentUser = null;
        
        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('FinanFun Authentication Fixed initialized');
        
        // Find login button
        this.loginBtn = document.getElementById('loginBtn');
        if (!this.loginBtn) {
            console.error('Login button not found');
            return;
        }

        // Create modal if it doesn't exist
        this.createModal();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check authentication status
        this.checkAuthStatus();
    }

    createModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('authModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="authModal" class="auth-modal">
                <div class="auth-modal-content">
                    <div class="auth-header">
                        <h2>Acesse sua conta</h2>
                        <button class="auth-close">&times;</button>
                    </div>
                    
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Entrar</button>
                        <button class="auth-tab" data-tab="signup">Criar Conta</button>
                    </div>
                    
                    <div class="auth-content">
                        <form id="loginForm" class="auth-form active">
                            <div class="social-login">
                                <button type="button" class="social-btn google-btn" data-provider="google">
                                    <i class="fab fa-google"></i> Google
                                </button>
                                <button type="button" class="social-btn facebook-btn" data-provider="facebook">
                                    <i class="fab fa-facebook-f"></i> Facebook
                                </button>
                            </div>
                            
                            <div class="divider">ou</div>
                            
                            <div class="form-group">
                                <label for="loginEmail">Email</label>
                                <input type="email" id="loginEmail" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="loginPassword">Senha</label>
                                <input type="password" id="loginPassword" required>
                            </div>
                            
                            <button type="submit" class="auth-submit">Entrar</button>
                            
                            <div class="auth-footer">
                                <a href="#" class="forgot-password">Esqueceu sua senha?</a>
                            </div>
                        </form>
                        
                        <form id="signupForm" class="auth-form">
                            <div class="form-group">
                                <label for="signupName">Nome completo</label>
                                <input type="text" id="signupName" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="signupEmail">Email</label>
                                <input type="email" id="signupEmail" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="signupPassword">Senha</label>
                                <input type="password" id="signupPassword" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirmPassword">Confirmar senha</label>
                                <input type="password" id="confirmPassword" required>
                            </div>
                            
                            <button type="submit" class="auth-submit">Criar Conta</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('authModal');
    }

    setupEventListeners() {
        // Login button
        this.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });

        // Modal close
        const closeBtn = this.modal.querySelector('.auth-close');
        closeBtn.addEventListener('click', () => this.closeModal());

        // Click outside modal
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Tab switching
        const tabs = this.modal.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Form submissions
        const loginForm = this.modal.querySelector('#loginForm');
        const signupForm = this.modal.querySelector('#signupForm');

        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        signupForm.addEventListener('submit', (e) => this.handleSignup(e));

        // Social login buttons
        const socialBtns = this.modal.querySelectorAll('.social-btn');
        socialBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.dataset.provider;
                this.handleSocialLogin(provider);
            });
        });
    }

    openModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    switchTab(tabName) {
        // Update tabs
        const tabs = this.modal.querySelectorAll('.auth-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        const activeTab = this.modal.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Update forms
        const forms = this.modal.querySelectorAll('.auth-form');
        forms.forEach(form => form.classList.remove('active'));
        
        const activeForm = this.modal.querySelector(`#${tabName}Form`);
        if (activeForm) activeForm.classList.add('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.modal.querySelector('#loginEmail').value;
        const password = this.modal.querySelector('#loginPassword').value;
        
        this.showLoading();
        
        try {
            // Local authentication for demonstration
            if (email === 'laura@uol.com.br') {
                const userData = {
                    id: 7,
                    name: 'Laura Pedrozo',
                    email: 'laura@uol.com.br',
                    avatar_url: null,
                    provider: 'email'
                };
                
                localStorage.setItem('finanfun_user_data', JSON.stringify(userData));
                localStorage.setItem('finanfun_session', 'session_' + Date.now());
                
                this.showSuccess('Login realizado com sucesso!');
                
                setTimeout(() => {
                    this.closeModal();
                    window.location.href = 'pages/parent-dashboard.html';
                }, 1500);
                
            } else {
                throw new Error('Credenciais inválidas');
            }
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const name = this.modal.querySelector('#signupName').value;
        const email = this.modal.querySelector('#signupEmail').value;
        const password = this.modal.querySelector('#signupPassword').value;
        const confirmPassword = this.modal.querySelector('#confirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showError('As senhas não coincidem');
            return;
        }
        
        this.showLoading();
        
        try {
            // Create new user locally
            const userData = {
                id: Date.now(),
                name: name,
                email: email,
                avatar_url: null,
                provider: 'email'
            };
            
            localStorage.setItem('finanfun_user_data', JSON.stringify(userData));
            localStorage.setItem('finanfun_session', 'session_' + Date.now());
            
            this.showSuccess('Conta criada com sucesso!');
            
            setTimeout(() => {
                this.closeModal();
                window.location.href = 'pages/parent-dashboard.html';
            }, 1500);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    async handleSocialLogin(provider) {
        console.log('Social login clicked:', provider);
        
        this.showLoading();
        
        try {
            let userData = null;
            
            if (provider === 'google') {
                const userName = prompt('Digite seu nome para demonstração do login Google:') || 'Usuário Google';
                
                userData = {
                    id: 'google_' + Date.now(),
                    name: userName,
                    email: 'usuario@gmail.com',
                    avatar_url: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
                    provider: 'google'
                };
                
            } else if (provider === 'facebook') {
                const userName = prompt('Digite seu nome para demonstração do login Facebook:') || 'Usuário Facebook';
                
                userData = {
                    id: 'facebook_' + Date.now(),
                    name: userName,
                    email: 'usuario@facebook.com',
                    avatar_url: 'https://graph.facebook.com/me/picture?type=large',
                    provider: 'facebook'
                };
            }
            
            if (userData) {
                localStorage.setItem('finanfun_user_data', JSON.stringify(userData));
                localStorage.setItem('finanfun_session', 'session_' + Date.now());
                
                this.showSuccess('Login realizado com sucesso!');
                
                setTimeout(() => {
                    this.closeModal();
                    window.location.href = 'pages/parent-dashboard.html';
                }, 1500);
            }
            
        } catch (error) {
            this.showError(error.message || `Erro ao conectar com ${provider}`);
        } finally {
            this.hideLoading();
        }
    }

    checkAuthStatus() {
        const userData = localStorage.getItem('finanfun_user_data');
        const sessionToken = localStorage.getItem('finanfun_session');
        
        if (userData && sessionToken) {
            try {
                const user = JSON.parse(userData);
                this.updateUIForLoggedInUser(user);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }

    updateUIForLoggedInUser(user) {
        this.currentUser = user;
        
        this.loginBtn.innerHTML = `
            <i class="fas fa-user-circle" style="margin-right: 0.5rem;"></i>
            ${user.name}
        `;
        
        this.loginBtn.onclick = () => this.logout();
    }

    async logout() {
        localStorage.removeItem('finanfun_user_data');
        localStorage.removeItem('finanfun_session');
        
        this.loginBtn.innerHTML = `
            <i class="fas fa-sign-in-alt" style="margin-right: 0.5rem;"></i>
            Login
        `;
        
        this.loginBtn.onclick = (e) => {
            e.preventDefault();
            this.openModal();
        };
        
        this.currentUser = null;
        
        // Redirect to home if on dashboard
        if (window.location.pathname.includes('dashboard')) {
            window.location.href = '../index.html';
        }
    }

    showLoading() {
        const submitBtns = this.modal.querySelectorAll('.auth-submit, .social-btn');
        submitBtns.forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        });
    }

    hideLoading() {
        const loginSubmit = this.modal.querySelector('#loginForm .auth-submit');
        const signupSubmit = this.modal.querySelector('#signupForm .auth-submit');
        const googleBtn = this.modal.querySelector('.google-btn');
        const facebookBtn = this.modal.querySelector('.facebook-btn');

        if (loginSubmit) {
            loginSubmit.disabled = false;
            loginSubmit.innerHTML = 'Entrar';
        }
        
        if (signupSubmit) {
            signupSubmit.disabled = false;
            signupSubmit.innerHTML = 'Criar Conta';
        }
        
        if (googleBtn) {
            googleBtn.disabled = false;
            googleBtn.innerHTML = '<i class="fab fa-google"></i> Google';
        }
        
        if (facebookBtn) {
            facebookBtn.disabled = false;
            facebookBtn.innerHTML = '<i class="fab fa-facebook-f"></i> Facebook';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.auth-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
new FinanFunAuthFixed();