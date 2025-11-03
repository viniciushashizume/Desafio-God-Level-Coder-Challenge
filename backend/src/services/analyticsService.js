const db = require('../database');
 const { applyBaseFilters, getStartDateFromPeriod } = require('../utils/filterUtils');
 
 /**
  * Constrói a query base com joins dinâmicos baseados nos filtros.
  * @param {object} filters - O objeto de filtros.
  * @returns {import('knex').Knex.QueryBuilder}
  */
 function getBaseQuery(filters) {
   const qb = db('sales');
 
   // O applyBaseFilters já adiciona os JOINS de channel e store SE ELES FOREM USADOS.
   // Se não forem usados, não adicionamos joins desnecessários.
   applyBaseFilters(qb, filters);
 
   return qb;
 }
 
 /**
  * Busca os 4 KPIs principais.
  */
 async function getKpiMetrics(filters) {
   // Criamos uma nova query base
   const qb = getBaseQuery(filters);
 
   // Adicionamos as agregações
   qb.sum('total_amount as faturamentoTotal')
     .countDistinct('sales.id as totalPedidos')
     .avg('total_amount as ticketMedio')
     .avg({ tempoTotal: db.raw('COALESCE(production_seconds, 0) + COALESCE(delivery_seconds, 0)') })
     .first();
   // console.log(qb.toQuery()); // Descomente para debugar o SQL
   const result = await qb;
 
   // Formata o tempo médio para minutos
  const tempoMedioEmSegundos = parseFloat(result.tempoTotal) || 0; // Correção: 'tempoTotal' com 'T' maiúsculo
  result.tempoMedio = (tempoMedioEmSegundos / 60).toFixed(0);
   return result;
 }
 
 /**
  * Busca dados para o gráfico de vendas (Faturamento & Pedidos por Dia)
  */
 async function getSalesChartData(filters) {
   const qb = getBaseQuery(filters);
   const startDate = filters.period
     ? getStartDateFromPeriod(filters.period)
     : getStartDateFromPeriod('7days');
 
   // Seleciona a data truncada, soma o faturamento, conta pedidos
   qb.select(db.raw("DATE_TRUNC('day', sales.created_at) as date"))
     .sum('total_amount as sales')
     .countDistinct('sales.id as orders')
     .groupBy('date')
     .orderBy('date', 'asc');
 
   // console.log(qb.toQuery());
   const results = await qb;
 
   // Formata para o frontend (o Recharts espera 'date' como string)
   return results.map((r) => ({
     ...r,
     // O frontend mockado usa "Seg", "Ter", etc.
     // Vamos formatar a data para 'dd/mm' que é mais útil.
     // O ideal seria o frontend tratar isso, mas vamos facilitar.
     date: new Date(r.date).toLocaleDateString('pt-BR', {
       day: '2-digit',
       month: '2-digit',
     }),
     sales: parseFloat(r.sales),
     orders: parseInt(r.orders, 10),
   }));
 }
 
 /**
  * Busca dados para o gráfico de canais (Faturamento & Pedidos por Canal)
  */
 async function getChannelChartData(filters) {
   const qb = getBaseQuery(filters);
 
   // Se o filtro de canal JÁ FOI APLICADO, o join já existe.
   // Se não foi, precisamos adicionar agora.
   if (!filters.channel || filters.channel === 'all') {
     qb.join('channels', 'sales.channel_id', 'channels.id');
   }
 
   qb.select('channels.name as channel')
     .sum('total_amount as sales')
     .countDistinct('sales.id as orders')
     .groupBy('channels.name')
     .orderBy('sales', 'desc');
 
   // console.log(qb.toQuery());
   const results = await qb;
 
   return results.map((r) => ({
     ...r,
     sales: parseFloat(r.sales),
     orders: parseInt(r.orders, 10),
   }));
 }
 
 /**
  * Busca o Top 5 produtos
  */
 async function getTopProductsData(filters) {
   // Esta query é diferente, ela começa em 'product_sales'
   const qb = db('product_sales');
 
   // Precisamos dar join em 'sales' para poder aplicar os filtros
   qb.join('sales', 'product_sales.sale_id', 'sales.id');
   qb.join('products', 'product_sales.product_id', 'products.id');
   qb.join('categories', 'products.category_id', 'categories.id');
 
   // Agora aplicamos os filtros (que são na tabela 'sales')
   // Note que o applyBaseFilters precisa ser ajustado ou recriado
   // para lidar com os joins de 'stores' e 'channels' que podem já existir.
   
   // Vamos criar uma query base SÓ para os filtros.
   const filterQb = db('sales');
   applyBaseFilters(filterQb, filters);
   // Esta é uma "subquery" que o Knex vai otimizar
   qb.whereIn('sales.id', filterQb.select('sales.id'));
 
 
   qb.select(
     'products.name as name',
     'categories.name as category'
   )
     .sum('product_sales.total_price as sales')
     .sum('product_sales.quantity as quantity')
     .groupBy('products.name', 'categories.name')
     .orderBy('sales', 'desc')
     .limit(10);
 
   // console.log(qb.toQuery());
   const results = await qb;
 
   // O frontend espera um % de mudança. Calcular isso é uma query complexa
   // (precisa comparar com o período anterior).
   // Para o desafio, vamos focar em entregar os dados principais.
   return results.map((r) => ({
     ...r,
     sales: parseFloat(r.sales),
     quantity: parseInt(r.quantity, 10),
     change: 0, // Placeholder
   }));
 }
 
 /**
  * Busca os "Quick Insights"
  */
 async function getQuickInsights(filters) {
   // 1. Horário de Pico
   const picoQb = getBaseQuery(filters);
   const picoResult = await picoQb
     .select(db.raw("EXTRACT(HOUR FROM sales.created_at) as hour"))
     .countDistinct('sales.id as orders')
     .groupBy('hour')
     .orderBy('orders', 'desc')
     .first();
 
   // 2. Melhor Dia
   const diaQb = getBaseQuery(filters);
   // DOW: 0=Dom, 1=Seg, 2=Ter...
   const diaResult = await diaQb
     .select(db.raw("EXTRACT(DOW FROM sales.created_at) as dow"))
     .sum('total_amount as sales')
     .countDistinct('sales.id as orders')
     .groupBy('dow')
     .orderBy('sales', 'desc')
     .first();
 
   const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
 
   // 3. Canal Destaque
   // Reusa a query do gráfico de canais
   const canalResult = await getChannelChartData(filters);
 
   // --- INÍCIO DA CORREÇÃO ---
   // Adicionamos valores padrão caso os resultados sejam undefined
 
   const picoHour = picoResult?.hour ?? 0;
   const picoOrders = picoResult?.orders ?? 0;
 
   const melhorDiaNome = diasDaSemana[diaResult?.dow ?? 0] ?? 'N/A';
   const melhorDiaVendas = parseFloat(diaResult?.sales ?? 0).toLocaleString('pt-BR');
   const melhorDiaPedidos = diaResult?.orders ?? 0;
 
   const canalNome = canalResult[0]?.channel ?? 'N/A';
   const canalVendas = parseFloat(canalResult[0]?.sales ?? 0).toLocaleString('pt-BR');
 
   return {
     horarioPico: {
       hora: `${picoHour}h - ${parseInt(picoHour, 10) + 1}h`,
       pedidos: `${picoOrders} pedidos`,
     },
     melhorDia: {
       dia: melhorDiaNome,
       vendas: `R$ ${melhorDiaVendas}`,
       pedidos: `${melhorDiaPedidos} pedidos`,
     },
     canalDestaque: {
       canal: canalNome,
       vendas: `R$ ${canalVendas}`,
     },
   };
   // --- FIM DA CORREÇÃO ---
 }
 /**
  * Função principal que roda todas as queries em paralelo.
  */
 async function getDashboardData(filters = {}) {
   // Rodamos tudo em paralelo para máxima performance
   const [
     kpis,
     salesChart,
     channelChart,
     topProducts,
     quickInsights,
   ] = await Promise.all([
     getKpiMetrics(filters),
     getSalesChartData(filters),
     getChannelChartData(filters),
     getTopProductsData(filters),
     getQuickInsights(filters),
   ]);
 
   return {
     kpis,
     salesChart,
     channelChart,
     topProducts,
     quickInsights,
   };
 }
 
 /**
  * Busca os KPIs globais da página de produtos.
  */
 async function getProductKPIs() {
   // 1. Total de produtos ativos
   const productsQuery = db('products').whereNull('deleted_at');
   
   // 2. Faturamento e Quantidade de Vendas
   const salesQuery = db('product_sales')
     .join('sales', 'product_sales.sale_id', 'sales.id')
     .where('sales.sale_status_desc', 'COMPLETED');
 
   const [totalProductsResult, totalSalesResult] = await Promise.all([
     productsQuery.countDistinct('id as count').first(),
     salesQuery.sum('total_price as revenue').sum('quantity as quantity').first()
   ]);
 
   const totalRevenue = parseFloat(totalSalesResult.revenue || 0);
   const totalQuantity = parseInt(totalSalesResult.quantity || 0, 10);
   const avgPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;
   
   return {
     totalProducts: parseInt(totalProductsResult.count, 10),
     totalRevenue,
     avgPrice,
   };
 }
 
 /**
  * Busca a lista paginada e filtrada de produtos.
  * @param {object} filters
  * @param {string} filters.searchTerm - Termo para buscar
  * @param {number} filters.page - Página atual
  * @param {number} filters.limit - Itens por página
  * @param {string} filters.sortBy - Coluna para ordenar
  * @param {string} filters.sortOrder - 'asc' ou 'desc'
  */
 async function getProductsList(filters = {}) {
   const { searchTerm = '', page = 1, limit = 20, sortBy = 'sales', sortOrder = 'desc' } = filters;
   const offset = (page - 1) * limit;
 
   // --- INÍCIO DA ALTERAÇÃO: Validação da Ordenação ---
   const validSortColumns = {
     price: 'price',
     sales: 'sales',
     quantity: 'quantity',
   };
   const validSortOrders = {
     asc: 'asc',
     desc: 'desc',
   };
 
   const sortColumn = validSortColumns[sortBy] || 'sales';
   const sortDirection = validSortOrders[sortOrder] || 'desc';
   // --- FIM DA ALTERAÇÃO ---
 
   // Query base para a lista de produtos
   const qb = db('products')
     .leftJoin('categories', 'products.category_id', 'categories.id')
     .leftJoin('product_sales', 'product_sales.product_id', 'products.id')
     .leftJoin('sales', 'product_sales.sale_id', 'sales.id')
     .leftJoin('item_product_sales', 'item_product_sales.product_sale_id', 'product_sales.id')
     .select(
       'products.id',
       'products.name',
       'categories.name as category',
       // Usamos o AVG do base_price, pois o total_price inclui adicionais
       db.raw('COALESCE(AVG(product_sales.base_price), 0) as price'),
       db.raw('COALESCE(SUM(product_sales.total_price), 0) as sales'),
       db.raw('COALESCE(SUM(product_sales.quantity), 0) as quantity'),
       db.raw('COUNT(DISTINCT item_product_sales.id) as options_count')
     )
     .whereNull('products.deleted_at')
     // Filtramos apenas por vendas completas para ter dados realistas de vendas
     .andWhere(function() {
       this.where('sales.sale_status_desc', 'COMPLETED').orWhereNull('sales.id');
     })
     .groupBy('products.id', 'categories.name');
 
   // Aplicar filtro de busca
   if (searchTerm) {
     qb.where(function() {
       this.where('products.name', 'ILIKE', `%${searchTerm}%`)
           .orWhere('categories.name', 'ILIKE', `%${searchTerm}%`);
     });
   }
   
   // Query para contar o total de produtos encontrados (para paginação)
   const countQuery = qb.clone().clearSelect().clearOrder().countDistinct('products.id as total').first();
   
   // --- INÍCIO DA ALTERAÇÃO: Aplicar ordenação dinâmica ---
   // Aplicar ordenação, paginação e limite à query principal
   qb.orderBy(sortColumn, sortDirection)
     .limit(limit)
     .offset(offset);
   // --- FIM DA ALTERAÇÃO ---
 
   // Executar as queries em paralelo
   const [products, totalResult] = await Promise.all([qb, countQuery]);
   
   const totalProductsFound = parseInt(totalResult.total, 10);
   const totalPages = Math.ceil(totalProductsFound / limit);
 
   return {
     products: products.map(p => ({
       ...p,
       price: parseFloat(p.price),
       sales: parseFloat(p.sales),
       quantity: parseInt(p.quantity, 10),
       options_count: parseInt(p.options_count, 10),
       change: 0 // Placeholder, como em topProducts
     })),
     page,
     totalPages,
     totalProducts: totalProductsFound
   };
 }
 
