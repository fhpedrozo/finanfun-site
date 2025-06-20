class ChildDashboard {
    constructor() {
        this.userData = null;
        this.dashboardData = null;
        this.init();
    }

    async init() {
        console.log('Child Dashboard initializing...');
        await this.loadUserData();
        await this.loadDashboardData();
        this.updateUserDisplay();
        this.setupEventListeners();
        this.hideLoadingScreen();
    }

    async loadUserData() {
        try {
            const sessionToken = localStorage.getItem('finanfun_session');
            const storedUserData = localStorage.getItem('finanfun_user_data');
            
            if (sessionToken && storedUserData) {
                const userData = JSON.parse(storedUserData);
                
                this.userData = {
                    id: userData.id,
                    firstName: userData.name ? userData.name.split(' ')[0] : 'Jovem',
                    lastName: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
                    email: userData.email,
                    profileImageUrl: userData.avatar_url || userData.picture || 'https://via.placeholder.com/150',
                    userType: 'child'
                };
                
                console.log('User data loaded successfully:', this.userData);
            } else {
                console.log('No session found, using demo data for child dashboard');
                this.userData = {
                    id: 'demo_child',
                    firstName: 'Jovem',
                    lastName: 'Investidor',
                    email: 'jovem@finanfun.com',
                    profileImageUrl: 'https://via.placeholder.com/150',
                    userType: 'child'
                };
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.userData = {
                id: 'demo_child',
                firstName: 'Jovem',
                lastName: 'Investidor',
                email: 'jovem@finanfun.com',
                profileImageUrl: 'https://via.placeholder.com/150',
                userType: 'child'
            };
        }
    }

    async loadDashboardData() {
        // Simple static data without complex balance objects
        this.dashboardData = {
            realBalance: 150,
            bitfunBalance: 250,
            tasks: 2,
            achievements: 3
        };
        console.log('Dashboard data loaded successfully');
    }

    updateUserDisplay() {
        if (!this.userData) return;
        
        const userNameElement = document.getElementById('user-name');
        const userAvatarElement = document.getElementById('user-avatar');
        
        if (userNameElement) {
            userNameElement.textContent = `${this.userData.firstName || 'Jovem'} ${this.userData.lastName || 'Investidor'}`.trim();
        }
        
        if (userAvatarElement) {
            userAvatarElement.src = this.userData.profileImageUrl || this.getDefaultAvatar();
        }

        // Update balance displays with simple approach
        const realBalanceElement = document.getElementById('real-balance');
        const bitfunBalanceElement = document.getElementById('bitfun-balance');
        
        if (realBalanceElement && this.dashboardData) {
            realBalanceElement.textContent = `R$ ${this.dashboardData.realBalance},00`;
        }
        
        if (bitfunBalanceElement && this.dashboardData) {
            bitfunBalanceElement.textContent = `${this.dashboardData.bitfunBalance} BFN`;
        }
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async logout() {
        try {
            localStorage.removeItem('finanfun_session');
            localStorage.removeItem('finanfun_user_data');
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Erro ao fazer logout');
        }
    }

    getDefaultAvatar() {
        return 'https://via.placeholder.com/80x80/46FE77/ffffff?text=👤';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const dashboardContainer = document.getElementById('dashboard-container');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (dashboardContainer) {
            dashboardContainer.classList.remove('hidden');
        }
    }
}

// Global functions for inline event handlers
let childDashboard = null;

window.viewTransactions = function(accountType) {
    alert(`Ver transações ${accountType} será implementado em breve!`);
};

window.viewGoals = function() {
    alert('Ver metas será implementado em breve!');
};

window.continueLearning = function() {
    alert('Continuar aprendizado será implementado em breve!');
};

window.viewAllAchievements = function() {
    alert('Ver todas as conquistas será implementado em breve!');
};

window.customizeAvatar = function() {
    alert('Personalizar avatar será implementado em breve!');
};

window.toggleChat = function() {
    alert('Chat com avatar será implementado em breve!');
};

window.completeTask = function(taskId) {
    alert('Completar tarefa será implementado em breve!');
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    childDashboard = new ChildDashboard();
});