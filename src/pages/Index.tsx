// src/pages/Index.tsx (Corrigido)

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/MetricCard";
import { SalesChart } from "@/components/SalesChart";
import { ChannelChart } from "@/components/ChannelChart";
import { TopProducts } from "@/components/TopProducts";
import { FilterBar } from "@/components/FilterBar";
import { Skeleton } from "@/components/ui/skeleton"; // Usaremos para loading
import { fetchDashboardData, fetchFilterMetadata } from "@/lib/api";
import { Filters } from "@/types/api";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  BarChart3,
  AlertCircle, // Para erros
} from "lucide-react";

// Valores Padrão para os filtros
const DEFAULT_PERIOD = "7days";
const DEFAULT_CHANNEL = "all";
const DEFAULT_STORE = "all";

const Index = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);
  const [selectedChannel, setSelectedChannel] = useState(DEFAULT_CHANNEL);
  const [selectedStore, setSelectedStore] = useState(DEFAULT_STORE);

  // 1. Query para buscar os filtros (lojas e canais)
  // Esta query roda apenas uma vez
  const { data: filterData, isLoading: isLoadingFilters } = useQuery({
    queryKey: ["filters"],
    queryFn: fetchFilterMetadata,
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });

  // 2. Query para buscar os dados do dashboard
  // O `queryKey` inclui os filtros. Quando os filtros mudam,
  // o react-query busca os dados novamente.
  const filters: Filters = {
    period: selectedPeriod,
    channel: selectedChannel,
    store: selectedStore,
  };

  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    error,
  } = useQuery({
    queryKey: ["dashboard", filters],
    queryFn: () => fetchDashboardData(filters),
    // AQUI ESTÁ A CORREÇÃO:
    // `keepPreviousData: true` (v4) foi renomeado para `placeholderData` (v5)
    placeholderData: (previousData) => previousData,
  });

  // Função para o botão "Limpar filtros"
  const handleClearFilters = () => {
    setSelectedPeriod(DEFAULT_PERIOD);
    setSelectedChannel(DEFAULT_CHANNEL);
    setSelectedStore(DEFAULT_STORE);
  };

  // Helper para formatar moeda
  // **** INÍCIO DA CORREÇÃO ****
  // Ajustamos a função para aceitar 'string' e garantir a conversão para número
  const formatCurrency = (value?: number | string) =>
    (parseFloat(String(value) || "0")).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  // **** FIM DA CORREÇÃO ****

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header (sem alteração) */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Restaurante Nola
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Última atualização</p>
                <p className="text-sm font-medium">Agora</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <FilterBar
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            selectedChannel={selectedChannel}
            onChannelChange={setSelectedChannel}
            selectedStore={selectedStore}
            onStoreChange={setSelectedStore}
            onClearFilters={handleClearFilters}
            stores={filterData?.stores}
            channels={filterData?.channels}
            isLoading={isLoadingFilters}
          />

          {/* Tratamento de Erro */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h4 className="font-semibold">Erro ao carregar dados</h4>
                <p className="text-sm">{(error as Error).message}</p>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingDashboard ? (
              <>
                <Skeleton className="h-[126px] w-full" />
                <Skeleton className="h-[126px] w-full" />
                <Skeleton className="h-[126px] w-full" />
                <Skeleton className="h-[126px] w-full" />
              </>
            ) : (
              <>
                <MetricCard
                  title="Faturamento Total"
                  value={formatCurrency(dashboardData?.kpis.faturamentoTotal)}
                  // change="+14.2% vs semana anterior" (O backend não calcula isso ainda)
                  changeType="positive"
                  icon={DollarSign}
                  iconColor="primary"
                />
                <MetricCard
                  title="Total de Pedidos"
                  value={dashboardData?.kpis.totalPedidos.toString() || "0"}
                  // change="+8.5% vs semana anterior"
                  changeType="positive"
                  icon={ShoppingCart}
                  iconColor="secondary"
                />
                <MetricCard
                  title="Ticket Médio"
                  value={formatCurrency(dashboardData?.kpis.ticketMedio)}
                  // change="+5.2% vs semana anterior"
                  changeType="positive"
                  icon={TrendingUp}
                  iconColor="accent"
                />
                <MetricCard
                  title="Tempo Médio"
                  value={`${dashboardData?.kpis.tempoMedio || 0} min`}
                  // change="-2 min vs semana anterior"
                  changeType="positive"
                  icon={Clock}
                  iconColor="secondary"
                />
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoadingDashboard ? (
              <>
                <Skeleton className="h-[372px] w-full" />
                <Skeleton className="h-[372px] w-full" />
              </>
            ) : (
              <>
                <SalesChart data={dashboardData?.salesChart || []} />
                <ChannelChart data={dashboardData?.channelChart || []} />
              </>
            )}
          </div>

          {/* Top Products */}
          {isLoadingDashboard ? (
            <Skeleton className="h-[432px] w-full" />
          ) : (
            <TopProducts products={dashboardData?.topProducts || []} />
          )}

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoadingDashboard ? (
              <>
                <Skeleton className="h-[148px] w-full" />
                <Skeleton className="h-[148px] w-full" />
                <Skeleton className="h-[148px] w-full" />
              </>
            ) : (
              <>
                <div className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Horário de Pico</h3>
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {dashboardData?.quickInsights.horarioPico.hora}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData?.quickInsights.horarioPico.pedidos}
                  </p>
                </div>

                <div className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-secondary" />
                    </div>
                    <h3 className="font-semibold">Melhor Dia</h3>
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {dashboardData?.quickInsights.melhorDia.dia}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData?.quickInsights.melhorDia.vendas} (
                    {dashboardData?.quickInsights.melhorDia.pedidos})
                  </p>
                </div>

                <div className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold">Canal Destaque</h3>
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {dashboardData?.quickInsights.canalDestaque.canal}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData?.quickInsights.canalDestaque.vendas}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;