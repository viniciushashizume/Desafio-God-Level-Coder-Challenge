import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Store, CreditCard, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { FilterBar } from "@/components/FilterBar";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchFilterMetadata, fetchOperationalData } from "@/lib/api";
import { Filters } from "@/types/api";

// Valores Padrão para os filtros
const DEFAULT_PERIOD = "7days";
const DEFAULT_CHANNEL = "all";
const DEFAULT_STORE = "all";

// Função para formatar moeda
const formatCurrency = (value: number) =>
  (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function Operational() {
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);
  const [selectedChannel, setSelectedChannel] = useState(DEFAULT_CHANNEL);
  const [selectedStore, setSelectedStore] = useState(DEFAULT_STORE);
  const [storePage, setStorePage] = useState(1);
  const storesPerPage = 5;

  // 1. Query para buscar os filtros (lojas e canais)
  const { data: filterData, isLoading: isLoadingFilters } = useQuery({
    queryKey: ["filters"],
    queryFn: fetchFilterMetadata,
    staleTime: 1000 * 60 * 5,
  });

  // 2. Query para buscar os dados operacionais
  const filters: Filters = {
    period: selectedPeriod,
    channel: selectedChannel,
    store: selectedStore,
  };

  const {
    data,
    isLoading: isLoadingOperational,
    error,
  } = useQuery({
    queryKey: ["operational", filters],
    queryFn: () => fetchOperationalData(filters),
    placeholderData: (previousData) => previousData,
  });

  // Função para o botão "Limpar filtros"
  const handleClearFilters = () => {
    setSelectedPeriod(DEFAULT_PERIOD);
    setSelectedChannel(DEFAULT_CHANNEL);
    setSelectedStore(DEFAULT_STORE);
    setStorePage(1);
  };

  const isLoading = isLoadingFilters || isLoadingOperational;

  // Extrai os dados (com valores padrão)
  const kpis = data?.kpis || { totalOrders: 0, totalRevenue: 0, avgTime: 0 };
  const channelData = data?.channelData || [];
  const storeData = data?.storeData || [];
  const paymentMethods = data?.paymentMethods || [];
  
  // Calcula o total de transações de pagamento para o percentual
  const totalPaymentCount = paymentMethods.reduce((sum, p) => sum + p.count, 0);
  
  // Paginação de lojas
  const totalStorePages = Math.ceil(storeData.length / storesPerPage);
  const paginatedStores = storeData.slice(
    (storePage - 1) * storesPerPage,
    storePage * storesPerPage
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operacional</h1>
        <p className="text-muted-foreground mt-2">
          Performance operacional, canais e métodos de pagamento
        </p>
      </div>

      {/* Barra de Filtros */}
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

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading && !data ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Todos os canais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(kpis.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Receita gerada
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio Geral</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.avgTime} min</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Preparo + Entrega
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabelas de Lojas e Canais */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !data ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead>Faturamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channelData.map((channel) => (
                    <TableRow key={channel.name}>
                      <TableCell className="font-medium">{channel.name}</TableCell>
                      <TableCell>{channel.orders}</TableCell>
                      <TableCell>
                        {formatCurrency(channel.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por Loja</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !data ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loja</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead>Faturamento</TableHead>
                      <TableHead>Tempo Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell>{store.orders}</TableCell>
                        <TableCell>
                          {formatCurrency(store.revenue)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{store.avgTime} min</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Paginação */}
                {totalStorePages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Página {storePage} de {totalStorePages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStorePage(p => Math.max(1, p - 1))}
                        disabled={storePage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStorePage(p => Math.min(totalStorePages, p + 1))}
                        disabled={storePage === totalStorePages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métodos de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !data ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={paymentMethods}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="method" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="hsl(var(--primary))" name="Total (R$)" />
                </BarChart>
              </ResponsiveContainer>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Método</TableHead>
                    <TableHead>Transações</TableHead>
                    <TableHead>Percentual</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.map((payment) => (
                    <TableRow key={payment.method}>
                      <TableCell className="font-medium">{payment.method}</TableCell>
                      <TableCell>{payment.count}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {totalPaymentCount > 0
                            ? ((payment.count / totalPaymentCount) * 100).toFixed(1)
                            : 0}
                          %
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payment.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}