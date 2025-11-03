import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Users,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCustomersPageData } from "@/lib/api";
import { CustomerSortKeys, SortOrder } from "@/types/api";
import { Button } from "@/components/ui/button";

// Função para formatar moeda
const formatCurrency = (value: number) =>
  (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ sortBy: CustomerSortKeys; sortOrder: SortOrder }>({
    sortBy: 'orderCount',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["customers", { searchTerm, page, sort }],
    queryFn: () => fetchCustomersPageData({ searchTerm, page, ...sort }),
    placeholderData: (previousData) => previousData,
  });

  const customers = data?.customers || [];
  const totalCustomers = data?.totalCustomers || 0;
  const totalRevenue = data?.totalRevenue || 0;
  const avgOverallTicket = data?.avgOverallTicket || 0;
  const totalPages = data?.totalPages || 1;

  // Handler para mudar a ordenação
  const handleSort = (key: CustomerSortKeys) => {
    setSort((prevSort) => {
      const newSortOrder =
        prevSort.sortBy === key && prevSort.sortOrder === 'desc' ? 'asc' : 'desc';
      return {
        sortBy: key,
        sortOrder: newSortOrder,
      };
    });
    setPage(1); // Reseta para a página 1 ao ordenar
  };

  // Helper para mostrar o ícone de ordenação correto
  const getSortIcon = (key: CustomerSortKeys) => {
    if (sort.sortBy !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-2 opacity-30" />;
    }
    return sort.sortOrder === 'desc' ? (
      <ArrowDown className="h-4 w-4 ml-2" />
    ) : (
      <ArrowUp className="h-4 w-4 ml-2" />
    );
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground mt-2">
          Gestão e análise da base de clientes
        </p>
      </div>

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
                <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Base ativa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Clientes</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gerado por clientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio (Geral)</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(avgOverallTicket)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por pedido de cliente
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reseta para a página 1 ao buscar
                }}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>Erro ao carregar clientes: {(error as Error).message}</span>
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('orderCount')} className="px-0 hover:bg-transparent">
                    Pedidos
                    {getSortIcon('orderCount')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('totalSpent')} className="px-0 hover:bg-transparent">
                    Total Gasto
                    {getSortIcon('totalSpent')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('avgTicket')} className="px-0 hover:bg-transparent">
                    Ticket Médio
                    {getSortIcon('avgTicket')}
                  </Button>
                </TableHead>
                <TableHead>Último Pedido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{customer.email || 'N/A'}</div>
                        <div className="text-muted-foreground">{customer.phone || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.orderCount}</TableCell>
                    <TableCell>
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(customer.avgTicket)}
                    </TableCell>
                    <TableCell>
                      {customer.lastOrder
                        ? new Date(customer.lastOrder).toLocaleDateString("pt-BR")
                        : "Nenhum pedido"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {searchTerm ? "Nenhum cliente encontrado." : "Nenhum cliente para exibir."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginação Simples */}
          <div className="flex justify-end items-center gap-4 pt-4">
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}