// --- INÍCIO: NOVAS FUNÇÕES PARA CLIENTES ---

/**
 * Busca os KPIs globais da página de clientes.
 */
async function getCustomerKPIs() {
  // 1. Total de clientes
  const totalCustomersQuery = db('customers').count('id as total').first();
  
  // 2. Faturamento e Pedidos de clientes registrados
  const salesStatsQuery = db('sales')
    .where('sale_status_desc', 'COMPLETED')
    // *** AQUI ESTAVA O ERRO: "andWhereNotNull" foi trocado por "whereNotNull" ***
    .whereNotNull('customer_id') 
    .sum('total_amount as totalRevenue')
    .count('id as totalOrders')
    .first();

  const [totalResult, salesStats] = await Promise.all([
    totalCustomersQuery,
    salesStatsQuery
  ]);

  const totalCustomers = parseInt(totalResult.total, 10);
  const totalRevenue = parseFloat(salesStats.totalRevenue || 0);
  const totalOrders = parseInt(salesStats.totalOrders || 0, 10);
  const avgOverallTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalCustomers,
    totalRevenue: totalRevenue,
    avgOverallTicket,
  };
}

/**
 * Busca a lista paginada e filtrada de clientes.
 * @param {object} filters
 */
async function getCustomersList(filters = {}) {
  const { searchTerm = '', page = 1, limit = 20, sortBy = 'orderCount', sortOrder = 'desc' } = filters;
  const offset = (page - 1) * limit;

  // Validação da ordenação
  const validSortColumns = {
    orderCount: 'orderCount',
    totalSpent: 'totalSpent',
    avgTicket: 'avgTicket',
  };
  const validSortOrders = {
    asc: 'asc',
    desc: 'desc',
  };
  const sortColumn = validSortColumns[sortBy] || 'orderCount';
  const sortDirection = validSortOrders[sortOrder] || 'desc';

  // Query base para filtros e contagem
  const baseQuery = db('customers');
  if (searchTerm) {
    baseQuery.where(function() {
      this.where('customer_name', 'ILIKE', `%${searchTerm}%`)
          .orWhere('email', 'ILIKE', `%${searchTerm}%`);
    });
  }

  // Contagem total para paginação
  const totalResult = await baseQuery.clone().count('id as total').first();
  const totalCustomers = parseInt(totalResult.total, 10);
  const totalPages = Math.ceil(totalCustomers / limit);

  // Subquery para agregar dados de vendas (apenas completas)
  const salesSubQuery = db('sales')
    .select('customer_id')
    .sum({ totalSpent: 'total_amount' })
    .count({ orderCount: 'id' })
    .avg({ avgTicket: 'total_amount' })
    .max({ lastOrder: 'created_at' })
    .where('sale_status_desc', 'COMPLETED')
    .groupBy('customer_id')
    .as('sales_stats');

  // Query principal para buscar a lista de clientes com dados agregados
  const customers = await baseQuery.clone()
    .leftJoin(salesSubQuery, 'customers.id', 'sales_stats.customer_id')
    .select(
      'customers.id',
      'customers.customer_name as name',
      'customers.email',
      'customers.phone_number as phone',
      db.raw('COALESCE(sales_stats."orderCount", 0) as "orderCount"'),
      db.raw('COALESCE(sales_stats."totalSpent", 0) as "totalSpent"'),
      db.raw('COALESCE(sales_stats."avgTicket", 0) as "avgTicket"'),
      'sales_stats.lastOrder'
    )
    .orderBy(sortColumn, sortDirection)
    .limit(limit)
    .offset(offset);

  return {
    customers: customers.map(c => ({
      ...c,
      totalSpent: parseFloat(c.totalSpent),
      avgTicket: parseFloat(c.avgTicket),
      orderCount: parseInt(c.orderCount, 10),
    })),
    page: parseInt(page, 10),
    totalPages,
  };
}

