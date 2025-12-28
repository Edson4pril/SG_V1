/**
 * ========================================
 * Sistema de Gestão Professional
 * Módulo de Utilitários - utils.js
 * ========================================
 * 
 * Este módulo contém funções utilitárias e helpers
 * utilizados em toda a aplicação.
 */

 /**
 * Formata um valor numérico para o formato de moeda angolana (Kwanza - AOA).
 * 
 * @param {number} value - O valor numérico a ser formatado.
 * @returns {string} O valor formatado como string (ex: "KZ 1.234,56").
 */
function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'KZ 0,00';
    }
    
    return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Formata um valor numérico para exibição sem o símbolo da moeda.
 * Útil para cálculos e comparações.
 * 
 * @param {number} value - O valor numérico.
 * @returns {string} O valor formatado (ex: "1.234,56").
 */
function formatNumber(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0';
    }
    
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Formata uma data no formato brasileiro (dd/mm/yyyy).
 * 
 * @param {string} dateString - A data no formato ISO ou string de data.
 * @returns {string} A data formatada (ex: "25/12/2025").
 */
function formatDate(dateString) {
    if (!dateString || dateString === '-') {
        return '-';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return dateString;
    }
    
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formata uma data com hora no formato brasileiro.
 * 
 * @param {string} dateString - A data no formato ISO.
 * @returns {string} A data e hora formatadas (ex: "25/12/2025 14:30:25").
 */
function formatDateTime(dateString) {
    if (!dateString || dateString === '-') {
        return '-';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return dateString;
    }
    
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Formata uma data para o formato ISO (yyyy-mm-dd).
 * Útil para inputs de data em formulários.
 * 
 * @param {Date} date - A data a ser formatada.
 * @returns {string} A data no formato ISO.
 */
function formatDateISO(date) {
    if (!date) {
        date = new Date();
    }
    
    return date.toISOString().split('T')[0];
}

/**
 * Gera um identificador único baseado em timestamp e aleatoriedade.
 * 
 * @returns {string} Um ID único (ex: "kl9s8d7k9s8d7").
 */
function generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return timestamp + random;
}

/**
 * Gera um código de produto ou venda com prefixo e número sequencial.
 * 
 * @param {string} prefix - O prefixo do código (ex: "PROD", "SALE").
 * @returns {string} O código gerado (ex: "PROD-00001").
 */
function generateCode(prefix) {
    const timestamp = Date.now().toString(36).substring(-4).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${random}${timestamp}`;
}

/**
 * Calcula a margem de lucro percentual entre custo e preço de venda.
 * 
 * @param {number} cost - O preço de custo.
 * @param {number} price - O preço de venda.
 * @returns {number} A margem de lucro em percentual (ex: 50.5).
 */
function calculateMargin(cost, price) {
    if (!cost || cost === 0 || price === 0) {
        return 0;
    }
    
    const margin = ((price - cost) / cost) * 100;
    return Math.round(margin * 10) / 10;
}

/**
 * Calcula o lucro líquido de uma venda.
 * 
 * @param {number} total - O valor total da venda.
 * @param {number} cost - O custo total dos produtos.
 * @returns {number} O lucro líquido.
 */
function calculateProfit(total, cost) {
    return total - cost;
}

/**
 * Retorna o nome do mês dado seu índice (0-11).
 * 
 * @param {number} monthIndex - O índice do mês (0 = Janeiro).
 * @returns {string} O nome do mês.
 */
function getMonthName(monthIndex) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    if (monthIndex < 0 || monthIndex > 11) {
        return 'Mês Inválido';
    }
    
    return months[monthIndex];
}

/**
 * Retorna o nome abreviado do mês.
 * 
 * @param {number} monthIndex - O índice do mês.
 * @returns {string} O nome abreviado (ex: "Jan", "Fev").
 */
function getMonthShortName(monthIndex) {
    const months = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    if (monthIndex < 0 || monthIndex > 11) {
        return '---';
    }
    
    return months[monthIndex];
}

/**
 * Retorna os últimos N meses como um array de objetos.
 * Útil para relatórios e gráficos.
 * 
 * @param {number} count - Quantidade de meses a retornar (padrão: 6).
 * @returns {Array} Array de objetos com mês, ano e rótulo.
 */
function getLastMonths(count = 6) {
    const months = [];
    
    for (let i = count - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        months.push({
            month: date.getMonth(),
            year: date.getFullYear(),
            label: getMonthName(date.getMonth()).substring(0, 3) + '/' + date.getFullYear().toString().substring(2),
            fullLabel: getMonthName(date.getMonth()) + '/' + date.getFullYear()
        });
    }
    
    return months;
}

/**
 * Valida um endereço de e-mail.
 * 
 * @param {string} email - O e-mail a ser validado.
 * @returns {boolean} True se o e-mail for válido.
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida um número de CPF brasileiro.
 * 
 * @param {string} cpf - O CPF a ser validado.
 * @returns {boolean} True se o CPF for válido.
 */
function validateCPF(cpf) {
    if (!cpf || cpf.length !== 11) {
        return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cpf.charAt(9)) !== digit1) {
        return false;
    }
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cpf.charAt(10)) === digit2;
}

/**
 * Valida um número de CNPJ brasileiro.
 * 
 * @param {string} cnpj - O CNPJ a ser validado.
 * @returns {boolean} True se o CNPJ for válido.
 */
function validateCNPJ(cnpj) {
    if (!cnpj || cnpj.length !== 14) {
        return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let weight = 5;
    
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cnpj.charAt(12)) !== digit1) {
        return false;
    }
    
    sum = 0;
    weight = 6;
    
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cnpj.charAt(13)) === digit2;
}

/**
 * Valida um valor numérico positivo.
 * 
 * @param {number} value - O valor a ser validado.
 * @returns {boolean} True se o valor for válido.
 */
function validatePositiveNumber(value) {
    return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Valida uma data.
 * 
 * @param {string} dateString - A data no formato string.
 * @returns {boolean} True se a data for válida.
 */
function validateDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

/**
 * Sanitiza uma string removendo caracteres especiais e espaços extras.
 * 
 * @param {string} str - A string a ser sanitizada.
 * @returns {string} A string sanitizada.
 */
function sanitizeString(str) {
    if (!str) return '';
    
    return str
        .trim()
        .replace(/[<>]/g, '') // Remove caracteres HTML
        .replace(/['"]/g, '"'); // Normaliza aspas
}

/**
 * Capitaliza a primeira letra de cada palavra (Title Case).
 * 
 * @param {string} str - A string a ser convertida.
 * @returns {string} A string em Title Case.
 */
function toTitleCase(str) {
    if (!str) return '';
    
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Trunca uma string para um comprimento máximo.
 * 
 * @param {string} str - A string a ser truncada.
 * @param {number} maxLength - O comprimento máximo.
 * @returns {string} A string truncada com sufixo se necessário.
 */
function truncate(str, maxLength = 50) {
    if (!str || str.length <= maxLength) {
        return str;
    }
    
    return str.substring(0, maxLength) + '...';
}

/**
 * Exporta dados para formato CSV e inicia o download.
 * 
 * @param {Array} data - Array de objetos a serem exportados.
 * @param {string} filename - Nome do arquivo para download.
 * @param {Array} headers - Cabeçalhos opcionais (usará chaves do objeto se não fornecido).
 */
function exportToCSV(data, filename, headers = null) {
    if (!data || data.length === 0) {
        console.warn('Nenhum dado para exportar');
        return;
    }
    
    // Determina os cabeçalhos
    const keys = headers || Object.keys(data[0]);
    
    // Cria o cabeçalho do CSV
    let csvContent = keys.join(',') + '\n';
    
    // Adiciona as linhas de dados
    data.forEach(item => {
        const row = keys.map(key => {
            let value = item[key];
            
            // Converte valores para string
            if (value === null || value === undefined) {
                value = '';
            } else {
                value = value.toString();
            }
            
            // Escapa aspas duplas e envolve em aspas se necessário
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            
            return value;
        });
        
        csvContent += row.join(',') + '\n';
    });
    
    // Cria o blob e inicia o download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Exporta dados para formato JSON e inicia o download.
 * 
 * @param {Object} data - Os dados a serem exportados.
 * @param {string} filename - Nome do arquivo para download.
 */
function exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Copia um texto para a área de transferência.
 * 
 * @param {string} text - O texto a ser copiado.
 * @returns {Promise<boolean>} True se a cópia foi bem sucedida.
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            return true;
        } catch (e) {
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

/**
 * Debounce - Evita que uma função seja executada muitas vezes.
 * Útil para buscas em tempo real.
 * 
 * @param {Function} func - A função a ser executada.
 * @param {number} wait - O tempo de espera em milissegundos.
 * @returns {Function} A função com debounce.
 */
function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle - Limita a frequência de execução de uma função.
 * 
 * @param {Function} func - A função a ser executada.
 * @param {number} limit - O intervalo mínimo entre execuções.
 * @returns {Function} A função com throttle.
 */
function throttle(func, limit = 300) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Cria um objeto com os dados de um período.
 * 
 * @param {string} startDate - Data de início.
 * @param {string} endDate - Data de fim.
 * @param {Array} data - Array de dados com campo de data.
 * @param {string} dateField - Nome do campo de data nos objetos.
 * @returns {Array} Dados filtrados pelo período.
 */
function filterByDateRange(startDate, endDate, data, dateField = 'date') {
    let filtered = [...data];
    
    if (startDate) {
        filtered = filtered.filter(item => item[dateField] >= startDate);
    }
    
    if (endDate) {
        filtered = filtered.filter(item => item[dateField] <= endDate);
    }
    
    return filtered;
}

/**
 * Agrupa dados por um campo específico.
 * 
 * @param {Array} data - Array de objetos.
 * @param {string} field - Campo para agrupamento.
 * @returns {Object} Objeto com arrays agrupados.
 */
function groupBy(data, field) {
    return data.reduce((groups, item) => {
        const key = item[field];
        groups[key] = groups[key] || [];
        groups[key].push(item);
        return groups;
    }, {});
}

/**
 * Soma valores de um campo em um array de objetos.
 * 
 * @param {Array} data - Array de objetos.
 * @param {string} field - Campo numérico a ser somado.
 * @returns {number} A soma dos valores.
 */
function sumBy(data, field) {
    return data.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
}

/**
 * Retorna a média de valores de um campo.
 * 
 * @param {Array} data - Array de objetos.
 * @param {string} field - Campo numérico.
 * @returns {number} A média dos valores.
 */
function averageBy(data, field) {
    if (data.length === 0) return 0;
    return sumBy(data, field) / data.length;
}

/**
 * Retorna o valor máximo de um campo.
 * 
 * @param {Array} data - Array de objetos.
 * @param {string} field - Campo numérico.
 * @returns {number} O valor máximo.
 */
function maxBy(data, field) {
    if (data.length === 0) return 0;
    return Math.max(...data.map(item => parseFloat(item[field]) || 0));
}

/**
 * Retorna o valor mínimo de um campo.
 * 
 * @param {Array} data - Array de objetos.
 * @param {string} field - Campo numérico.
 * @returns {number} O valor mínimo.
 */
function minBy(data, field) {
    if (data.length === 0) return 0;
    return Math.min(...data.map(item => parseFloat(item[field]) || 0));
}

/**
 * Ordena um array de objetos por um campo.
 * 
 * @param {Array} data - Array de objetos.
 * @param {string} field - Campo para ordenação.
 * @param {string} order - 'asc' para ascendente, 'desc' para descendente.
 * @returns {Array} O array ordenado.
 */
function sortBy(data, field, order = 'asc') {
    return [...data].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Remove duplicatas de um array baseado em uma chave.
 * 
 * @param {Array} data - Array de objetos.
 * @param {string} key - Campo para verificação de duplicatas.
 * @returns {Array} Array sem duplicatas.
 */
function uniqueBy(data, key) {
    const seen = new Set();
    return data.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

/**
 * Limpa e formata dados para exibições seguras.
 * 
 * @param {any} value - O valor a ser limpo.
 * @param {string} type - O tipo esperado ('string', 'number', 'currency', 'date').
 * @returns {any} O valor limpo e formatado.
 */
function cleanValue(value, type = 'string') {
    if (value === null || value === undefined) {
        switch (type) {
            case 'number':
            case 'currency':
                return 0;
            case 'date':
                return '-';
            default:
                return '';
        }
    }
    
    switch (type) {
        case 'number':
            return parseFloat(value) || 0;
        case 'currency':
            return formatCurrency(parseFloat(value) || 0);
        case 'date':
            return formatDate(value);
        case 'boolean':
            return Boolean(value);
        default:
            return sanitizeString(value.toString());
    }
}

/**
 * Gera uma cor aleatória no formato hexadecimal.
 * 
 * @returns {string} Cor em formato hexadecimal.
 */
function randomColor() {
    const colors = [
        '#1E3A5F', '#27AE60', '#F39C12', '#E74C3C',
        '#3498DB', '#9B59B6', '#1ABC9C', '#E67E22'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Gera cores para gráficos baseadas em quantidade.
 * 
 * @param {number} count - Quantidade de cores necessárias.
 * @returns {Array} Array de cores em hexadecimal.
 */
function generateChartColors(count) {
    const baseColors = [
        '#1E3A5F', '#27AE60', '#F39C12', '#E74C3C',
        '#3498DB', '#9B59B6', '#1ABC9C', '#E67E22',
        '#2ECC71', '#3498DB', '#9B59B6', '#F1C40F',
        '#E74C3C', '#1ABC9C', '#E67E22', '#34495E'
    ];
    
    const colors = [];
    
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
}

/**
 * Converte dados para um formato adequado para gráficos.
 * 
 * @param {Array} labels - Rótulos.
 * @param {Array} data - Dados numéricos.
 * @param {string} label - Rótulo do dataset.
 * @param {string} type - Tipo de gráfico.
 * @returns {Object} Objeto formatado para Chart.js.
 */
function formatChartData(labels, data, label, type = 'line') {
    const bgColors = type === 'doughnut' || type === 'pie' 
        ? generateChartColors(data.length) 
        : 'rgba(30, 58, 95, 0.1)';
    
    const borderColors = type === 'doughnut' || type === 'pie'
        ? generateChartColors(data.length)
        : '#1E3A5F';
    
    return {
        labels: labels,
        datasets: [{
            label: label,
            data: data,
            backgroundColor: bgColors,
            borderColor: borderColors,
            borderWidth: 2,
            fill: type === 'line',
            tension: 0.4,
            pointRadius: type === 'line' ? 4 : undefined,
            pointHoverRadius: type === 'line' ? 6 : undefined
        }]
    };
}

/**
 * Verifica se o dispositivo é mobile.
 * 
 * @returns {boolean} True se for um dispositivo mobile.
 */
function isMobile() {
    return window.innerWidth < 768;
}

/**
 * Obtém a URL atual com parâmetros de query.
 * 
 * @returns {URLSearchParams} Parâmetros da URL.
 */
function getURLParams() {
    return new URLSearchParams(window.location.search);
}

/**
 * Define um parâmetro na URL sem recarregar a página.
 * 
 * @param {string} key - Chave do parâmetro.
 * @param {string} value - Valor do parâmetro.
 */
function setURLParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
}

/**
 * Remove um parâmetro da URL.
 * 
 * @param {string} key - Chave do parâmetro a ser removido.
 */
function removeURLParam(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.pushState({}, '', url);
}

/**
 * Exporta o módulo para uso em outros arquivos.
 */

// Expõe funções globalmente para uso em navegadores
if (typeof window !== 'undefined') {
    window.formatCurrency = formatCurrency;
    window.formatNumber = formatNumber;
    window.formatDate = formatDate;
    window.formatDateTime = formatDateTime;
    window.formatDateISO = formatDateISO;
    window.generateId = generateId;
    window.generateCode = generateCode;
    window.calculateMargin = calculateMargin;
    window.calculateProfit = calculateProfit;
    window.getMonthName = getMonthName;
    window.getMonthShortName = getMonthShortName;
    window.getLastMonths = getLastMonths;
    window.validateEmail = validateEmail;
    window.validateCPF = validateCPF;
    window.validateCNPJ = validateCNPJ;
    window.validatePositiveNumber = validatePositiveNumber;
    window.validateDate = validateDate;
    window.sanitizeString = sanitizeString;
    window.toTitleCase = toTitleCase;
    window.truncate = truncate;
    window.exportToCSV = exportToCSV;
    window.exportToJSON = exportToJSON;
    window.copyToClipboard = copyToClipboard;
    window.debounce = debounce;
    window.throttle = throttle;
    window.filterByDateRange = filterByDateRange;
    window.groupBy = groupBy;
    window.sumBy = sumBy;
    window.averageBy = averageBy;
    window.maxBy = maxBy;
    window.minBy = minBy;
    window.sortBy = sortBy;
    window.uniqueBy = uniqueBy;
    window.cleanValue = cleanValue;
    window.randomColor = randomColor;
    window.generateChartColors = generateChartColors;
    window.formatChartData = formatChartData;
    window.isMobile = isMobile;
    window.getURLParams = getURLParams;
    window.setURLParam = setURLParam;
    window.removeURLParam = removeURLParam;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatNumber,
        formatDate,
        formatDateTime,
        formatDateISO,
        generateId,
        generateCode,
        calculateMargin,
        calculateProfit,
        getMonthName,
        getMonthShortName,
        getLastMonths,
        validateEmail,
        validateCPF,
        validateCNPJ,
        validatePositiveNumber,
        validateDate,
        sanitizeString,
        toTitleCase,
        truncate,
        exportToCSV,
        exportToJSON,
        copyToClipboard,
        debounce,
        throttle,
        filterByDateRange,
        groupBy,
        sumBy,
        averageBy,
        maxBy,
        minBy,
        sortBy,
        uniqueBy,
        cleanValue,
        randomColor,
        generateChartColors,
        formatChartData,
        isMobile,
        getURLParams,
        setURLParam,
        removeURLParam
    };
}
