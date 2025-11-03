// src/types/api.ts
 
 /**
  * Opção individual para os seletores de filtro.
  */
 export interface FilterOption {
   id: number;
   name: string;
 }
 
 /**
  * Objeto retornado pela API de metadados.
  */
 export interface FilterMetadata {
   stores: FilterOption[];
   channels: FilterOption[];
 }
 
 /**
  * Objeto de filtros enviado para a API do dashboard.
  */
 export interface Filters {
   period: string;
   channel: string;
   store: string;
 }
 
 // --- Tipos para os dados do Dashboard ---
 
 interface KpiData {
   faturamentoTotal: number;
   totalPedidos: number;
   ticketMedio: number;
   tempoMedio: string; // O backend já formata para "X min"
 }
 
 interface SalesChartData {
   date: string;
   sales: number;
   orders: number;
 }
 
 interface ChannelChartData {
   channel: string;
   sales: number;
   orders: number;
 }
 
 interface TopProductData {
   name: string;
   category: string;
   sales: number;
   quantity: number;
   change: number; // O backend está enviando 0 como placeholder
 }
 
 interface QuickInsightsData {
   horarioPico: {
     hora: string;
     pedidos: string;
   };
   melhorDia: {
     dia: string;
     vendas: string;
     pedidos: string;
   };
   canalDestaque: {
     canal: string;
     vendas: string;
   };
 }
 
 /**
  * Estrutura completa dos dados retornados pela API do dashboard.
  */
 export interface DashboardData {
   kpis: KpiData;
   salesChart: SalesChartData[];
   channelChart: ChannelChartData[];
   topProducts: TopProductData[];
   quickInsights: QuickInsightsData;
 }
 
  // --- INÍCIO DA ALTERAÇÃO ---
  export type ProductSortKeys = 'id' | 'price' | 'sales' | 'quantity';
  export type SortOrder = 'asc' | 'desc';
 
 export interface ProductPageFilters {
   searchTerm: string;
   page: number;
   sortBy: ProductSortKeys;
   sortOrder: SortOrder;
 }
 // --- FIM DA ALTERAÇÃO ---
 
 export interface ProductData {
   id: number;
   name: string;
   category: string;
   price: number;
   sales: number;
   quantity: number;
   options_count: number;
   change: number;
 }
 
 export interface ProductsPageData {
   totalProducts: number;    // KPI: Total de produtos cadastrados
   totalRevenue: number;     // KPI: Faturamento total de todos produtos
   avgPrice: number;         // KPI: Preço médio
   products: ProductData[];  // Lista de produtos para a tabela
   page: number;
   totalPages: number;
 }

 export type CustomerSortKeys = 'orderCount' | 'totalSpent' | 'avgTicket';
// SortOrder já foi definido acima

export interface CustomerPageFilters {
  searchTerm: string;
  page: number;
  sortBy: CustomerSortKeys;
  sortOrder: SortOrder;
}

export interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  avgTicket: number;
  lastOrder: string | null;
}

export interface CustomersPageData {
  totalCustomers: number;
  totalRevenue: number;
  avgOverallTicket: number;
  customers: CustomerData[];
  page: number;
  totalPages: number;
}
// --- FIM: NOVOS TIPOS PARA CLIENTES ---

export interface ChannelPerformance {
  name: string;
  orders: number;
  revenue: number;
  commission: number; // Será 0 por enquanto
}

export interface StorePerformance {
  id: number;
  name: string;
  orders: number;
  revenue: number;
  avgTime: number; // Em minutos
}

export interface PaymentMethodStats {
  method: string;
  count: number;
  total: number;
}

export interface OperationalData {
  kpis: {
    totalOrders: number;
    totalRevenue: number;
    avgTime: number; // Tempo médio geral em minutos
  };
  channelData: ChannelPerformance[];
  storeData: StorePerformance[];
  paymentMethods: PaymentMethodStats[];
}