// --- FIM: NOVAS FUNÇÕES PARA CLIENTES ---


 module.exports = {
   getDashboardData,
   getProductKPIs,   // Adicionar esta linha
   getProductsList,  // Adicionar esta linha
   getCustomerKPIs,    // Exportar nova função
   getCustomersList, // Exportar nova função
 };

 // --- INÍCIO: NOVAS FUNÇÕES PARA PÁGINA OPERACIONAL ---

/**
 * Busca dados de performance por canal.
 */
async function getChannelPerformance(filters) {
  const qb = getBaseQuery(filters);

  // Garante o join com channels se ainda não foi feito
  if (!filters.channel || filters.channel === 'all') {
    qb.join('channels', 'sales.channel_id', 'channels.id');
  }

  const results = await qb
    .select('channels.name as name')
    .countDistinct('sales.id as orders')
    .sum('sales.total_amount as revenue')
    .groupBy('channels.name')
    .orderBy('revenue', 'desc');

  // Nota: A comissão não está no schema do DB (database-schema.sql).
  // Por isso, retornamos 0.
  return results.map((r) => ({
    name: r.name,
    orders: parseInt(r.orders, 10),
    revenue: parseFloat(r.revenue),
    commission: 0, // Não há dados de comissão no schema do DB
  }));
}

