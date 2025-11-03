// src/lib/api.ts
 
 import { 
   Filters, 
   DashboardData, 
   FilterMetadata, 
   ProductsPageData,
   ProductPageFilters,
   CustomerPageFilters,
   CustomersPageData,
   OperationalData
 } from "@/types/api";
 
 const API_BASE_URL = "/api/v1";
 
 export async function fetchFilterMetadata(): Promise<FilterMetadata> {
   const res = await fetch(`${API_BASE_URL}/metadata/filters`);
   if (!res.ok) {
     throw new Error("Falha ao buscar metadados dos filtros");
   }
   return res.json();
 }
 
 /**
  * Busca os dados do dashboard com base nos filtros aplicados.
  */
 export async function fetchDashboardData(
   filters: Filters,
 ): Promise<DashboardData> {
   const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify(filters),
   });
 
   if (!res.ok) {
     const errorData = await res.json();
     throw new Error(
       errorData.message || "Falha ao buscar dados do dashboard",
     );
   }
   return res.json();
 }
 
 // ... (outras funções de fetch)
 
 /**
  * Busca os dados da página de produtos (KPIs e lista paginada).
  */
 // --- INÍCIO DA ALTERAÇÃO ---
 export async function fetchProductsPageData(
   filters: ProductPageFilters,
 ): Promise<ProductsPageData> {
   const params = new URLSearchParams({
     searchTerm: filters.searchTerm,
     page: String(filters.page),
     sortBy: filters.sortBy,
     sortOrder: filters.sortOrder,
   });
 
   const res = await fetch(`${API_BASE_URL}/analytics/products?${params.toString()}`);
   // --- FIM DA ALTERAÇÃO ---
   
   if (!res.ok) {
     const errorData = await res.json();
     throw new Error(
       errorData.message || "Falha ao buscar dados dos produtos",
     );
   }
   return res.json();
 }

 // --- INÍCIO: NOVA FUNÇÃO PARA CLIENTES ---

/**
 * Busca os dados da página de clientes (KPIs e lista paginada).
 */
export async function fetchCustomersPageData(
  filters: CustomerPageFilters,
): Promise<CustomersPageData> {
  const params = new URLSearchParams({
    searchTerm: filters.searchTerm,
    page: String(filters.page),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const res = await fetch(`${API_BASE_URL}/analytics/customers?${params.toString()}`);
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || "Falha ao buscar dados dos clientes",
    );
  }
  return res.json();
}
// --- FIM: NOVA FUNÇÃO PARA CLIENTES ---

export async function fetchOperationalData(
  filters: Filters,
): Promise<OperationalData> {
  const res = await fetch(`${API_BASE_URL}/analytics/operational`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filters),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || "Falha ao buscar dados operacionais",
    );
  }
  return res.json();
}
// --- FIM: NOVA FUNÇÃO PARA PÁGINA OPERACIONAL ---