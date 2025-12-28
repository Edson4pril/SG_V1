/**
 * ========================================
 * Sistema de Gestão Professional
 * Aplicação Principal - app.js
 * ========================================
 * 
 * Este é o módulo principal da aplicação que integra
 * todos os componentes e gerencia a interface do usuário.
 */

// Importa módulos (funcionará em ambiente de servidor)
// Para uso local sem servidor, os módulos serão carregados via script tags

/**
 * Objeto principal da aplicação.
 */
const App = {
    charts: {},
    currentPage: 'dashboard',
    saleItems: [],
    
    /**
     * Inicializa a aplicação.
     */
    init() {
        // Inicializa o store
        Store.init();
        
        // Configura event listeners
        this.setupEventListeners();
        
        // Verifica autenticação
        this.checkAuth();
        
        // Configura datas padrão
        this.setupDefaultDates();
        
        console.log('Sistema de Gestão inicializado com sucesso.');
    },
    
    /**
     * Configura todos os event listeners da aplicação.
     */
    setupEventListeners() {
        // Formulário de login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Navegação do menu
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                if (page) this.showPage(page);
            });
        });
        
        // Fechar modais ao clicar no overlay
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAllModals();
                }
            });
        });
        
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    },
    
    /**
     * Configura datas padrão para filtros e relatórios.
     */
    setupDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Filtros de relatório
        const reportDateStart = document.getElementById('reportDateStart');
        const reportDateEnd = document.getElementById('reportDateEnd');
        
        if (reportDateStart) reportDateStart.value = thirtyDaysAgo;
        if (reportDateEnd) reportDateEnd.value = today;
        
        // Campo de data da despesa
        const expenseDate = document.getElementById('expenseDate');
        if (expenseDate) expenseDate.value = today;
    },
    
    /**
     * Verifica se há usuário logado.
     */
    checkAuth() {
        if (Store.isLoggedIn()) {
            this.showApp();
        } else {
            this.showLoginScreen();
        }
    },
    
    /**
     * Exibe a tela de login.
     */
    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContainer').classList.remove('active');
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        
        // Remove qualquer sessão anterior
        Store.logout();
    },
    
    /**
     * Exibe a aplicação principal.
     */
    showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').classList.add('active');
        
        // Atualiza informações do usuário
        this.updateUserInfo();
        
        // Atualiza menu baseado em permissões
        this.updateMenuByPermissions();
        
        // Carrega a página atual
        this.showPage(this.currentPage);
    },
    
    /**
     * Atualiza as informações do usuário na interface.
     */
    updateUserInfo() {
        const user = state.currentUser;
        
        if (user) {
            const avatar = document.getElementById('userAvatar');
            const name = document.getElementById('userName');
            const role = document.getElementById('userRole');
            
            if (avatar) avatar.textContent = user.fullName.charAt(0).toUpperCase();
            if (name) name.textContent = user.fullName;
            
            const roleNames = {
                admin: 'Administrador',
                manager: 'Gerente',
                operator: 'Operador'
            };
            
            if (role) role.textContent = roleNames[user.profile] || user.profile;
        }
    },
    
    /**
     * Atualiza o menu baseado nas permissões do usuário.
     */
    updateMenuByPermissions() {
        const user = state.currentUser;
        
        if (!user) return;
        
        const permissions = Store.getUserPermissions(user.profile);
        
        // Elementos do menu
        const navUsuarios = document.getElementById('navUsuarios');
        const navLogs = document.getElementById('navLogs');
        
        // Mostra/oculta itens baseado nas permissões
        if (navUsuarios) {
            navUsuarios.style.display = permissions.users.view ? 'flex' : 'none';
        }
        
        if (navLogs) {
            navLogs.style.display = permissions.logs.view ? 'flex' : 'none';
        }
    },
    
    /**
     * Processa o login do usuário.
     */
    handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            Toast.show('Por favor, preencha usuário e senha.', 'warning');
            return;
        }
        
        const result = Store.login(username, password);
        
        if (result.success) {
            Toast.show('Login realizado com sucesso!', 'success');
            this.showApp();
        } else {
            Toast.show(result.message, 'error');
        }
    },
    
    /**
     * Efetua logout do usuário.
     */
    logout() {
        Store.logout();
        this.showLoginScreen();
        Toast.show('Logout realizado com sucesso.', 'info');
    },
    
    /**
     * Exibe uma página específica.
     * 
     * @param {string} pageName - Nome da página a ser exibida.
     */
    showPage(pageName) {
        // Verifica permissão
        if (!this.canAccessPage(pageName)) {
            Toast.show('Você não tem permissão para acessar esta página.', 'warning');
            return;
        }
        
        this.currentPage = pageName;
        
        // Atualiza navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
        
        // Atualiza páginas
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
        });
        
        const pageElement = document.getElementById('page-' + pageName);
        if (pageElement) {
            pageElement.classList.remove('hidden');
        }
        
        // Carrega dados da página
        this.loadPageData(pageName);
    },
    
    /**
     * Verifica se o usuário pode acessar uma página.
     * 
     * @param {string} pageName - Nome da página.
     * @returns {boolean} True se pode acessar.
     */
    canAccessPage(pageName) {
        const permissions = Store.getUserPermissions(state.currentUser?.profile);
        
        switch (pageName) {
            case 'dashboard':
                return permissions.dashboard;
            case 'produtos':
                return permissions.products.view;
            case 'vendas':
                return permissions.sales.view;
            case 'despesas':
                return permissions.expenses.view;
            case 'relatorios':
                return permissions.reports.view;
            case 'usuarios':
                return permissions.users.view;
            case 'logs':
                return permissions.logs.view;
            default:
                return true;
        }
    },
    
    /**
     * Carrega os dados de uma página específica.
     * 
     * @param {string} pageName - Nome da página.
     */
    loadPageData(pageName) {
        switch (pageName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'produtos':
                this.loadProducts();
                break;
            case 'vendas':
                this.loadSales();
                break;
            case 'despesas':
                this.loadExpenses();
                break;
            case 'relatorios':
                this.loadReports();
                break;
            case 'usuarios':
                this.loadUsers();
                break;
            case 'logs':
                this.loadLogs();
                break;
        }
    },
    
    // ==================== DASHBOARD ====================
    
    /**
     * Carrega os dados do dashboard.
     */
    loadDashboard() {
        this.updateDashboardStats();
        this.renderRecentSales();
        this.initCharts();
    },
    
    /**
     * Atualiza as estatísticas do dashboard.
     */
    updateDashboardStats() {
        const totalSales = Store.getTotalSales();
        const totalCost = Store.getTotalCost();
        const profit = totalSales - totalCost;
        const totalExpenses = Store.getTotalExpenses();
        const netProfit = profit - totalExpenses;
        const lowStock = Store.getLowStockProducts().length;
        
        const container = document.getElementById('dashboardStats');
        
        if (!container) return;
        
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon blue">💰</div>
                <div class="stat-content">
                    <h3>${formatCurrency(totalSales)}</h3>
                    <p>Receita Total</p>
                    <div class="stat-trend positive">${state.sales.length} vendas realizadas</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">📈</div>
                <div class="stat-content">
                    <h3>${formatCurrency(profit)}</h3>
                    <p>Lucro Bruto</p>
                    <div class="stat-trend">Margem: ${totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0}%</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">📋</div>
                <div class="stat-content">
                    <h3>${formatCurrency(totalExpenses)}</h3>
                    <p>Despesas Totais</p>
                    <div class="stat-trend">${state.expenses.length} registros</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon ${lowStock > 0 ? 'red' : 'green'}">📦</div>
                <div class="stat-content">
                    <h3>${state.products.length}</h3>
                    <p>Produtos em Estoque</p>
                    <div class="stat-trend ${lowStock > 0 ? 'negative' : 'positive'}">${lowStock} abaixo do mínimo</div>
                </div>
            </div>
        `;
    },
    
    /**
     * Renderiza as vendas recentes no dashboard.
     */
    renderRecentSales() {
        const tbody = document.getElementById('recentSalesTable');
        
        if (!tbody) return;
        
        const recent = state.sales.slice(0, 5);
        
        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-light);">Nenhuma venda realizada</td></tr>';
            return;
        }
        
        tbody.innerHTML = recent.map(sale => `
            <tr>
                <td>#${sale.id.substring(0, 8)}</td>
                <td>${sale.client}</td>
                <td>${sale.items.length} itens</td>
                <td>${formatCurrency(sale.total)}</td>
                <td>${formatDate(sale.date)}</td>
                <td><span class="badge badge-success">Concluída</span></td>
            </tr>
        `).join('');
    },
    
    /**
     * Inicializa os gráficos do dashboard.
     */
    initCharts() {
        this.initFinancialChart();
        this.initProductsChart();
    },
    
    /**
     * Inicializa o gráfico financeiro.
     */
    initFinancialChart() {
        const ctx = document.getElementById('chartFinanceiro');
        
        if (!ctx) return;
        
        // Destrói gráfico anterior se existir
        if (this.charts.financeiro) {
            this.charts.financeiro.destroy();
        }
        
        const months = getLastMonths(6);
        
        const salesByMonth = months.map(m => {
            return state.sales.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate.getMonth() === m.month && saleDate.getFullYear() === m.year;
            }).reduce((sum, s) => sum + s.total, 0);
        });
        
        const expensesByMonth = months.map(m => {
            return state.expenses.filter(e => {
                const expDate = new Date(e.date);
                return expDate.getMonth() === m.month && expDate.getFullYear() === m.year;
            }).reduce((sum, e) => sum + e.value, 0);
        });
        
        this.charts.financeiro = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months.map(m => m.label),
                datasets: [{
                    label: 'Receitas',
                    data: salesByMonth,
                    borderColor: '#27AE60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: 'Despesas',
                    data: expensesByMonth,
                    borderColor: '#E74C3C',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => 'KZ ' + value.toLocaleString('pt-AO')
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    },
    
    /**
     * Inicializa o gráfico de produtos.
     */
    initProductsChart() {
        const ctx = document.getElementById('chartProdutos');
        
        if (!ctx) return;
        
        // Destrói gráfico anterior se existir
        if (this.charts.produtos) {
            this.charts.produtos.destroy();
        }
        
        const productSales = {};
        
        state.sales.forEach(sale => {
            sale.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        });
        
        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (topProducts.length === 0) {
            // Se não houver vendas, mostra produtos por estoque
            const products = state.products.slice(0, 5);
            topProducts.push(...products.map(p => [p.name, p.stock]));
        }
        
        this.charts.produtos = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: topProducts.map(p => p[0]),
                datasets: [{
                    data: topProducts.map(p => p[1]),
                    backgroundColor: generateChartColors(topProducts.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    },
    
    // ==================== PRODUTOS ====================
    
    /**
     * Carrega a página de produtos.
     */
    loadProducts() {
        // Oculta/mostra botão de novo produto baseado nas permissões
        const userPermissions = state.currentUser ? Store.getUserPermissions(state.currentUser.profile) : null;
        const addProductBtn = document.querySelector('#page-produtos .btn-primary');
        
        if (addProductBtn) {
            addProductBtn.style.display = userPermissions?.products?.create ? 'inline-flex' : 'none';
        }
        
        this.renderProducts(state.products);
    },
    
    /**
     * Renderiza a tabela de produtos.
     * 
     * @param {Array} products - Lista de produtos.
     */
    renderProducts(products) {
        const tbody = document.getElementById('productsTable');
        
        if (!tbody) return;
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--color-text-light);">Nenhum produto cadastrado</td></tr>';
            return;
        }
        
        // Verifica permissões do usuário atual
        const userPermissions = state.currentUser ? Store.getUserPermissions(state.currentUser.profile) : null;
        const canEdit = userPermissions?.products?.edit;
        const canDelete = userPermissions?.products?.delete;
        
        tbody.innerHTML = products.map(p => {
            const margin = calculateMargin(p.cost, p.price);
            
            let stockClass = 'badge-success';
            if (p.stock === 0) {
                stockClass = 'badge-danger';
            } else if (p.stock < 10) {
                stockClass = 'badge-warning';
            }
            
            // Monta os botões de ação baseado nas permissões
            let actionButtons = '';
            if (canEdit) {
                actionButtons += `<button class="btn btn-sm btn-outline btn-icon" onclick="App.editProduct('${p.id}')" title="Editar">✏️</button>`;
            }
            if (canDelete) {
                actionButtons += `<button class="btn btn-sm btn-danger btn-icon" onclick="App.deleteProduct('${p.id}')" title="Excluir">🗑️</button>`;
            }
            if (!canEdit && !canDelete) {
                actionButtons = '<span style="color:var(--color-text-light);font-size:12px;">Apenas visualização</span>';
            }
            
            return `
                <tr>
                    <td>${p.code}</td>
                    <td>${p.name}</td>
                    <td>${p.category}</td>
                    <td>${formatCurrency(p.cost)}</td>
                    <td>${formatCurrency(p.price)}</td>
                    <td><span class="badge ${stockClass}">${p.stock}</span></td>
                    <td>${margin}%</td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        }).join('');
    },
    
    /**
     * Busca produtos.
     * 
     * @param {string} query - Termo de busca.
     */
    searchProducts(query) {
        const results = Store.searchProducts(query);
        this.renderProducts(results);
    },
    
    /**
     * Abre o modal de produto.
     * 
     * @param {Object} product - Produto para edição (opcional).
     */
    openProductModal(product = null) {
        // Verifica permissões
        const userPermissions = state.currentUser ? Store.getUserPermissions(state.currentUser.profile) : null;
        const canCreate = userPermissions?.products?.create;
        const canEdit = userPermissions?.products?.edit;
        
        // Se for edição, precisa de permissão de edição
        // Se for criação, precisa de permissão de criação
        if (product && !canEdit) {
            Toast.show('Você não tem permissão para editar produtos.', 'warning');
            return;
        }
        
        if (!product && !canCreate) {
            Toast.show('Você não tem permissão para criar produtos.', 'warning');
            return;
        }
        
        document.getElementById('productModalTitle').textContent = product ? 'Editar Produto' : 'Novo Produto';
        document.getElementById('productForm').reset();
        
        const idInput = document.getElementById('productId');
        
        if (product) {
            idInput.value = product.id;
            document.getElementById('productCode').value = product.code;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productCost').value = product.cost;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDescription').value = product.description || '';
        } else {
            idInput.value = '';
        }
        
        Modal.open('productModal');
    },
    
    /**
     * Edita um produto.
     * 
     * @param {string} id - ID do produto.
     */
    editProduct(id) {
        const product = Store.getProduct(id);
        
        if (product) {
            this.openProductModal(product);
        }
    },
    
    /**
     * Salva um produto (cria ou atualiza).
     * 
     * @param {Event} e - Evento do formulário.
     */
    saveProduct(e) {
        e.preventDefault();
        
        // Verifica permissões
        const userPermissions = state.currentUser ? Store.getUserPermissions(state.currentUser.profile) : null;
        const id = document.getElementById('productId').value;
        const isEditing = !!id;
        
        if (isEditing && !userPermissions?.products?.edit) {
            Toast.show('Você não tem permissão para editar produtos.', 'warning');
            return;
        }
        
        if (!isEditing && !userPermissions?.products?.create) {
            Toast.show('Você não tem permissão para criar produtos.', 'warning');
            return;
        }
        
        const productData = {
            code: document.getElementById('productCode').value.trim(),
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            cost: parseFloat(document.getElementById('productCost').value),
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value.trim()
        };
        
        // Validações
        if (productData.cost >= productData.price) {
            Toast.show('O preço de venda deve ser maior que o custo.', 'warning');
            return;
        }
        
        if (productData.stock < 0) {
            Toast.show('A quantidade em estoque não pode ser negativa.', 'warning');
            return;
        }
        
        if (id) {
            // Atualiza produto existente
            Store.updateProduct(id, productData);
            Toast.show('Produto atualizado com sucesso!', 'success');
        } else {
            // Cria novo produto
            Store.addProduct(productData);
            Toast.show('Produto criado com sucesso!', 'success');
        }
        
        this.closeModal('productModal');
        this.loadProducts();
        this.updateDashboardStats();
    },
    
    /**
     * Exclui um produto.
     * 
     * @param {string} id - ID do produto.
     */
    deleteProduct(id) {
        // Verifica permissão
        const userPermissions = state.currentUser ? Store.getUserPermissions(state.currentUser.profile) : null;
        
        if (!userPermissions?.products?.delete) {
            Toast.show('Você não tem permissão para excluir produtos.', 'warning');
            return;
        }
        
        const product = Store.getProduct(id);
        
        if (!product) return;
        
        if (confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
            Store.deleteProduct(id);
            Toast.show('Produto excluído com sucesso!', 'success');
            this.loadProducts();
            this.updateDashboardStats();
        }
    },
    
    // ==================== VENDAS ====================
    
    /**
     * Carrega a página de vendas.
     */
    loadSales() {
        this.renderSales(state.sales);
    },
    
    /**
     * Renderiza a tabela de vendas.
     * 
     * @param {Array} sales - Lista de vendas.
     */
    renderSales(sales) {
        const tbody = document.getElementById('salesTable');
        
        if (!tbody) return;
        
        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--color-text-light);">Nenhuma venda realizada</td></tr>';
            return;
        }
        
        tbody.innerHTML = sales.map(sale => {
            const profit = sale.total - sale.cost;
            const profitClass = profit >= 0 ? 'var(--color-secondary)' : 'var(--color-danger)';
            
            return `
                <tr>
                    <td>#${sale.id.substring(0, 8)}</td>
                    <td>${sale.client}</td>
                    <td>${sale.items.length}</td>
                    <td>${formatCurrency(sale.total)}</td>
                    <td>${formatCurrency(sale.cost)}</td>
                    <td style="color: ${profitClass}">${formatCurrency(profit)}</td>
                    <td>${formatDate(sale.date)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline btn-icon" onclick="App.viewSale('${sale.id}')" title="Ver detalhes">👁️</button>
                        <button class="btn btn-sm btn-danger btn-icon" onclick="App.deleteSale('${sale.id}')" title="Excluir">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    /**
     * Busca vendas.
     * 
     * @param {string} query - Termo de busca.
     */
    searchSales(query) {
        const results = Store.searchSales(query);
        this.renderSales(results);
    },
    
    /**
     * Filtra vendas por data.
     */
    filterSales() {
        const start = document.getElementById('filterDateStart').value;
        const end = document.getElementById('filterDateEnd').value;
        
        const filtered = Store.filterSalesByDate(start, end);
        this.renderSales(filtered);
    },
    
    /**
     * Abre o modal de nova venda.
     */
    openSaleModal() {
        document.getElementById('saleForm').reset();
        this.saleItems = [];
        this.renderSaleItems();
        
        // Popula select de produtos
        const select = document.getElementById('saleProduct');
        
        if (select) {
            const availableProducts = state.products.filter(p => p.stock > 0);
            
            select.innerHTML = '<option value="">Selecione um produto...</option>' +
                availableProducts.map(p => `
                    <option value="${p.id}" data-price="${p.price}" data-name="${p.name}">
                        ${p.name} - ${formatCurrency(p.price)} (Est: ${p.stock})
                    </option>
                `).join('');
        }
        
        Modal.open('saleModal');
    },
    
    /**
     * Adiciona produto à venda.
     */
    addProductToSale() {
        const select = document.getElementById('saleProduct');
        const productId = select.value;
        
        if (!productId) return;
        
        const product = Store.getProduct(productId);
        
        if (!product) return;
        
        const existingItem = this.saleItems.find(i => i.productId === productId);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
                existingItem.total = existingItem.quantity * existingItem.price;
            } else {
                Toast.show('Estoque insuficiente!', 'warning');
                return;
            }
        } else {
            this.saleItems.push({
                productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                total: product.price
            });
        }
        
        this.renderSaleItems();
        select.value = '';
    },
    
    /**
     * Renderiza os itens da venda.
     */
    renderSaleItems() {
        const tbody = document.getElementById('saleItems');
        
        if (!tbody) return;
        
        tbody.innerHTML = this.saleItems.map((item, index) => `
            <tr>
                <td>${item.name}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline btn-icon" onclick="App.updateSaleItemQuantity(${index}, -1)">-</button>
                    <span style="margin: 0 8px;">${item.quantity}</span>
                    <button type="button" class="btn btn-sm btn-outline btn-icon" onclick="App.updateSaleItemQuantity(${index}, 1)">+</button>
                </td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(item.total)}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger btn-icon" onclick="App.removeSaleItem(${index})">✕</button>
                </td>
            </tr>
        `).join('');
        
        const total = this.saleItems.reduce((sum, i) => sum + i.total, 0);
        document.getElementById('saleTotal').textContent = total.toFixed(2).replace('.', ',');
    },
    
    /**
     * Atualiza quantidade de um item na venda.
     * 
     * @param {number} index - Índice do item.
     * @param {number} delta - Variação (+1 ou -1).
     */
    updateSaleItemQuantity(index, delta) {
        const item = this.saleItems[index];
        const product = Store.getProduct(item.productId);
        
        if (!product) return;
        
        const newQty = item.quantity + delta;
        
        if (newQty < 1 || newQty > product.stock) return;
        
        item.quantity = newQty;
        item.total = newQty * item.price;
        this.renderSaleItems();
    },
    
    /**
     * Remove um item da venda.
     * 
     * @param {number} index - Índice do item.
     */
    removeSaleItem(index) {
        this.saleItems.splice(index, 1);
        this.renderSaleItems();
    },
    
    /**
     * Salva uma venda.
     * 
     * @param {Event} e - Evento do formulário.
     */
    saveSale(e) {
        e.preventDefault();
        
        const clientInput = document.getElementById('saleClient');
        const client = clientInput.value.trim();
        
        if (!client) {
            Toast.show('Por favor, informe o nome do cliente.', 'warning');
            return;
        }
        
        if (this.saleItems.length === 0) {
            Toast.show('Adicione pelo menos um produto.', 'warning');
            return;
        }
        
        // Calcula totais
        const total = this.saleItems.reduce((sum, i) => sum + i.total, 0);
        
        const cost = this.saleItems.reduce((sum, i) => {
            const product = Store.getProduct(i.productId);
            return sum + (product.cost * i.quantity);
        }, 0);
        
        // Atualiza estoque dos produtos
        this.saleItems.forEach(item => {
            const product = Store.getProduct(item.productId);
            if (product) {
                product.stock -= item.quantity;
            }
        });
        
        // Cria a venda
        const sale = {
            client: client,
            items: this.saleItems.map(i => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                total: i.total
            })),
            total: total,
            cost: cost,
            date: new Date().toISOString().split('T')[0],
            userId: state.currentUser?.id
        };
        
        Store.addSale(sale);
        
        // Exibe o modal de sucesso com os detalhes da venda
        this.showSaleSuccessModal(sale.client, sale.total);
    },
    
    /**
     * Visualiza os detalhes de uma venda.
     * 
     * @param {string} id - ID da venda.
     */
    showSaleSuccessModal(clientName, totalValue) {
        const content = document.getElementById('saleSuccessContent');
        
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
                    <p style="font-size: 16px; color: var(--color-text-light); margin-bottom: 24px;">
                        A venda foi registrada com sucesso!
                    </p>
                    <div style="background: var(--color-background); border-radius: 8px; padding: 16px; text-align: left;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border);">
                            <span style="color: var(--color-text-light);">Cliente:</span>
                            <span style="font-weight: 600;">${clientName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--color-text-light);">Valor Total:</span>
                            <span style="font-weight: 600; font-size: 18px; color: var(--color-secondary);">${formatCurrency(totalValue)}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        const modal = document.getElementById('saleSuccessModal');
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    /**
     * Fecha o modal de sucesso e limpa o formulário de venda.
     */
    closeSaleSuccessModal() {
        this.closeModal('saleSuccessModal');
        this.closeModal('saleModal');
        this.saleItems = [];
        this.renderSaleItems();
        this.loadSales();
        this.updateDashboardStats();
        
        // Se estiver na página de vendas, atualiza também
        if (this.currentPage === 'vendas') {
            this.loadSales();
        }
    },
    
    /**
     * Visualiza os detalhes de uma venda.
     * 
     * @param {string} id - ID da venda.
     */
    viewSale(id) {
        const sale = state.sales.find(s => s.id === id);
        
        if (!sale) return;
        
        const profit = sale.total - sale.cost;
        
        const content = document.getElementById('viewSaleContent');
        
        if (!content) return;
        
        content.innerHTML = `
            <div style="margin-bottom: 16px;">
                <strong>ID:</strong> #${sale.id}<br>
                <strong>Cliente:</strong> ${sale.client}<br>
                <strong>Data:</strong> ${formatDate(sale.date)}
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Qty</th>
                            <th>Unitário</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-border);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Custo Total:</span>
                    <span>${formatCurrency(sale.cost)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Total da Venda:</span>
                    <span style="font-weight: 600; font-size: 18px;">${formatCurrency(sale.total)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: ${profit >= 0 ? 'var(--color-secondary)' : 'var(--color-danger)'};">
                    <span>Lucro:</span>
                    <span style="font-weight: 600;">${formatCurrency(profit)}</span>
                </div>
            </div>
        `;
        
        Modal.open('viewSaleModal');
    },
    
    /**
     * Exclui uma venda.
     * 
     * @param {string} id - ID da venda.
     */
    deleteSale(id) {
        if (confirm('Tem certeza que deseja excluir esta venda?')) {
            const sale = state.sales.find(s => s.id === id);
            
            if (sale) {
                // Restaura estoque
                sale.items.forEach(item => {
                    const product = Store.getProduct(item.productId);
                    if (product) {
                        product.stock += item.quantity;
                    }
                });
            }
            
            Store.deleteSale(id);
            Toast.show('Venda excluída com sucesso!', 'success');
            this.loadSales();
            this.updateDashboardStats();
        }
    },
    
    // ==================== DESPESAS ====================
    
    /**
     * Carrega a página de despesas.
     */
    loadExpenses() {
        this.renderExpenses(state.expenses);
    },
    
    /**
     * Renderiza a tabela de despesas.
     * 
     * @param {Array} expenses - Lista de despesas.
     */
    renderExpenses(expenses) {
        const tbody = document.getElementById('expensesTable');
        
        if (!tbody) return;
        
        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-light);">Nenhuma despesa registrada</td></tr>';
            return;
        }
        
        tbody.innerHTML = expenses.map(exp => `
            <tr>
                <td>#${exp.id.substring(0, 8)}</td>
                <td>${exp.description}</td>
                <td>${exp.category}</td>
                <td>${formatCurrency(exp.value)}</td>
                <td>${formatDate(exp.date)}</td>
                <td>
                    <button class="btn btn-sm btn-danger btn-icon" onclick="App.deleteExpense('${exp.id}')" title="Excluir">🗑️</button>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * Busca despesas.
     * 
     * @param {string} query - Termo de busca.
     */
    searchExpenses(query) {
        const results = Store.searchExpenses(query);
        this.renderExpenses(results);
    },
    
    /**
     * Abre o modal de nova despesa.
     */
    openExpenseModal() {
        document.getElementById('expenseForm').reset();
        
        const dateInput = document.getElementById('expenseDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        Modal.open('expenseModal');
    },
    
    /**
     * Salva uma despesa.
     * 
     * @param {Event} e - Evento do formulário.
     */
    saveExpense(e) {
        e.preventDefault();
        
        const expense = {
            description: document.getElementById('expenseDescription').value.trim(),
            category: document.getElementById('expenseCategory').value,
            value: parseFloat(document.getElementById('expenseValue').value),
            date: document.getElementById('expenseDate').value,
            notes: document.getElementById('expenseNotes').value.trim()
        };
        
        Store.addExpense(expense);
        
        Toast.show('Despesa registrada com sucesso!', 'success');
        this.closeModal('expenseModal');
        this.loadExpenses();
        this.updateDashboardStats();
    },
    
    /**
     * Exclui uma despesa.
     * 
     * @param {string} id - ID da despesa.
     */
    deleteExpense(id) {
        const expense = state.expenses.find(e => e.id === id);
        
        if (!expense) return;
        
        if (confirm(`Tem certeza que deseja excluir "${expense.description}"?`)) {
            Store.deleteExpense(id);
            Toast.show('Despesa excluída com sucesso!', 'success');
            this.loadExpenses();
            this.updateDashboardStats();
        }
    },
    
    // ==================== USUÁRIOS ====================
    
    /**
     * Carrega a página de usuários.
     */
    loadUsers() {
        this.renderUsers(state.users);
    },
    
    /**
     * Renderiza a tabela de usuários.
     * 
     * @param {Array} users - Lista de usuários.
     */
    renderUsers(users) {
        const tbody = document.getElementById('usersTable');
        
        if (!tbody) return;
        
        tbody.innerHTML = users.map(u => {
            const profileNames = {
                admin: 'Administrador',
                manager: 'Gerente',
                operator: 'Operador'
            };
            
            const statusBadge = u.active ?
                '<span class="badge badge-success">Ativo</span>' :
                '<span class="badge badge-danger">Inativo</span>';
            
            return `
                <tr>
                    <td>@${u.username}</td>
                    <td>${u.fullName}</td>
                    <td>${u.email}</td>
                    <td>${profileNames[u.profile] || u.profile}</td>
                    <td>${u.lastLogin ? formatDateTime(u.lastLogin) : 'Nunca'}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline btn-icon" onclick="App.editUser('${u.id}')" title="Editar">✏️</button>
                        ${u.id !== state.currentUser?.id ? `
                            <button class="btn btn-sm btn-danger btn-icon" onclick="App.deleteUser('${u.id}')" title="Excluir">🗑️</button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    /**
     * Abre o modal de usuário.
     * 
     * @param {Object} user - Usuário para edição (opcional).
     */
    openUserModal(user = null) {
        document.getElementById('userModalTitle').textContent = user ? 'Editar Usuário' : 'Novo Usuário';
        document.getElementById('userForm').reset();
        
        const passwordInput = document.getElementById('userPassword');
        const passwordGroup = document.getElementById('passwordGroup');
        
        if (user) {
            document.getElementById('userId').value = user.id;
            document.getElementById('userUsername').value = user.username;
            document.getElementById('userFullName').value = user.fullName;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userProfile').value = user.profile;
            passwordInput.value = '';
            
            if (passwordGroup) {
                passwordGroup.querySelector('small').textContent = 'Deixe em branco para manter a senha atual';
            }
        } else {
            document.getElementById('userId').value = '';
            passwordInput.required = true;
            
            if (passwordGroup) {
                passwordGroup.querySelector('small').textContent = 'Obrigatório para novos usuários';
            }
        }
        
        this.updatePermissionsDisplay();
        Modal.open('userModal');
    },
    
    /**
     * Atualiza a visualização de permissões baseado no perfil.
     */
    updatePermissionsDisplay() {
        const profile = document.getElementById('userProfile').value;
        
        const permUsers = document.getElementById('permUsers');
        const permLogs = document.getElementById('permLogs');
        
        if (permUsers) {
            permUsers.style.display = profile === 'admin' ? 'inline-block' : 'none';
        }
        
        if (permLogs) {
            permLogs.style.display = profile !== 'operator' ? 'inline-block' : 'none';
        }
    },
    
    /**
     * Edita um usuário.
     * 
     * @param {string} id - ID do usuário.
     */
    editUser(id) {
        const user = state.users.find(u => u.id === id);
        
        if (user) {
            this.openUserModal(user);
        }
    },
    
    /**
     * Salva um usuário.
     * 
     * @param {Event} e - Evento do formulário.
     */
    saveUser(e) {
        e.preventDefault();
        
        const id = document.getElementById('userId').value;
        
        const userData = {
            username: document.getElementById('userUsername').value.trim(),
            fullName: document.getElementById('userFullName').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            profile: document.getElementById('userProfile').value
        };
        
        const password = document.getElementById('userPassword').value;
        if (password) {
            userData.password = password;
        }
        
        // Validações
        if (!validateEmail(userData.email)) {
            Toast.show('Por favor, informe um e-mail válido.', 'warning');
            return;
        }
        
        if (id) {
            // Atualiza usuário existente
            Store.updateUser(id, userData);
            Toast.show('Usuário atualizado com sucesso!', 'success');
        } else {
            // Cria novo usuário
            if (!password) {
                Toast.show('A senha é obrigatória para novos usuários.', 'warning');
                return;
            }
            
            userData.password = password;
            Store.addUser(userData);
            Toast.show('Usuário criado com sucesso!', 'success');
        }
        
        this.closeModal('userModal');
        this.loadUsers();
    },
    
    /**
     * Exclui um usuário.
     * 
     * @param {string} id - ID do usuário.
     */
    deleteUser(id) {
        const user = state.users.find(u => u.id === id);
        
        if (!user) return;
        
        if (user.id === state.currentUser?.id) {
            Toast.show('Você não pode excluir seu próprio usuário.', 'warning');
            return;
        }
        
        if (confirm(`Tem certeza que deseja excluir o usuário "${user.username}"?`)) {
            Store.deleteUser(id);
            Toast.show('Usuário excluído com sucesso!', 'success');
            this.loadUsers();
        }
    },
    
    // ==================== LOGS ====================
    
    /**
     * Carrega a página de logs.
     */
    loadLogs() {
        this.renderLogs(state.logs);
    },
    
    /**
     * Renderiza os logs.
     * 
     * @param {Array} logs - Lista de logs.
     */
    renderLogs(logs) {
        const container = document.getElementById('logsContainer');
        
        if (!container) return;
        
        if (logs.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--color-text-light);padding:40px;">Nenhum registro encontrado</p>';
            return;
        }
        
        const actionNames = {
            create: 'Criação',
            update: 'Edição',
            delete: 'Exclusão',
            login: 'Login',
            logout: 'Logout',
            system: 'Sistema'
        };
        
        container.innerHTML = logs.map(log => {
            const iconClass = log.action;
            
            const icons = {
                create: '+',
                update: '✏',
                delete: '✕',
                login: '🔑',
                logout: '🚪',
                system: '⚙'
            };
            
            return `
                <div class="log-entry">
                    <div class="log-icon ${iconClass}">
                        ${icons[log.action] || '📝'}
                    </div>
                    <div class="log-content">
                        <h4>${actionNames[log.action] || log.action} - ${log.module.charAt(0).toUpperCase() + log.module.slice(1)}</h4>
                        <p>${log.details}</p>
                    </div>
                    <div class="log-time">
                        ${formatDateTime(log.timestamp)}
                        <span class="log-user">por ${log.userName}</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Filtra os logs.
     */
    filterLogs() {
        const type = document.getElementById('filterLogType').value;
        const module = document.getElementById('filterLogModule').value;
        const date = document.getElementById('filterLogDate').value;
        
        const filters = {};
        
        if (type !== 'all') filters.action = type;
        if (module !== 'all') filters.module = module;
        if (date) filters.date = date;
        
        const filtered = Store.filterLogs(filters);
        this.renderLogs(filtered);
    },
    
    /**
     * Limpa todos os logs.
     */
    clearLogs() {
        if (confirm('Tem certeza que deseja limpar todos os registros?')) {
            Store.clearLogs();
            Toast.show('Registros limpos com sucesso!', 'success');
            this.loadLogs();
        }
    },
    
    /**
     * Exporta os logs.
     */
    exportLogs() {
        exportToJSON(state.logs, `logs_sistema_${new Date().toISOString().split('T')[0]}.json`);
        Toast.show('Logs exportados com sucesso!', 'success');
    },
    
    // ==================== RELATÓRIOS ====================
    
    /**
     * Carrega a página de relatórios.
     */
    loadReports() {
        this.generateReport();
    },
    
    /**
     * Gera o relatório baseado nos filtros.
     */
    generateReport() {
        const startDate = document.getElementById('reportDateStart').value;
        const endDate = document.getElementById('reportDateEnd').value;
        const reportType = document.getElementById('reportType').value;
        
        let content = '';
        
        switch (reportType) {
            case 'financeiro':
                content = this.generateFinancialReport(startDate, endDate);
                break;
            case 'vendas':
                content = this.generateSalesReport(startDate, endDate);
                break;
            case 'estoque':
                content = this.generateStockReport();
                break;
            case 'lucro':
                content = this.generateProfitReport(startDate, endDate);
                break;
        }
        
        const container = document.getElementById('reportContent');
        
        if (container) {
            container.innerHTML = content;
        }
    },
    
    /**
     * Gera relatório financeiro.
     */
    generateFinancialReport(startDate, endDate) {
        const report = Store.getFinancialReport(startDate, endDate);
        const grossProfit = report.totalSales - report.totalCost;
        const netProfit = grossProfit - report.totalExpenses;
        
        const expensesByCategory = Object.entries(report.expensesByCategory)
            .map(([cat, val]) => `
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--color-border-light);">
                    <span>${cat}</span>
                    <span style="font-weight:500;">${formatCurrency(val)}</span>
                </div>
            `).join('');
        
        return `
            <div class="report-summary">
                <div class="summary-item">
                    <h4>${formatCurrency(report.totalSales)}</h4>
                    <p>Receita Bruta</p>
                </div>
                <div class="summary-item">
                    <h4>${formatCurrency(report.totalExpenses)}</h4>
                    <p>Total de Despesas</p>
                </div>
                <div class="summary-item">
                    <h4 style="color: ${grossProfit >= 0 ? 'var(--color-secondary)' : 'var(--color-danger)'}">${formatCurrency(grossProfit)}</h4>
                    <p>Lucro Bruto</p>
                </div>
                <div class="summary-item">
                    <h4 style="color: ${netProfit >= 0 ? 'var(--color-secondary)' : 'var(--color-danger)'}">${formatCurrency(netProfit)}</h4>
                    <p>Lucro Líquido</p>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Despesas por Categoria</h3>
                </div>
                <div class="card-body">
                    ${expensesByCategory || '<p style="color:var(--color-text-light);">Nenhuma despesa registrada</p>'}
                </div>
            </div>
        `;
    },
    
    /**
     * Gera relatório de vendas.
     */
    generateSalesReport(startDate, endDate) {
        const sales = Store.filterSalesByDate(startDate, endDate);
        const totalSales = Store.getTotalSales(sales);
        const totalCost = Store.getTotalCost(sales);
        const ticketMedium = sales.length > 0 ? totalSales / sales.length : 0;
        
        // Produtos mais vendidos
        const topProducts = Store.getTopSellingProducts(10);
        
        return `
            <div class="report-summary">
                <div class="summary-item">
                    <h4>${sales.length}</h4>
                    <p>Total de Vendas</p>
                </div>
                <div class="summary-item">
                    <h4>${formatCurrency(totalSales)}</h4>
                    <p>Faturamento Total</p>
                </div>
                <div class="summary-item">
                    <h4>${formatCurrency(ticketMedium)}</h4>
                    <p>Ticket Médio</p>
                </div>
                <div class="summary-item">
                    <h4 style="color: var(--color-secondary)">${formatCurrency(totalSales - totalCost)}</h4>
                    <p>Lucro Total</p>
                </div>
            </div>
            ${topProducts.length > 0 ? `
                <div class="card" style="margin-bottom: 20px;">
                    <div class="card-header">
                        <h3>Top 10 Produtos Mais Vendidos</h3>
                    </div>
                    <div class="card-body no-padding">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Quantidade</th>
                                        <th>Faturamento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${topProducts.map(p => `
                                        <tr>
                                            <td>${p.name}</td>
                                            <td>${p.quantity}</td>
                                            <td>${formatCurrency(p.revenue)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    },
    
    /**
     * Gera relatório de estoque.
     */
    generateStockReport() {
        const report = Store.getStockReport();
        
        return `
            <div class="report-summary">
                <div class="summary-item">
                    <h4>${report.totalProducts}</h4>
                    <p>Total de Produtos</p>
                </div>
                <div class="summary-item">
                    <h4>${formatCurrency(report.totalValue)}</h4>
                    <p>Valor do Estoque (Custo)</p>
                </div>
                <div class="summary-item">
                    <h4 style="color: ${report.outOfStock > 0 ? 'var(--color-danger)' : 'var(--color-secondary)'}">${report.outOfStock}</h4>
                    <p>Sem Estoque</p>
                </div>
                <div class="summary-item">
                    <h4 style="color: ${report.lowStock > 0 ? 'var(--color-warning)' : 'var(--color-secondary)'}">${report.lowStock}</h4>
                    <p>Estoque Baixo</p>
                </div>
            </div>
            ${report.outOfStockProducts.length > 0 ? `
                <div class="card" style="margin-bottom: 20px; border-color: var(--color-danger);">
                    <div class="card-header" style="background: rgba(231,76,60,0.1);">
                        <h3 style="color: var(--color-danger);">⚠️ Produtos Sem Estoque</h3>
                    </div>
                    <div class="card-body">
                        ${report.outOfStockProducts.map(p => `<span class="badge badge-danger" style="margin:4px;">${p.name}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${report.lowStockProducts.length > 0 ? `
                <div class="card" style="margin-bottom: 20px; border-color: var(--color-warning);">
                    <div class="card-header" style="background: rgba(243,156,18,0.1);">
                        <h3 style="color: var(--color-warning);">⚠️ Estoque Baixo</h3>
                    </div>
                    <div class="card-body no-padding">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Estoque Atual</th>
                                        <th>Mínimo Sugerido</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${report.lowStockProducts.map(p => `
                                        <tr>
                                            <td>${p.name}</td>
                                            <td><span class="badge badge-warning">${p.stock}</span></td>
                                            <td>10</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    },
    
    /**
     * Gera relatório de lucro.
     */
    generateProfitReport(startDate, endDate) {
        const sales = Store.filterSalesByDate(startDate, endDate);
        const totalSales = Store.getTotalSales(sales);
        const totalCost = Store.getTotalCost(sales);
        const totalProfit = totalSales - totalCost;
        const margin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
        
        // Lucro por mês
        const months = getLastMonths(6);
        const profitByMonth = months.map(m => {
            const monthSales = sales.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate.getMonth() === m.month && saleDate.getFullYear() === m.year;
            });
            
            const revenue = Store.getTotalSales(monthSales);
            const cost = Store.getTotalCost(monthSales);
            
            return {
                label: m.label,
                revenue,
                cost,
                profit: revenue - cost,
                margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0
            };
        });
        
        return `
            <div class="report-summary">
                <div class="summary-item">
                    <h4>${formatCurrency(totalSales)}</h4>
                    <p>Receita Total</p>
                </div>
                <div class="summary-item">
                    <h4>${formatCurrency(totalCost)}</h4>
                    <p>Custo Total</p>
                </div>
                <div class="summary-item">
                    <h4 style="color: var(--color-secondary)">${formatCurrency(totalProfit)}</h4>
                    <p>Lucro Total</p>
                </div>
                <div class="summary-item">
                    <h4>${margin.toFixed(1)}%</h4>
                    <p>Margem Média</p>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Lucro por Mês</h3>
                </div>
                <div class="card-body no-padding">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mês</th>
                                    <th>Receita</th>
                                    <th>Custo</th>
                                    <th>Lucro</th>
                                    <th>Margem</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${profitByMonth.map(m => `
                                    <tr>
                                        <td>${m.label}</td>
                                        <td>${formatCurrency(m.revenue)}</td>
                                        <td>${formatCurrency(m.cost)}</td>
                                        <td style="color: ${m.profit >= 0 ? 'var(--color-secondary)' : 'var(--color-danger)'}">${formatCurrency(m.profit)}</td>
                                        <td>${m.margin.toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ==================== EXPORTAÇÃO ====================
    
    /**
     * Exporta dados para PDF.
     */
    exportPDF() {
        const { jsPDF } = window.jspdf;
        
        if (!jsPDF) {
            Toast.show('Biblioteca PDF não carregada.', 'error');
            return;
        }
        
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.setTextColor(30, 58, 95);
        doc.text('Relatório do Sistema de Gestão', 20, 20);
        
        // Data de geração
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 28);
        
        let y = 40;
        
        // Resumo
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 95);
        doc.text('Resumo Geral', 20, y);
        y += 10;
        
        const totalSales = Store.getTotalSales();
        const totalCost = Store.getTotalCost();
        const totalExpenses = Store.getTotalExpenses();
        const netProfit = totalSales - totalCost - totalExpenses;
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Total de Vendas: ${formatCurrency(totalSales)}`, 20, y);
        y += 6;
        doc.text(`Total de Despesas: ${formatCurrency(totalExpenses)}`, 20, y);
        y += 6;
        doc.text(`Lucro Líquido: ${formatCurrency(netProfit)}`, 20, y);
        y += 6;
        doc.text(`Produtos em Estoque: ${state.products.length}`, 20, y);
        y += 15;
        
        // Produtos
        if (state.products.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(30, 58, 95);
            doc.text('Produtos', 20, y);
            y += 10;
            
            const productData = state.products.slice(0, 20).map(p => [
                p.code,
                p.name.substring(0, 25),
                p.category,
                p.stock.toString(),
                formatCurrency(p.price)
            ]);
            
            doc.autoTable({
                startY: y,
                head: [['Código', 'Nome', 'Categoria', 'Estoque', 'Preço']],
                body: productData,
                theme: 'striped',
                headStyles: { fillColor: [30, 58, 95] },
                styles: { fontSize: 9 }
            });
            
            y = doc.lastAutoTable.finalY + 15;
        }
        
        // Vendas recentes
        if (state.sales.length > 0) {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(14);
            doc.setTextColor(30, 58, 95);
            doc.text('Vendas Recentes', 20, y);
            y += 10;
            
            const saleData = state.sales.slice(0, 10).map(s => [
                s.id.substring(0, 8),
                s.client,
                s.items.length.toString(),
                formatCurrency(s.total),
                formatDate(s.date)
            ]);
            
            doc.autoTable({
                startY: y,
                head: [['ID', 'Cliente', 'Itens', 'Total', 'Data']],
                body: saleData,
                theme: 'striped',
                headStyles: { fillColor: [30, 58, 95] },
                styles: { fontSize: 9 }
            });
        }
        
        doc.save(`relatorio_sistema_${new Date().toISOString().split('T')[0]}.pdf`);
        Toast.show('Relatório PDF exportado com sucesso!', 'success');
    },
    
    /**
     * Exporta dados para CSV.
     */
    exportCSV() {
        // Exporta produtos
        const productsData = state.products.map(p => ({
            Tipo: 'Produto',
            Codigo: p.code,
            Nome: p.name,
            Categoria: p.category,
            Custo: p.cost,
            Preco: p.price,
            Estoque: p.stock
        }));
        
        // Exporta vendas
        const salesData = state.sales.map(s => ({
            Tipo: 'Venda',
            ID: s.id,
            Cliente: s.client,
            Items: s.items.length,
            Total: s.total,
            Custo: s.cost,
            Lucro: s.total - s.cost,
            Data: s.date
        }));
        
        // Exporta despesas
        const expensesData = state.expenses.map(e => ({
            Tipo: 'Despesa',
            ID: e.id,
            Descricao: e.description,
            Categoria: e.category,
            Valor: e.value,
            Data: e.date
        }));
        
        // Combina todos os dados
        const allData = [...productsData, ...salesData, ...expensesData];
        
        exportToCSV(allData, `exportacao_sistema_${new Date().toISOString().split('T')[0]}.csv`);
        Toast.show('Exportação CSV realizada com sucesso!', 'success');
    },
    
    /**
     * Exporta backup completo do sistema.
     */
    exportData() {
        const data = Store.exportAllData();
        exportToJSON(data, `backup_sistema_${new Date().toISOString().split('T')[0]}.json`);
        Toast.show('Backup realizado com sucesso!', 'success');
        Store.addLog('create', 'sistema', 'Backup do sistema realizado');
    },
    
    // ==================== MODAIS ====================
    
    /**
     * Abre um modal específico.
     * 
     * @param {string} modalId - ID do modal.
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    /**
     * Fecha um modal específico.
     * 
     * @param {string} modalId - ID do modal.
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    /**
     * Fecha todos os modais.
     */
    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    }
};

// Objeto Toast para notificações
const Toast = {
    show(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// Objeto Modal para gerenciar modais
const Modal = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    close(modalId) {
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    closeAll() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    }
};

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