/**
 * Busca dados de performance por loja.
 */
async function getStorePerformance(filters) {
  const qb = getBaseQuery(filters);

  // Garante o join com stores se ainda não foi feito
  if (!filters.store || filters.store === 'all') {
    qb.join('stores', 'sales.store_id', 'stores.id');
  }

  // Calcula o tempo médio em minutos
  const avgTimeRaw = db.raw(
    'COALESCE(AVG(sales.production_seconds + COALESCE(sales.delivery_seconds, 0)) / 60, 0)'
  );

  const results = await qb
    .select(
      'stores.id',
      'stores.name as name',
      db.raw('COUNT(DISTINCT sales.id) as orders'),
      db.raw('SUM(sales.total_amount) as revenue'),
      db.raw('ROUND(?, 0) as "avgTime"', [avgTimeRaw]) // Arredonda para minutos
    )
    .groupBy('stores.id', 'stores.name')
    .orderBy('revenue', 'desc');
  
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    orders: parseInt(r.orders, 10),
    revenue: parseFloat(r.revenue),
    avgTime: parseInt(r.avgTime, 10),
  }));
}

/**
 * Busca estatísticas de métodos de pagamento.
 */
async function getPaymentMethodStats(filters) {
  const qb = getBaseQuery(filters);

  // Precisamos fazer join com payments e payment_types
  qb.join('payments', 'sales.id', 'payments.sale_id')
    .join('payment_types', 'payments.payment_type_id', 'payment_types.id');

  const results = await qb
    .select('payment_types.description as method')
    .count('payments.id as count')
    .sum('payments.value as total')
    .groupBy('payment_types.description')
    .orderBy('total', 'desc');

  return results.map((r) => ({
    method: r.method,
    count: parseInt(r.count, 10),
    total: parseFloat(r.total),
  }));
}

