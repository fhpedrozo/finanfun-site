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
        this.updateBalanceCards();
        this.loadTasks();
        this.loadAchievements();
        this.setupEventListeners();
        this.initializeAvatarChat();
        this.hideLoadingScreen();
    }

    async loadUserData() {
        try {
            const sessionToken = localStorage.getItem('finanfun_session');
            const storedUserData = localStorage.getItem('finanfun_user_data');
            
            console.log('Session token:', sessionToken);
            console.log('Stored user data:', storedUserData);
            
            if (sessionToken && storedUserData) {
                const userData = JSON.parse(storedUserData);
                console.log('Parsed user data:', userData);
                
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
        try {
            // Mock data for child dashboard
            this.dashboardData = {
                balance: {
                    real: 150.00,
                    bitfun: 250
                },
                tasks: [
                    {
                        id: 1,
                        title: 'Economizar R$ 10 esta semana',
                        description: 'Guarde R$ 10 para alcançar sua meta',
                        reward: 50,
                        progress: 70,
                        completed: false
                    },
                    {
                        id: 2,
                        title: 'Aprender sobre investimentos',
                        description: 'Complete o módulo de investimentos',
                        reward: 30,
                        progress: 100,
                        completed: true
                    }
                ],
                achievements: [
                    {
                        id: 1,
                        title: 'Primeiro Depósito',
                        description: 'Fez seu primeiro depósito!',
                        icon: 'fas fa-medal',
                        earned: true
                    },
                    {
                        id: 2,
                        title: 'Economizador',
                        description: 'Economizou por 7 dias seguidos',
                        icon: 'fas fa-trophy',
                        earned: true
                    }
                ]
            };
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.dashboardData = {
                balance: { real: 0, bitfun: 0 },
                tasks: [],
                achievements: []
            };
        }
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
    }

    updateBalanceCards() {
        if (!this.dashboardData || !this.dashboardData.balance) return;
        
        const realBalanceElement = document.getElementById('real-balance');
        const bitfunBalanceElement = document.getElementById('bitfun-balance');
        
        if (realBalanceElement) {
            const realBalance = this.dashboardData.balance.real || 0;
            realBalanceElement.textContent = `R$ ${realBalance.toFixed(2)}`;
        }
        
        if (bitfunBalanceElement) {
            const bitfunBalance = this.dashboardData.balance.bitfun || 0;
            bitfunBalanceElement.textContent = `${bitfunBalance} BFN`;
        }
    }

    loadTasks() {
        const tasksContainer = document.getElementById('tasks-container');
        if (!tasksContainer || !this.dashboardData.tasks) return;
        
        tasksContainer.innerHTML = '';
        
        this.dashboardData.tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                    <div class="task-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${task.progress}%"></div>
                        </div>
                        <span>${task.progress}%</span>
                    </div>
                </div>
                <div class="task-reward">
                    <span>+${task.reward} BFN</span>
                    ${!task.completed ? '<button class="complete-btn" onclick="completeTask(' + task.id + ')">Completar</button>' : '<span class="completed-badge">✓</span>'}
                </div>
            `;
            tasksContainer.appendChild(taskItem);
        });
        
        this.updateTaskProgress(this.dashboardData.tasks);
    }

    updateTaskProgress(tasks) {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        const taskProgressElement = document.getElementById('task-progress');
        const taskProgressFillElement = document.getElementById('task-progress-fill');
        
        if (taskProgressElement) {
            taskProgressElement.textContent = `${completedTasks}/${totalTasks}`;
        }
        
        if (taskProgressFillElement) {
            taskProgressFillElement.style.width = `${progressPercentage}%`;
        }
    }

    loadAchievements() {
        const achievementsContainer = document.getElementById('achievements-container');
        if (!achievementsContainer) return;
        
        achievementsContainer.innerHTML = '';
        
        const mockAchievements = [
            {
                id: 1,
                title: 'Primeiro Passo',
                description: 'Primeira lição concluída',
                icon: 'fas fa-trophy',
                unlocked: true
            },
            {
                id: 2,
                title: 'Poupador',
                description: 'Economizou por 7 dias',
                icon: 'fas fa-piggy-bank',
                unlocked: true
            },
            {
                id: 3,
                title: 'Investidor',
                description: 'Primeiro investimento',
                icon: 'fas fa-chart-line',
                unlocked: false
            }
        ];
        
        mockAchievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementItem.innerHTML = `
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
            `;
            achievementsContainer.appendChild(achievementItem);
        });
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    initializeAvatarChat() {
        const learningProgress = 45;
        const learningPercentageElement = document.getElementById('learning-percentage');
        const learningProgressFillElement = document.getElementById('learning-progress-fill');
        
        if (learningPercentageElement) {
            learningPercentageElement.textContent = `${learningProgress}%`;
        }
        
        if (learningProgressFillElement) {
            learningProgressFillElement.style.width = `${learningProgress}%`;
        }
    }

    async completeTask(taskId) {
        try {
            alert(`Parabéns! Você completou a tarefa e ganhou BitFun!`);
            this.loadTasks();
        } catch (error) {
            console.error('Error completing task:', error);
            this.showError('Erro ao completar tarefa');
        }
    }

    viewTransactions(accountType) {
        alert(`Ver transações ${accountType} será implementado em breve!`);
    }

    viewGoals() {
        alert('Ver metas será implementado em breve!');
    }

    continueLearning() {
        alert('Continuar aprendizado será implementado em breve!');
    }

    viewAllAchievements() {
        alert('Ver todas as conquistas será implementado em breve!');
    }

    customizeAvatar() {
        alert('Personalizar avatar será implementado em breve!');
    }

    toggleChat() {
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            chatWindow.classList.toggle('hidden');
        }
    }

    async logout() {
        try {
            localStorage.removeItem('finanfun_session');
            localStorage.removeItem('finanfun_user_data');
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Logout error:', error);
            this.showError('Erro ao fazer logout');
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

    showSuccess(message) {
        alert(`✅ ${message}`);
    }

    showError(message) {
        alert(`❌ ${message}`);
    }
}

// Global functions for inline event handlers
let childDashboard = null;

window.viewTransactions = function(accountType) {
    if (childDashboard) {
        childDashboard.viewTransactions(accountType);
    }
};

window.viewGoals = function() {
    if (childDashboard) {
        childDashboard.viewGoals();
    }
};

window.continueLearning = function() {
    if (childDashboard) {
        childDashboard.continueLearning();
    }
};

window.viewAllAchievements = function() {
    if (childDashboard) {
        childDashboard.viewAllAchievements();
    }
};

window.customizeAvatar = function() {
    if (childDashboard) {
        childDashboard.customizeAvatar();
    }
};

window.toggleChat = function() {
    if (childDashboard) {
        childDashboard.toggleChat();
    }
};

window.completeTask = function(taskId) {
    if (childDashboard) {
        childDashboard.completeTask(taskId);
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    childDashboard = new ChildDashboard();
});