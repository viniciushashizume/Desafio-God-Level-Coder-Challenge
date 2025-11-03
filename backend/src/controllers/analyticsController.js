const analyticsService = require('../services/analyticsService');
 
 async function getDashboardData(req, res) {
   try {
     // Os filtros vêm do body de um POST
     // O seu frontend `FilterBar.tsx` envia 'period', 'channel', 'store'
     const filters = req.body;
     
     // Passa os filtros para o serviço
     const data = await analyticsService.getDashboardData(filters);
     
     // Retorna os dados compilados
     res.json(data);
   } catch (error) {
     console.error('Erro ao buscar dados do dashboard:', error);
     res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
   }
 }
 
 async function getProductsPageData(req, res) {
   try {
     // --- INÍCIO DA ALTERAÇÃO ---
     // Filtros vêm da query string para um GET
     const { searchTerm = '', page = 1, sortBy = 'sales', sortOrder = 'desc' } = req.query;
     // --- FIM DA ALTERAÇÃO ---
     
     // 1. Busca os KPIs (são globais, não dependem do filtro)
     const kpis = await analyticsService.getProductKPIs();
     
     // --- INÍCIO DA ALTERAÇÃO ---
     // 2. Busca a lista de produtos filtrada e paginada
     const listData = await analyticsService.getProductsList({
       searchTerm: String(searchTerm),
       page: parseInt(String(page), 10),
       sortBy: String(sortBy),
       sortOrder: String(sortOrder),
     });
     // --- FIM DA ALTERAÇÃO ---
 
     // 3. Combina os resultados
     res.json({
       ...kpis,
       ...listData,
     });
     
   } catch (error) {
     console.error('Erro ao buscar dados da página de produtos:', error);
     res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
   }
 }
 
 // --- INÍCIO: NOVA FUNÇÃO PARA CLIENTES ---
async function getCustomersPageData(req, res) {
 try {
   const { searchTerm = '', page = 1, sortBy = 'orderCount', sortOrder = 'desc' } = req.query;
   
   // 1. Busca os KPIs
   const kpis = await analyticsService.getCustomerKPIs();
   
   // 2. Busca a lista de clientes filtrada e paginada
   const listData = await analyticsService.getCustomersList({
     searchTerm: String(searchTerm),
     page: parseInt(String(page), 10),
     sortBy: String(sortBy),
     sortOrder: String(sortOrder),
   });

   // 3. Combina os resultados
   res.json({
     ...kpis,
     ...listData,
   });
   
 } catch (error) {
   console.error('Erro ao buscar dados da página de clientes:', error);
   res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
 }
}
// --- FIM: NOVA FUNÇÃO PARA CLIENTES ---

 // *** GARANTA QUE O "getCustomersPageData" ESTÁ NO EXPORTS ***
async function getOperationalData(req, res) {
  try {
    // Filtros vêm do body de um POST, igual ao dashboard
    const filters = req.body;
    
    const data = await analyticsService.getOperationalData(filters);
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados operacionais:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
}
// --- FIM: NOVA FUNÇÃO PARA PÁGINA OPERACIONAL ---
 
 module.exports = {
   getDashboardData,
   getProductsPageData,
   getCustomersPageData,
   getOperationalData, // <-- Adicionar esta linha
 };