/**
 * Busca os KPIs da página operacional.
 * (Agregados dos dados de performance)
 */
async function getOperationalKPIs(storeData) {
  // Calculamos os KPIs a partir dos dados já buscados
  const totalOrders = storeData.reduce((sum, s) => sum + s.orders, 0);
  const totalRevenue = storeData.reduce((sum, s) => sum + s.revenue, 0);
  
  // Calcula o tempo médio ponderado pelo número de pedidos
  const totalWeightedTime = storeData.reduce((sum, s) => sum + (s.avgTime * s.orders), 0);
  const avgTime = totalOrders > 0 ? Math.round(totalWeightedTime / totalOrders) : 0;

  return {
    totalOrders,
    totalRevenue,
    avgTime, // Tempo Médio Geral em minutos
  };
}


/**
 * Função principal que busca todos os dados da página Operacional.
 */
async function getOperationalData(filters = {}) {
  // Buscamos os dados de loja, canal e pagamentos em paralelo
  const [storeData, channelData, paymentMethods] = await Promise.all([
    getStorePerformance(filters),
    getChannelPerformance(filters),
    getPaymentMethodStats(filters),
  ]);
  
  // Calculamos os KPIs principais a partir dos dados das lojas
  const kpis = await getOperationalKPIs(storeData);

  return {
    kpis,
    storeData,
    channelData,
    paymentMethods,
  };
}

// --- FIM: NOVAS FUNÇÕES PARA PÁGINA OPERACIONAL ---

// Atualize o module.exports para incluir as novas funções
module.exports = {
  getDashboardData,
  getProductKPIs,
  getProductsList,
  getCustomerKPIs,
  getCustomersList,
  getOperationalData, // <-- Adicionar esta linha
};