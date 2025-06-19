class ParentDashboard {
    constructor() {
        this.userData = null;
        this.dashboardData = null;
        this.init();
    }

    async init() {
        console.log('Parent Dashboard initializing...');
        await this.loadUserData();
        await this.loadDashboardData();
        this.updateUserDisplay();
        this.updateDashboardStats();
        this.renderFamilyGrid();
        this.renderAccountsList();
        this.setupEventListeners();
        this.hideLoadingScreen();
    }

    async loadUserData() {
        try {
            // Load user data from localStorage (set during login)
            const sessionToken = localStorage.getItem('finanfun_session');
            const storedUserData = localStorage.getItem('finanfun_user_data');
            
            if (sessionToken && storedUserData) {
                const userData = JSON.parse(storedUserData);
                
                // Map the data from real login to our format
                this.userData = {
                    id: userData.id,
                    firstName: userData.name ? userData.name.split(' ')[0] : 'Usuário',
                    lastName: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
                    email: userData.email,
                    profileImageUrl: userData.picture || userData.avatar_url || 'https://via.placeholder.com/150',
                    userType: userData.userType || 'parent'
                };
            } else if (sessionToken) {
                // Try to fetch user data from API
                try {
                    const response = await fetch(`${window.location.protocol}//${window.location.hostname}:8080/api/auth/me`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${sessionToken}`,
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const userData = await response.json();
                        this.userData = {
                            id: userData.id,
                            firstName: userData.name ? userData.name.split(' ')[0] : 'Usuário',
                            lastName: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
                            email: userData.email,
                            profileImageUrl: userData.avatar_url || 'https://via.placeholder.com/150',
                            userType: 'parent'
                        };
                        
                        // Store for future use
                        localStorage.setItem('finanfun_user_data', JSON.stringify(userData));
                    } else {
                        throw new Error('Unable to fetch user data');
                    }
                } catch (apiError) {
                    console.error('API Error:', apiError);
                    // Fallback for sessions without stored user data
                    this.userData = {
                        id: 'parent_user_123',
                        firstName: 'Usuário',
                        lastName: 'FinanFun',
                        email: 'usuario@finanfun.com',
                        profileImageUrl: 'https://via.placeholder.com/150',
                        userType: 'parent'
                    };
                }
            } else {
                throw new Error('Usuário não autenticado');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // Redirect to login if no session
            window.location.href = '../index.html';
        }
    }

    async loadDashboardData() {
        try {
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Load mock dashboard data for demonstration
            this.dashboardData = {
                totalBalance: 2450.75,
                childrenCount: 2,
                activeGoals: 4,
                completedTasks: 18,
                familyMembers: [
                    {
                        id: 1,
                        name: 'João Silva',
                        age: 12,
                        avatar: 'https://via.placeholder.com/100',
                        realBalance: 150.00,
                        bitfunBalance: 2500,
                        tasksCompleted: 8,
                        achievementsCount: 12
                    },
                    {
                        id: 2,
                        name: 'Ana Silva',
                        age: 9,
                        avatar: 'https://via.placeholder.com/100',
                        realBalance: 85.50,
                        bitfunBalance: 1800,
                        tasksCompleted: 10,
                        achievementsCount: 8
                    }
                ],
                accounts: [
                    { id: 1, name: 'João - Conta Real', balance: 150.00, type: 'real' },
                    { id: 2, name: 'João - BitFun', balance: 2500, type: 'bitfun' },
                    { id: 3, name: 'Ana - Conta Real', balance: 85.50, type: 'real' },
                    { id: 4, name: 'Ana - BitFun', balance: 1800, type: 'bitfun' }
                ]
            };
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateUserDisplay() {
        if (!this.userData) return;
        
        const userNameElement = document.getElementById('user-name');
        const userAvatarElement = document.getElementById('user-avatar');
        
        if (userNameElement) {
            userNameElement.textContent = `${this.userData.firstName || 'Usuário'} ${this.userData.lastName || ''}`.trim();
        }
        
        if (userAvatarElement) {
            userAvatarElement.src = this.userData.profileImageUrl || this.getDefaultAvatar();
        }
    }

    updateDashboardStats() {
        if (!this.dashboardData) return;
        
        // Update stats cards
        const totalBalanceElement = document.getElementById('total-balance');
        const childrenCountElement = document.getElementById('children-count');
        const activeGoalsElement = document.getElementById('active-goals');
        const completedTasksElement = document.getElementById('completed-tasks');
        
        if (totalBalanceElement) {
            totalBalanceElement.textContent = `R$ ${this.dashboardData.totalBalance.toFixed(2)}`;
        }
        
        if (childrenCountElement) {
            childrenCountElement.textContent = this.dashboardData.childrenCount.toString();
        }
        
        if (activeGoalsElement) {
            activeGoalsElement.textContent = this.dashboardData.activeGoals.toString();
        }
        
        if (completedTasksElement) {
            completedTasksElement.textContent = this.dashboardData.completedTasks.toString();
        }
    }

    renderFamilyGrid() {
        const familyGrid = document.getElementById('family-grid');
        if (!familyGrid) return;
        
        // Clear existing content except add card
        const addCard = familyGrid.querySelector('.add-family-card');
        familyGrid.innerHTML = '';
        if (addCard) {
            familyGrid.appendChild(addCard);
        }
        
        // Mock family members for demonstration
        const mockChildren = [
            { id: 1, name: 'Ana', age: 12, avatar: this.getDefaultAvatar() },
            { id: 2, name: 'Carlos', age: 15, avatar: this.getDefaultAvatar() }
        ];
        
        mockChildren.forEach(child => {
            const childCard = document.createElement('div');
            childCard.className = 'family-card';
            childCard.innerHTML = `
                <img src="${child.avatar}" alt="${child.name}" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 1rem;">
                <h4>${child.name}</h4>
                <p>${child.age} anos</p>
                <button onclick="parentDashboard.viewChildDetails(${child.id})" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: var(--gradient-primary); border: none; border-radius: 6px; cursor: pointer;">
                    Ver Detalhes
                </button>
            `;
            familyGrid.appendChild(childCard);
        });
    }

    renderAccountsList() {
        const accountsList = document.getElementById('accounts-list');
        if (!accountsList || !this.dashboardData) return;
        
        accountsList.innerHTML = '';
        
        if (this.dashboardData.accounts.length === 0) {
            accountsList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-wallet" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nenhuma conta encontrada</p>
                    <p>Crie a primeira conta da família</p>
                </div>
            `;
            return;
        }
        
        this.dashboardData.accounts.forEach(account => {
            const accountItem = document.createElement('div');
            accountItem.className = 'account-item';
            accountItem.innerHTML = `
                <div class="account-info">
                    <h4>${account.account_type === 'real' ? 'Conta Real' : 'Conta BitFun'}</h4>
                    <p>Criada em ${new Date(account.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div class="account-balance">
                    ${account.account_type === 'real' ? 'R$ ' : ''}${parseFloat(account.balance).toFixed(2)}${account.account_type === 'bitfun' ? ' BFN' : ''}
                </div>
            `;
            accountsList.appendChild(accountItem);
        });
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        const addChildBtn = document.getElementById('add-child-btn');
        const createAccountBtn = document.getElementById('create-account-btn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        if (addChildBtn) {
            addChildBtn.addEventListener('click', () => this.addChild());
        }
        
        if (createAccountBtn) {
            createAccountBtn.addEventListener('click', () => this.createAccount());
        }
    }

    async logout() {
        try {
            // Clear local session data
            localStorage.removeItem('finanfun_session');
            localStorage.removeItem('finanfun_user');
            
            // Clear any session storage as well
            sessionStorage.clear();
            
            // Redirect to home page
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even if there's an error
            window.location.href = '../index.html';
        }
    }

    addChild() {
        alert('Funcionalidade de adicionar filho será implementada em breve!');
    }

    viewChildDetails(childId) {
        alert(`Visualizar detalhes do filho ID: ${childId}`);
    }

    createAccount() {
        alert('Funcionalidade de criar conta será implementada em breve!');
    }

    getDefaultAvatar() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0NkZFNzciLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAxMkM3LjU4MTcyIDEyIDQgMTUuNTgxNyA0IDIwVjIySDIwVjIwQzIwIDE1LjU4MTcgMTYuNDE4MyAxMiAxMiAxMloiIGZpbGw9IiMwRDExMTciLz4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjMEQxMTE3Ii8+Cjwvc3ZnPgo8L3N2Zz4K';
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

    showError(message) {
        alert(message);
    }
}

// Global instance for event handlers
let parentDashboard = null;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    parentDashboard = new ParentDashboard();
});