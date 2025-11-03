import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Package, DollarSign, TrendingUp, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProductsPageData } from "@/lib/api";
import { ProductSortKeys, SortOrder } from "@/types/api"; // <-- Importa os novos tipos
import { Button } from "@/components/ui/button"; // <-- Importa o Button

// Função para formatar moeda
const formatCurrency = (value: number) =>
  (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  // --- Estado para controlar a ordenação (inicialmente por ID) ---
  const [sort, setSort] = useState<{ sortBy: ProductSortKeys; sortOrder: SortOrder }>({
    sortBy: 'id',
    sortOrder: 'asc',
  });

  const { data, isLoading, error } = useQuery({
    // --- Adiciona 'sort' à queryKey para o react-query refazer a busca ---
    queryKey: ["products", { searchTerm, page, sort }],
    queryFn: () => fetchProductsPageData({ searchTerm, page, ...sort }),
    placeholderData: (previousData) => previousData, // Mantém dados antigos enquanto carrega novos
  });

  const products = data?.products || [];
  const totalProducts = data?.totalProducts || 0;
  const totalRevenue = data?.totalRevenue || 0;
  const avgPrice = data?.avgPrice || 0;
  const totalPages = data?.totalPages || 1;

  // --- Handler para mudar a ordenação ---
  const handleSort = (key: ProductSortKeys) => {
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

  // --- Helper para mostrar o ícone de ordenação correto ---
  const getSortIcon = (key: ProductSortKeys) => {
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
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <p className="text-muted-foreground mt-2">
          Análise detalhada do cardápio e performance por produto
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ativos no cardápio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Vendas dos produtos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(avgPrice)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por item vendido
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabela de Produtos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Produtos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos ou categorias..."
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
            <div className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Erro ao carregar produtos: {(error as Error).message}</span>
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('id')} className="px-0 hover:bg-transparent">
                    #
                    {getSortIcon('id')}
                  </Button>
                </TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('price')} className="px-0 hover:bg-transparent">
                    Preço Base
                    {getSortIcon('price')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('sales')} className="px-0 hover:bg-transparent">
                    Vendas (R$)
                    {getSortIcon('sales')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('quantity')} className="px-0 hover:bg-transparent">
                    Qtd. Vendida
                    {getSortIcon('quantity')}
                  </Button>
                </TableHead>
                <TableHead>Opções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-muted-foreground">#{product.id}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(product.sales)}
                    </TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      {product.options_count > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          {product.options_count} {product.options_count > 1 ? 'opções' : 'opção'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    {searchTerm ? "Nenhum produto encontrado." : "Nenhum produto para exibir."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}