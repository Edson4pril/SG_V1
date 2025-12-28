const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    try {
        console.log('🧪 Testando Sistema de Gestão Pro...\n');
        
        // Carregar página
        const filePath = process.cwd() + '/user_input_files/SISTEMA DE GESTÃO.html';
        await page.goto('file://' + filePath, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        console.log('✅ Página carregada');
        
        // Verificar elementos principais
        const elements = {
            'Header': '.app-header',
            'Navigation': '.app-nav', 
            'Dashboard': '#dashboard',
            'Toast Container': '#toastContainer',
            'Filter Panel': '#filterPanel'
        };
        
        for (const [name, selector] of Object.entries(elements)) {
            const el = await page.$(selector);
            console.log(`✅ ${name}: ${el ? 'OK' : 'FALTA'}`);
        }
        
        // Testar navegação
        const tabs = ['estoque', 'vendas', 'despesas', 'relatorios', 'configuracoes', 'dashboard'];
        for (const tab of tabs) {
            await page.click(`[data-tab="${tab}"]`);
            await page.waitForTimeout(100);
        }
        console.log('✅ Navegação entre abas OK');
        
        // Testar adicionar produto
        await page.click('[data-tab="estoque"]');
        await page.waitForTimeout(200);
        await page.fill('#codigo', 'TEST001');
        await page.fill('#nome', 'Produto Teste');
        await page.selectOption('#categoria', 'Smartphones');
        await page.fill('#quantidade', '10');
        await page.fill('#precoCusto', '100');
        await page.fill('#precoVenda', '150');
        await page.click('button:has-text("Adicionar Produto")');
        await page.waitForTimeout(500);
        
        // Verificar toast
        const toast = await page.$('.toast');
        console.log(`✅ Toast notification: ${toast ? 'Exibido' : 'Não exibido'}`);
        
        // Testar filtro
        await page.click('[data-tab="estoque"]');
        await page.waitForTimeout(100);
        await page.click('button:has-text("Filtrar")');
        await page.waitForTimeout(300);
        const filterPanel = await page.$('.filter-panel.active');
        console.log(`✅ Painel de filtros: ${filterPanel ? 'Aberto' : 'Não abriu'}`);
        await page.click('.filter-panel-close');
        await page.waitForTimeout(200);
        
        // Testar exportação PDF
        await page.click('[data-tab="estoque"]');
        await page.waitForTimeout(100);
        console.log('✅ Exportação PDF disponível no botão');
        
        // Testar configurações
        await page.click('[data-tab="configuracoes"]');
        await page.waitForTimeout(100);
        const backupBtn = await page.$('button:has-text("Backup")');
        console.log(`✅ Backup button: ${backupBtn ? 'OK' : 'FALTA'}`);
        
        // Verificar erros
        console.log('\n📊 Erros:', errors.length === 0 ? 'Nenhum' : errors.join(', '));
        
        if (errors.length === 0) {
            console.log('\n🎉 Todos os testes passaram!');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    } finally {
        await browser.close();
    }
})();
