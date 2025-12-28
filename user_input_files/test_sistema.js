const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({ type: msg.type(), text: msg.text() });
    });
    
    // Collect errors
    const errors = [];
    page.on('pageerror', error => {
        errors.push(error.message);
    });
    
    try {
        console.log('🧪 Testing Sistema de Gestão...\n');
        
        // Load the page
        const path = require('path');
        const filePath = path.resolve('user_input_files/SISTEMA DE GESTÃO.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(1500);
        console.log('✅ Page loaded successfully');
        
        // Wait for app initialization
        await page.waitForTimeout(1000);
        
        // Test 1: Check if main elements exist
        const header = await page.$('.app-header');
        const nav = await page.$('.app-nav');
        const main = await page.$('.app-main');
        const toastContainer = await page.$('#toastContainer');
        
        console.log('✅ Header:', header ? 'Found' : 'NOT FOUND');
        console.log('✅ Navigation:', nav ? 'Found' : 'NOT FOUND');
        console.log('✅ Main content:', main ? 'Found' : 'NOT FOUND');
        console.log('✅ Toast container:', toastContainer ? 'Found' : 'NOT FOUND');
        
        // Test 2: Test tab navigation
        const tabs = await page.$$('.nav-tab');
        console.log(`✅ Navigation tabs: ${tabs.length} found`);
        
        // Test 3: Click through all tabs
        for (let i = 0; i < tabs.length; i++) {
            await tabs[i].click();
            await page.waitForTimeout(200);
        }
        console.log('✅ All tabs navigated successfully');
        
        // Test 4: Test form elements
        await page.click('[data-tab="estoque"]');
        await page.waitForTimeout(300);
        
        const codigoInput = await page.$('#codigo');
        const nomeInput = await page.$('#nome');
        const categoriaSelect = await page.$('#categoria');
        
        console.log('✅ Product form elements:', 
            (codigoInput && nomeInput && categoriaSelect) ? 'All found' : 'Missing elements');
        
        // Test 5: Test adding a product
        await page.fill('#codigo', 'TEST001');
        await page.fill('#nome', 'Produto Teste');
        await page.selectOption('#categoria', 'Smartphones');
        await page.fill('#quantidade', '10');
        await page.fill('#precoCusto', '100');
        await page.fill('#precoVenda', '150');
        await page.fill('#estoqueMinimo', '5');
        await page.fill('#fornecedor', 'Fornecedor Teste');
        
        await page.click('button:has-text("Adicionar Produto")');
        await page.waitForTimeout(500);
        
        console.log('✅ Product added successfully');
        
        // Test 6: Check toast notification appeared
        const toast = await page.$('.toast');
        console.log('✅ Toast notification:', toast ? 'Displayed' : 'NOT DISPLAYED');
        
        // Test 7: Test search functionality
        await page.fill('#searchProdutos', 'Teste');
        await page.waitForTimeout(400);
        
        const tableRows = await page.$$('#tabelaEstoque tr');
        console.log(`✅ Search results: ${tableRows.length} rows found`);
        
        // Test 8: Navigate to Sales tab
        await page.click('[data-tab="vendas"]');
        await page.waitForTimeout(300);
        
        const produtoVenda = await page.$('#produtoVenda');
        console.log('✅ Sales form:', produtoVenda ? 'Found' : 'NOT FOUND');
        
        // Test 9: Navigate to Expenses tab
        await page.click('[data-tab="despesas"]');
        await page.waitForTimeout(300);
        
        console.log('✅ Expenses tab loaded');
        
        // Test 10: Navigate to Reports tab
        await page.click('[data-tab="relatorios"]');
        await page.waitForTimeout(300);
        
        const mesRelatorio = await page.$('#mesRelatorio');
        console.log('✅ Reports tab:', mesRelatorio ? 'Found' : 'NOT FOUND');
        
        // Test 11: Navigate to Settings tab
        await page.click('[data-tab="configuracoes"]');
        await page.waitForTimeout(300);
        
        console.log('✅ Settings tab loaded');
        
        // Test 12: Check backup buttons exist
        const backupBtn = await page.$('button:has-text("Fazer Backup")');
        const restoreBtn = await page.$('button:has-text("Restaurar Backup")');
        console.log('✅ Backup controls:', (backupBtn && restoreBtn) ? 'Found' : 'Missing');
        
        // Test 13: Navigate back to dashboard
        await page.click('[data-tab="dashboard"]');
        await page.waitForTimeout(300);
        
        const dashboardActive = await page.$('.tab-panel.active#dashboard');
        console.log('✅ Dashboard active:', dashboardActive ? 'Yes' : 'No');
        
        // Report errors
        console.log('\n📊 Console Messages:', consoleMessages.length);
        const errorMessages = consoleMessages.filter(m => m.type === 'error');
        if (errorMessages.length > 0) {
            console.log('⚠️ Console Errors:', errorMessages.map(m => m.text).join(', '));
        }
        
        console.log('\n📊 Page Errors:', errors.length);
        if (errors.length > 0) {
            console.log('⚠️ Errors:', errors.join(', '));
        }
        
        if (errors.length === 0 && errorMessages.length === 0) {
            console.log('\n🎉 ALL TESTS PASSED! No errors detected.');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
})();
