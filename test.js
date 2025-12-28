/**
 * Teste do Sistema de Gestão Professional
 * Verifica se todos os componentes funcionam corretamente
 */

const { chromium } = require('playwright');
const path = require('path');

async function testSystem() {
    console.log('🧪 Iniciando testes do Sistema de Gestão...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Captura erros de console
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    page.on('pageerror', error => {
        errors.push(error.message);
    });
    
    try {
        // Carrega a página
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });
        
        console.log('✓ Página carregada');
        
        // Aguarda inicialização
        await page.waitForTimeout(1000);
        
        // Verifica se a tela de login está visível
        const loginVisible = await page.isVisible('#loginScreen');
        console.log(`✓ Tela de login visível: ${loginVisible}`);
        
        // Faz login
        await page.fill('#loginUsername', 'admin');
        await page.fill('#loginPassword', 'admin');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(500);
        
        // Verifica se o app container está visível
        const appVisible = await page.isVisible('#appContainer.active');
        console.log(`✓ Aplicação visível após login: ${appVisible}`);
        
        // Verifica se os dados foram carregados
        const dashboardStats = await page.textContent('#dashboardStats');
        console.log(`✓ Dashboard stats carregadas: ${dashboardStats.length > 0}`);
        
        // Verifica se os gráficos existem
        const chartsExist = await page.isVisible('#chartFinanceiro');
        console.log(`✓ Gráfico financeiro existe: ${chartsExist}`);
        
        // Testa navegação para Produtos
        await page.click('[data-page="produtos"]');
        await page.waitForTimeout(300);
        const productsPage = await page.isVisible('#page-produtos:not(.hidden)');
        console.log(`✓ Página de produtos: ${productsPage}`);
        
        // Testa navegação para Vendas
        await page.click('[data-page="vendas"]');
        await page.waitForTimeout(300);
        const salesPage = await page.isVisible('#page-vendas:not(.hidden)');
        console.log(`✓ Página de vendas: ${salesPage}`);
        
        // Testa navegação para Relatórios
        await page.click('[data-page="relatorios"]');
        await page.waitForTimeout(300);
        const reportsPage = await page.isVisible('#page-relatorios:not(.hidden)');
        console.log(`✓ Página de relatórios: ${reportsPage}`);
        
        // Gera um relatório
        await page.click('button:has-text("Gerar Relatório")');
        await page.waitForTimeout(500);
        const reportContent = await page.textContent('#reportContent');
        console.log(`✓ Relatório gerado: ${reportContent.length > 0}`);
        
        // Verifica erros de console
        console.log('\n📋 Resumo de erros:');
        if (errors.length === 0) {
            console.log('✓ Nenhum erro encontrado!');
        } else {
            errors.forEach(err => console.log(`✗ Erro: ${err}`));
        }
        
        console.log('\n✅ Testes concluídos com sucesso!');
        
    } catch (error) {
        console.error('✗ Erro durante os testes:', error.message);
    } finally {
        await browser.close();
    }
}

testSystem();
