/**
 * ========================================
 * Sistema de Gestão Professional
 * Módulo de Armazenamento - store.js
 * ========================================
 * 
 * Este módulo é responsável pelo gerenciamento de estado
 * e persistência de dados utilizando localStorage.
 */

// Configuração de chaves do localStorage
const STORAGE_KEYS = {
    PRODUCTS: 'sgpro_products',
    SALES: 'sgpro_sales',
    EXPENSES: 'sgpro_expenses',
    USERS: 'sgpro_users',
    LOGS: 'sgpro_logs',
    CURRENT_USER: 'sgpro_currentUser',
    SETTINGS: 'sgpro_settings'
};

/**
 * Estado reativo da aplicação.
 * Contém todos os dados que precisam ser persistidos.
 */
const state = {
    currentUser: null,
    products: [],
    sales: [],
    expenses: [],
    users: [],
    logs: [],
    settings: {
        companyName: 'Minha Empresa',
        currency: 'AOA',
        dateFormat: 'dd/mm/yyyy',
        lowStockThreshold: 10,
        taxRate: 0
    }
};

/**
 * Objeto Store - Gerenciamento de Estado e Dados
 */
const Store = {
    /**
     * Inicializa o store, carregando dados do localStorage
     * ou criando dados iniciais se necessário.
     */
    init() {
        this.loadFromStorage();
        this.initializeDefaultData();
        this.syncLogs();
    },
    
    /**
     * Carrega todos os dados do localStorage.
     */
    loadFromStorage() {
        try {
            // Carrega produtos
            const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
            state.products = savedProducts ? JSON.parse(savedProducts) : [];
            
            // Carrega vendas
            const savedSales = localStorage.getItem(STORAGE_KEYS.SALES);
            state.sales = savedSales ? JSON.parse(savedSales) : [];
            
            // Carrega despesas
            const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
            state.expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
            
            // Carrega usuários
            const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
            state.users = savedUsers ? JSON.parse(savedUsers) : [];
            
            // Carrega logs
            const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
            state.logs = savedLogs ? JSON.parse(savedLogs) : [];
            
            // Carrega configurações
            const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (savedSettings) {
                state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
            }
            
            // Carrega usuário atual
            const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            if (savedUser) {
                state.currentUser = JSON.parse(savedUser);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do localStorage:', error);
            this.handleStorageError();
        }
    },
    
    /**
     * Salva todos os dados no localStorage.
     */
    saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products));
            localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(state.sales));
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(state.expenses));
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(state.users));
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
            
            if (state.currentUser) {
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
            }
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            this.handleStorageError();
        }
    },
    
    /**
     * Inicializa dados padrão se não existirem.
     */
    initializeDefaultData() {
        // Inicializa usuários padrão se não existirem
        if (state.users.length === 0) {
            this.createDefaultUsers();
        }
        
        // Inicializa produtos de exemplo se não existirem
        if (state.products.length === 0) {
            this.createSampleProducts();
        }
        
        // Salva os dados iniciais
        this.saveToStorage();
    },
    
    /**
     * Cria usuários padrão do sistema.
     */
    createDefaultUsers() {
        state.users = [
            {
                id: 'user_1',
                username: 'admin',
                password: 'admin',
                fullName: 'Administrador do Sistema',
                email: 'admin@sistema.com',
                profile: 'admin',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_2',
                username: 'operador',
                password: 'operador',
                fullName: 'Operador Padrão',
                email: 'operador@sistema.com',
                profile: 'operator',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_3',
                username: 'gerente',
                password: 'gerente',
                fullName: 'Gerente Regional',
                email: 'gerente@sistema.com',
                profile: 'manager',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            }
        ];
        
        this.addLog('system', 'sistema', 'Usuários padrão criados durante a inicialização');
    },
    
    /**
     * Cria produtos de exemplo.
     */
    createSampleProducts() {
        state.products = [
            {
                id: 'prod_1',
                code: 'ELEC001',
                name: 'Smartphone X200',
                category: 'Eletrônicos',
                cost: 800,
                price: 1499,
                stock: 25,
                description: 'Smartphone de última geração com tela AMOLED'
            },
            {
                id: 'prod_2',
                code: 'ELEC002',
                name: 'Notebook Pro 15',
                category: 'Eletrônicos',
                cost: 2500,
                price: 4299,
                stock: 12,
                description: 'Notebook profissional com processador i7'
            },
            {
                id: 'prod_3',
                code: 'ROUP001',
                name: 'Camiseta Básica',
                category: 'Roupas',
                cost: 15,
                price: 49.90,
                stock: 100,
                description: 'Camiseta 100% algodão diversas cores'
            },
            {
                id: 'prod_4',
                code: 'ALIM001',
                name: 'Café Especial 500g',
                category: 'Alimentos',
                cost: 25,
                price: 59.90,
                stock: 50,
                description: 'Café torrado e moído premium'
            },
            {
                id: 'prod_5',
                code: 'BEB001',
                name: 'Água Mineral 500ml',
                category: 'Bebidas',
                cost: 1.50,
                price: 3.50,
                stock: 200,
                description: 'Água mineral sem gás'
            }
        ];
        
        this.addLog('system', 'sistema', 'Produtos de exemplo criados durante a inicialização');
    },
    
    /**
     * Sincroniza logs com o servidor ou API (para futuras implementações).
     */
    syncLogs() {
        //预留用于未来实现服务器同步功能
        //此函数可以在将来连接到后端API时使用
    },
    
    /**
     * Lida com erros de armazenamento.
     */
    handleStorageError() {
        // Verifica se o localStorage está disponível
        if (!this.isStorageAvailable()) {
            console.warn('localStorage não está disponível. Os dados não serão persistidos.');
            
            // Define um indicador de que estamos em modo somente leitura
            state.settings.readOnlyMode = true;
        }
    },
    
    /**
     * Verifica se localStorage está disponível.
     * 
     * @returns {boolean} True se disponível.
     */
    isStorageAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // ==================== AUTENTICAÇÃO ====================
    
    /**
     * Efetua login de usuário.
     * 
     * @param {string} username - Nome de usuário.
     * @param {string} password - Senha.
     * @returns {Object|null} O usuário logado ou null se falhar.
     */
    login(username, password) {
        const user = state.users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password
        );
        
        if (user) {
            if (!user.active) {
                return { success: false, message: 'Usuário inativo. Contate o administrador.' };
            }
            
            // Atualiza último login
            user.lastLogin = new Date().toISOString();
            
            // Define usuário atual
            state.currentUser = {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                profile: user.profile,
                permissions: this.getUserPermissions(user.profile)
            };
            
            this.saveToStorage();
            this.addLog('login', 'usuarios', `Login realizado com sucesso`, user.id, user.fullName);
            
            return { success: true, user: state.currentUser };
        }
        
        this.addLog('login', 'usuarios', `Falha de login para usuário: ${username}`);
        return { success: false, message: 'Usuário ou senha inválidos.' };
    },
    
    /**
     * Efetua logout do usuário atual.
     */
    logout() {
        if (state.currentUser) {
            this.addLog('logout', 'usuarios', `Logout realizado`, state.currentUser.id, state.currentUser.fullName);
        }
        
        state.currentUser = null;
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },
    
    /**
     * Verifica se há um usuário logado.
     * 
     * @returns {boolean} True se há usuário logado.
     */
    isLoggedIn() {
        return state.currentUser !== null;
    },
    
    /**
     * Retorna as permissões baseadas no perfil do usuário.
     * 
     * @param {string} profile - Perfil do usuário.
     * @returns {Object} Permissões do usuário.
     */
    getUserPermissions(profile) {
        const permissions = {
            dashboard: true,
            products: { view: true, create: true, edit: true, delete: true },
            sales: { view: true, create: true, edit: false, delete: true },
            expenses: { view: true, create: true, edit: true, delete: true },
            reports: { view: true, export: true },
            users: { view: false, create: false, edit: false, delete: false },
            logs: { view: false },
            settings: { view: false, edit: false }
        };
        
        switch (profile) {
            case 'admin':
                // Administrador tem acesso total
                return {
                    dashboard: true,
                    products: { view: true, create: true, edit: true, delete: true },
                    sales: { view: true, create: true, edit: true, delete: true },
                    expenses: { view: true, create: true, edit: true, delete: true },
                    reports: { view: true, export: true },
                    users: { view: true, create: true, edit: true, delete: true },
                    logs: { view: true, export: true },
                    settings: { view: true, edit: true }
                };
                
            case 'manager':
                // Gerente tem acesso à maioria das funções, exceto usuários
                return {
                    dashboard: true,
                    products: { view: true, create: true, edit: true, delete: true },
                    sales: { view: true, create: true, edit: true, delete: true },
                    expenses: { view: true, create: true, edit: true, delete: true },
                    reports: { view: true, export: true },
                    users: { view: false, create: false, edit: false, delete: false },
                    logs: { view: true, export: false },
                    settings: { view: false, edit: false }
                };
                
            case 'operator':
                // Operador tem acesso limitado
                return {
                    dashboard: true,
                    products: { view: true, create: false, edit: false, delete: false },
                    sales: { view: true, create: true, edit: false, delete: false },
                    expenses: { view: true, create: false, edit: false, delete: false },
                    reports: { view: true, export: false },
                    users: { view: false, create: false, edit: false, delete: false },
                    logs: { view: false, export: false },
                    settings: { view: false, edit: false }
                };
                
            default:
                return permissions;
        }
    },
    
    /**
     * Verifica se o usuário tem permissão para uma ação.
     * 
     * @param {string} permission - Permissão a ser verificada.
     * @returns {boolean} True se tem permissão.
     */
    hasPermission(permission) {
        if (!state.currentUser) return false;
        
        const perms = this.getUserPermissions(state.currentUser.profile);
        
        // Verifica permissões simples (booleanas)
        if (typeof perms[permission] === 'boolean') {
            return perms[permission];
        }
        
        // Verifica permissões compostas
        const [module, action] = permission.split('.');
        if (perms[module] && typeof perms[module][action] === 'boolean') {
            return perms[module][action];
        }
        
        return false;
    },
    
    // ==================== PRODUTOS ====================
    
    /**
     * Adiciona um novo produto.
     * 
     * @param {Object} product - Dados do produto.
     * @returns {Object} O produto criado.
     */
    addProduct(product) {
        const newProduct = {
            id: 'prod_' + Date.now().toString(36),
            ...product,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        state.products.push(newProduct);
        this.saveToStorage();
        
        this.addLog('create', 'produtos', `Produto criado: ${product.name} (Código: ${product.code})`);
        
        return newProduct;
    },
    
    /**
     * Atualiza um produto existente.
     * 
     * @param {string} id - ID do produto.
     * @param {Object} updates - Dados a serem atualizados.
     * @returns {Object|null} O produto atualizado ou null.
     */
    updateProduct(id, updates) {
        const index = state.products.findIndex(p => p.id === id);
        
        if (index === -1) return null;
        
        state.products[index] = {
            ...state.products[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.saveToStorage();
        this.addLog('update', 'produtos', `Produto atualizado: ${state.products[index].name} (Código: ${state.products[index].code})`);
        
        return state.products[index];
    },
    
    /**
     * Remove um produto.
     * 
     * @param {string} id - ID do produto.
     * @returns {boolean} True se removido com sucesso.
     */
    deleteProduct(id) {
        const index = state.products.findIndex(p => p.id === id);
        
        if (index === -1) return false;
        
        const product = state.products[index];
        state.products.splice(index, 1);
        
        this.saveToStorage();
        this.addLog('delete', 'produtos', `Produto excluído: ${product.name} (Código: ${product.code})`);
        
        return true;
    },
    
    /**
     * Busca produtos por termo.
     * 
     * @param {string} query - Termo de busca.
     * @returns {Array} Produtos encontrados.
     */
    searchProducts(query) {
        if (!query) return state.products;
        
        const lowerQuery = query.toLowerCase();
        
        return state.products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.code.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
        );
    },
    
    /**
     * Retorna produto por ID.
     * 
     * @param {string} id - ID do produto.
     * @returns {Object|null} O produto ou null.
     */
    getProduct(id) {
        return state.products.find(p => p.id === id);
    },
    
    /**
     * Retorna produtos com estoque baixo.
     * 
     * @param {number} threshold - Limite de estoque.
     * @returns {Array} Produtos com estoque baixo.
     */
    getLowStockProducts(threshold = 10) {
        return state.products.filter(p => p.stock < threshold);
    },
    
    /**
     * Retorna o valor total do estoque.
     * 
     * @returns {number} Valor total do estoque.
     */
    getTotalStockValue() {
        return state.products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
    },
    
    // ==================== VENDAS ====================
    
    /**
     * Adiciona uma nova venda.
     * 
     * @param {Object} sale - Dados da venda.
     * @returns {Object} A venda criada.
     */
    addSale(sale) {
        const newSale = {
            id: 'sale_' + Date.now().toString(36),
            ...sale,
            createdAt: new Date().toISOString()
        };
        
        state.sales.unshift(newSale);
        this.saveToStorage();
        
        this.addLog('create', 'vendas', `Venda realizada: ${sale.client} - Total: ${formatCurrency(sale.total)}`);
        
        return newSale;
    },
    
    /**
     * Remove uma venda.
     * 
     * @param {string} id - ID da venda.
     * @returns {boolean} True se removida com sucesso.
     */
    deleteSale(id) {
        const index = state.sales.findIndex(s => s.id === id);
        
        if (index === -1) return false;
        
        const sale = state.sales[index];
        state.sales.splice(index, 1);
        
        this.saveToStorage();
        this.addLog('delete', 'vendas', `Venda excluída: ${sale.client} - Total: ${formatCurrency(sale.total)}`);
        
        return true;
    },
    
    /**
     * Busca vendas por termo.
     * 
     * @param {string} query - Termo de busca.
     * @returns {Array} Vendas encontradas.
     */
    searchSales(query) {
        if (!query) return state.sales;
        
        const lowerQuery = query.toLowerCase();
        
        return state.sales.filter(s =>
            s.client.toLowerCase().includes(lowerQuery) ||
            s.id.toLowerCase().includes(lowerQuery)
        );
    },
    
    /**
     * Filtra vendas por período.
     * 
     * @param {string} startDate - Data de início.
     * @param {string} endDate - Data de fim.
     * @returns {Array} Vendas no período.
     */
    filterSalesByDate(startDate, endDate) {
        let filtered = state.sales;
        
        if (startDate) {
            filtered = filtered.filter(s => s.date >= startDate);
        }
        
        if (endDate) {
            filtered = filtered.filter(s => s.date <= endDate);
        }
        
        return filtered;
    },
    
    /**
     * Retorna vendas por período.
     * 
     * @param {string} period - Período ('today', 'week', 'month', 'year').
     * @returns {Array} Vendas no período.
     */
    getSalesByPeriod(period) {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return state.sales;
        }
        
        return state.sales.filter(s => new Date(s.date) >= startDate);
    },
    
    /**
     * Retorna o total de vendas.
     * 
     * @param {Array} sales - Array de vendas (opcional).
     * @returns {number} Total das vendas.
     */
    getTotalSales(sales = null) {
        const salesData = sales || state.sales;
        return salesData.reduce((sum, s) => sum + s.total, 0);
    },
    
    /**
     * Retorna o custo total das vendas.
     * 
     * @param {Array} sales - Array de vendas (opcional).
     * @returns {number} Custo total.
     */
    getTotalCost(sales = null) {
        const salesData = sales || state.sales;
        return salesData.reduce((sum, s) => sum + s.cost, 0);
    },
    
    /**
     * Retorna o lucro total das vendas.
     * 
     * @param {Array} sales - Array de vendas (opcional).
     * @returns {number} Lucro total.
     */
    getTotalProfit(sales = null) {
        return this.getTotalSales(sales) - this.getTotalCost(sales);
    },
    
    /**
     * Retorna produtos mais vendidos.
     * 
     * @param {number} limit - Limite de produtos.
     * @returns {Array} Produtos mais vendidos.
     */
    getTopSellingProducts(limit = 5) {
        const productSales = {};
        
        state.sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.total;
            });
        });
        
        return Object.entries(productSales)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit);
    },
    
    // ==================== DESPESAS ====================
    
    /**
     * Adiciona uma nova despesa.
     * 
     * @param {Object} expense - Dados da despesa.
     * @returns {Object} A despesa criada.
     */
    addExpense(expense) {
        const newExpense = {
            id: 'exp_' + Date.now().toString(36),
            ...expense,
            createdAt: new Date().toISOString()
        };
        
        state.expenses.unshift(newExpense);
        this.saveToStorage();
        
        this.addLog('create', 'despesas', `Despesa registrada: ${expense.description} - ${formatCurrency(expense.value)}`);
        
        return newExpense;
    },
    
    /**
     * Remove uma despesa.
     * 
     * @param {string} id - ID da despesa.
     * @returns {boolean} True se removida com sucesso.
     */
    deleteExpense(id) {
        const index = state.expenses.findIndex(e => e.id === id);
        
        if (index === -1) return false;
        
        const expense = state.expenses[index];
        state.expenses.splice(index, 1);
        
        this.saveToStorage();
        this.addLog('delete', 'despesas', `Despesa excluída: ${expense.description} - ${formatCurrency(expense.value)}`);
        
        return true;
    },
    
    /**
     * Busca despesas por termo.
     * 
     * @param {string} query - Termo de busca.
     * @returns {Array} Despesas encontradas.
     */
    searchExpenses(query) {
        if (!query) return state.expenses;
        
        const lowerQuery = query.toLowerCase();
        
        return state.expenses.filter(e =>
            e.description.toLowerCase().includes(lowerQuery) ||
            e.category.toLowerCase().includes(lowerQuery)
        );
    },
    
    /**
     * Filtra despesas por período.
     * 
     * @param {string} startDate - Data de início.
     * @param {string} endDate - Data de fim.
     * @returns {Array} Despesas no período.
     */
    filterExpensesByDate(startDate, endDate) {
        let filtered = state.expenses;
        
        if (startDate) {
            filtered = filtered.filter(e => e.date >= startDate);
        }
        
        if (endDate) {
            filtered = filtered.filter(e => e.date <= endDate);
        }
        
        return filtered;
    },
    
    /**
     * Retorna o total de despesas.
     * 
     * @param {Array} expenses - Array de despesas (opcional).
     * @returns {number} Total das despesas.
     */
    getTotalExpenses(expenses = null) {
        const expensesData = expenses || state.expenses;
        return expensesData.reduce((sum, e) => sum + e.value, 0);
    },
    
    /**
     * Retorna despesas agrupadas por categoria.
     * 
     * @param {Array} expenses - Array de despesas (opcional).
     * @returns {Object} Despesas por categoria.
     */
    getExpensesByCategory(expenses = null) {
        const expensesData = expenses || state.expenses;
        const grouped = {};
        
        expensesData.forEach(e => {
            if (!grouped[e.category]) {
                grouped[e.category] = 0;
            }
            grouped[e.category] += e.value;
        });
        
        return grouped;
    },
    
    // ==================== USUÁRIOS ====================
    
    /**
     * Adiciona um novo usuário.
     * 
     * @param {Object} user - Dados do usuário.
     * @returns {Object} O usuário criado.
     */
    addUser(user) {
        const newUser = {
            id: 'user_' + Date.now().toString(36),
            ...user,
            active: true,
            lastLogin: null,
            createdAt: new Date().toISOString()
        };
        
        state.users.push(newUser);
        this.saveToStorage();
        
        this.addLog('create', 'usuarios', `Usuário criado: ${user.username}`);
        
        return newUser;
    },
    
    /**
     * Atualiza um usuário existente.
     * 
     * @param {string} id - ID do usuário.
     * @param {Object} updates - Dados a serem atualizados.
     * @returns {Object|null} O usuário atualizado ou null.
     */
    updateUser(id, updates) {
        const index = state.users.findIndex(u => u.id === id);
        
        if (index === -1) return null;
        
        // Não permite alterar ID ou createdAt
        delete updates.id;
        delete updates.createdAt;
        
        // Se houver senha, mantém a anterior se não for fornecida nova
        if (!updates.password) {
            delete updates.password;
        }
        
        state.users[index] = {
            ...state.users[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.saveToStorage();
        this.addLog('update', 'usuarios', `Usuário atualizado: ${state.users[index].username}`);
        
        return state.users[index];
    },
    
    /**
     * Remove um usuário.
     * 
     * @param {string} id - ID do usuário.
     * @returns {boolean} True se removido com sucesso.
     */
    deleteUser(id) {
        const index = state.users.findIndex(u => u.id === id);
        
        if (index === -1) return false;
        
        const user = state.users[index];
        state.users.splice(index, 1);
        
        this.saveToStorage();
        this.addLog('delete', 'usuarios', `Usuário excluído: ${user.username}`);
        
        return true;
    },
    
    /**
     * Retorna usuário por ID.
     * 
     * @param {string} id - ID do usuário.
     * @returns {Object|null} O usuário ou null.
     */
    getUser(id) {
        return state.users.find(u => u.id === id);
    },
    
    /**
     * Retorna usuário por username.
     * 
     * @param {string} username - Nome de usuário.
     * @returns {Object|null} O usuário ou null.
     */
    getUserByUsername(username) {
        return state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    },
    
    // ==================== LOGS ====================
    
    /**
     * Adiciona um novo registro de log.
     * 
     * @param {string} action - Ação realizada (create, update, delete, login, logout, system).
     * @param {string} module - Módulo afetado (produtos, vendas, despesas, usuarios, sistema).
     * @param {string} details - Descrição detalhada da ação.
     * @param {string} userId - ID do usuário (opcional).
     * @param {string} userName - Nome do usuário (opcional).
     * @returns {Object} O log criado.
     */
    addLog(action, module, details, userId = null, userName = null) {
        const log = {
            id: 'log_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
            timestamp: new Date().toISOString(),
            action: action,
            module: module,
            details: details,
            userId: userId || (state.currentUser ? state.currentUser.id : null),
            userName: userName || (state.currentUser ? state.currentUser.fullName : 'Sistema')
        };
        
        state.logs.unshift(log);
        
        // Limita o número de logs armazenados (máximo 1000)
        if (state.logs.length > 1000) {
            state.logs = state.logs.slice(0, 1000);
        }
        
        // Salva apenas os logs, não todos os dados
        this.saveLogs();
        
        return log;
    },
    
    /**
     * Salva apenas os logs no localStorage.
     */
    saveLogs() {
        try {
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
        } catch (error) {
            console.error('Erro ao salvar logs:', error);
        }
    },
    
    /**
     * Filtra logs por critérios.
     * 
     * @param {Object} filters - Filtros a serem aplicados.
     * @returns {Array} Logs filtrados.
     */
    filterLogs(filters = {}) {
        let filtered = [...state.logs];
        
        if (filters.action && filters.action !== 'all') {
            filtered = filtered.filter(l => l.action === filters.action);
        }
        
        if (filters.module && filters.module !== 'all') {
            filtered = filtered.filter(l => l.module === filters.module);
        }
        
        if (filters.date) {
            filtered = filtered.filter(l => l.timestamp.startsWith(filters.date));
        }
        
        if (filters.userId) {
            filtered = filtered.filter(l => l.userId === filters.userId);
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(l => 
                l.details.toLowerCase().includes(search) ||
                l.module.toLowerCase().includes(search) ||
                l.userName.toLowerCase().includes(search)
            );
        }
        
        return filtered;
    },
    
    /**
     * Limpa todos os logs.
     */
    clearLogs() {
        state.logs = [];
        this.saveLogs();
        this.addLog('system', 'sistema', 'Logs limpos manualmente');
    },
    
    // ==================== RELATÓRIOS ====================
    
    /**
     * Gera dados para relatório financeiro.
     * 
     * @param {string} startDate - Data de início.
     * @param {string} endDate - Data de fim.
     * @returns {Object} Dados do relatório.
     */
    getFinancialReport(startDate, endDate) {
        const sales = this.filterSalesByDate(startDate, endDate);
        const expenses = this.filterExpensesByDate(startDate, endDate);
        
        const totalSales = this.getTotalSales(sales);
        const totalCost = this.getTotalCost(sales);
        const grossProfit = totalSales - totalCost;
        const totalExpenses = this.getTotalExpenses(expenses);
        const netProfit = grossProfit - totalExpenses;
        
        const expensesByCategory = this.getExpensesByCategory(expenses);
        
        // Vendas por mês
        const salesByMonth = {};
        const months = getLastMonths(12);
        
        months.forEach(m => {
            const key = `${m.year}-${String(m.month + 1).padStart(2, '0')}`;
            salesByMonth[key] = {
                label: m.label,
                sales: 0,
                expenses: 0,
                profit: 0
            };
        });
        
        sales.forEach(sale => {
            const month = sale.date.substring(0, 7);
            if (salesByMonth[month]) {
                salesByMonth[month].sales += sale.total;
                salesByMonth[month].profit += (sale.total - sale.cost);
            }
        });
        
        expenses.forEach(e => {
            const month = e.date.substring(0, 7);
            if (salesByMonth[month]) {
                salesByMonth[month].expenses += e.value;
                salesByMonth[month].profit -= e.value;
            }
        });
        
        return {
            totalSales,
            totalCost,
            grossProfit,
            totalExpenses,
            netProfit,
            expensesByCategory,
            salesByMonth: Object.values(salesByMonth),
            salesCount: sales.length,
            expensesCount: expenses.length,
            period: { startDate, endDate }
        };
    },
    
    /**
     * Gera dados para relatório de estoque.
     * 
     * @returns {Object} Dados do relatório.
     */
    getStockReport() {
        const totalProducts = state.products.length;
        const totalItems = state.products.reduce((sum, p) => sum + p.stock, 0);
        const totalValue = state.products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
        const totalRetailValue = state.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        
        const lowStock = state.products.filter(p => p.stock < state.settings.lowStockThreshold);
        const outOfStock = state.products.filter(p => p.stock === 0);
        
        const valueByCategory = {};
        state.products.forEach(p => {
            if (!valueByCategory[p.category]) {
                valueByCategory[p.category] = { count: 0, value: 0 };
            }
            valueByCategory[p.category].count += p.stock;
            valueByCategory[p.category].value += (p.cost * p.stock);
        });
        
        return {
            totalProducts,
            totalItems,
            totalValue,
            totalRetailValue,
            potentialProfit: totalRetailValue - totalValue,
            lowStock: lowStock.length,
            outOfStock: outOfStock.length,
            lowStockProducts: lowStock,
            outOfStockProducts: outOfStock,
            valueByCategory
        };
    },
    
    // ==================== DADOS COMPLETOS ====================
    
    /**
     * Exporta todos os dados do sistema.
     * 
     * @returns {Object} Todos os dados.
     */
    exportAllData() {
        return {
            products: state.products,
            sales: state.sales,
            expenses: state.expenses,
            users: state.users.map(u => ({ ...u, password: '***' })), // Não exporta senhas
            logs: state.logs,
            settings: state.settings,
            exportDate: new Date().toISOString()
        };
    },
    
    /**
     * Importa dados para o sistema.
     * 
     * @param {Object} data - Dados a serem importados.
     * @param {boolean} merge - Se deve mesclar com dados existentes.
     */
    importData(data, merge = false) {
        if (data.products && (!merge || state.products.length === 0)) {
            state.products = data.products;
        }
        
        if (data.sales && (!merge || state.sales.length === 0)) {
            state.sales = data.sales;
        }
        
        if (data.expenses && (!merge || state.expenses.length === 0)) {
            state.expenses = data.expenses;
        }
        
        if (data.users && merge) {
            // Mantém usuários existentes e adiciona novos
            const existingIds = new Set(state.users.map(u => u.id));
            data.users.forEach(u => {
                if (!existingIds.has(u.id)) {
                    state.users.push(u);
                }
            });
        }
        
        if (data.settings) {
            state.settings = { ...state.settings, ...data.settings };
        }
        
        this.saveToStorage();
        this.addLog('system', 'sistema', 'Dados importados com sucesso');
    },
    
    /**
     * Limpa todos os dados do sistema.
     */
    clearAllData() {
        state.products = [];
        state.sales = [];
        state.expenses = [];
        state.logs = [];
        
        this.saveToStorage();
        this.addLog('system', 'sistema', 'Todos os dados foram limpos');
    },
    
    /**
     * Limpa cache e dados temporários.
     */
    clearCache() {
        // Limpa dados que podem ser regenerados
        this.addLog('system', 'sistema', 'Cache limpo');
    }
};

/**
 * Exporta o store e o estado para uso global.
 */
window.Store = Store;
window.state = state;
