// FinanFun Dashboard - Fixed Version
class ParentDashboardFixed {
    constructor() {
        this.userData = null;
        this.dashboardData = null;
        this.init();
    }

    async init() {
        console.log('Parent Dashboard Fixed initializing...');
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
            const storedUserData = localStorage.getItem('finanfun_user_data');
            const sessionToken = localStorage.getItem('finanfun_session');
            
            if (sessionToken && storedUserData) {
                const userData = JSON.parse(storedUserData);
                
                this.userData = {
                    id: userData.id,
                    firstName: userData.name ? userData.name.split(' ')[0] : 'Usuário',
                    lastName: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
                    email: userData.email,
                    profileImageUrl: userData.avatar_url || 'https://via.placeholder.com/150',
                    userType: 'parent'
                };
                
                console.log('User data loaded:', this.userData);
            } else {
                throw new Error('Usuário não autenticado');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            window.location.href = '../index.html';
        }
    }

    async loadDashboardData() {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.dashboardData = {
                totalBalance: 2450.75,
                totalChildren: 3,
                pendingTasks: 8,
                completedGoals: 12,
                familyMembers: [
                    {
                        id: 1,
                        name: 'Ana',
                        age: 12,
                        balance: 450.50,
                        avatar: this.getDefaultAvatar(),
                        status: 'active',
                        lastActivity: '2 horas atrás'
                    },
                    {
                        id: 2,
                        name: 'Bruno',
                        age: 15,
                        balance: 680.25,
                        avatar: this.getDefaultAvatar(),
                        status: 'active',
                        lastActivity: '1 dia atrás'
                    },
                    {
                        id: 3,
                        name: 'Carlos',
                        age: 9,
                        balance: 125.00,
                        avatar: this.getDefaultAvatar(),
                        status: 'pending',
                        lastActivity: '3 dias atrás'
                    }
                ],
                accounts: [
                    {
                        id: 1,
                        type: 'Conta Poupança',
                        balance: 1250.75,
                        currency: 'BRL',
                        icon: 'fas fa-piggy-bank'
                    },
                    {
                        id: 2,
                        type: 'BitFun (Virtual)',
                        balance: 850.50,
                        currency: 'BF',
                        icon: 'fas fa-coins'
                    },
                    {
                        id: 3,
                        type: 'Mesada',
                        balance: 349.50,
                        currency: 'BRL',
                        icon: 'fas fa-wallet'
                    }
                ]
            };
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateUserDisplay() {
        if (!this.userData) return;

        const userNameElement = document.getElementById('userName');
        const userEmailElement = document.getElementById('userEmail');
        const userAvatarElement = document.getElementById('userAvatar');

        if (userNameElement) {
            userNameElement.textContent = `${this.userData.firstName} ${this.userData.lastName}`.trim();
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = this.userData.email;
        }
        
        if (userAvatarElement) {
            userAvatarElement.src = this.userData.profileImageUrl;
            userAvatarElement.alt = `${this.userData.firstName} ${this.userData.lastName}`;
        }
    }

    updateDashboardStats() {
        if (!this.dashboardData) return;

        const elements = {
            totalBalance: document.getElementById('totalBalance'),
            totalChildren: document.getElementById('totalChildren'),
            pendingTasks: document.getElementById('pendingTasks'),
            completedGoals: document.getElementById('completedGoals')
        };

        if (elements.totalBalance) {
            elements.totalBalance.textContent = `R$ ${this.dashboardData.totalBalance.toFixed(2)}`;
        }
        
        if (elements.totalChildren) {
            elements.totalChildren.textContent = this.dashboardData.totalChildren;
        }
        
        if (elements.pendingTasks) {
            elements.pendingTasks.textContent = this.dashboardData.pendingTasks;
        }
        
        if (elements.completedGoals) {
            elements.completedGoals.textContent = this.dashboardData.completedGoals;
        }
    }

    renderFamilyGrid() {
        const familyGrid = document.getElementById('familyGrid');
        if (!familyGrid || !this.dashboardData) return;

        familyGrid.innerHTML = '';

        this.dashboardData.familyMembers.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.className = 'family-member-card';
            memberCard.innerHTML = `
                <div class="member-avatar">
                    <img src="${member.avatar}" alt="${member.name}">
                    <span class="member-status ${member.status}"></span>
                </div>
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p>${member.age} anos</p>
                    <div class="member-balance">
                        R$ ${member.balance.toFixed(2)}
                    </div>
                    <small class="last-activity">${member.lastActivity}</small>
                </div>
                <div class="member-actions">
                    <button class="btn-secondary" onclick="dashboard.viewChildDetails(${member.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
            
            familyGrid.appendChild(memberCard);
        });
    }

    renderAccountsList() {
        const accountsList = document.getElementById('accountsList');
        if (!accountsList || !this.dashboardData) return;

        accountsList.innerHTML = '';

        this.dashboardData.accounts.forEach(account => {
            const accountItem = document.createElement('div');
            accountItem.className = 'account-item';
            accountItem.innerHTML = `
                <div class="account-icon">
                    <i class="${account.icon}"></i>
                </div>
                <div class="account-info">
                    <h4>${account.type}</h4>
                    <div class="account-balance">
                        ${account.currency === 'BRL' ? 'R$' : ''} ${account.balance.toFixed(2)} ${account.currency === 'BF' ? 'BF' : ''}
                    </div>
                </div>
                <div class="account-actions">
                    <button class="btn-secondary">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;
            
            accountsList.appendChild(accountItem);
        });
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Add child button
        const addChildBtn = document.getElementById('addChildBtn');
        if (addChildBtn) {
            addChildBtn.addEventListener('click', () => this.addChild());
        }

        // Create account button
        const createAccountBtn = document.getElementById('createAccountBtn');
        if (createAccountBtn) {
            createAccountBtn.addEventListener('click', () => this.createAccount());
        }
    }

    async logout() {
        localStorage.removeItem('finanfun_user_data');
        localStorage.removeItem('finanfun_session');
        window.location.href = '../index.html';
    }

    addChild() {
        alert('Funcionalidade em desenvolvimento: Adicionar Filho');
    }

    viewChildDetails(childId) {
        alert(`Funcionalidade em desenvolvimento: Ver detalhes do filho ${childId}`);
    }

    createAccount() {
        alert('Funcionalidade em desenvolvimento: Criar Nova Conta');
    }

    getDefaultAvatar() {
        return 'https://via.placeholder.com/80x80/46FE77/ffffff?text=👤';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    showError(message) {
        console.error(message);
        alert(message);
    }
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboard = new ParentDashboardFixed();
    });
} else {
    window.dashboard = new ParentDashboardFixed();
}