import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Store, Filter } from "lucide-react";
import { FilterOption } from "@/types/api"; // Importar nosso tipo

interface FilterBarProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
  selectedStore: string;
  onStoreChange: (store: string) => void;
  onClearFilters: () => void; // Adicionado
  stores?: FilterOption[];     // Adicionado
  channels?: FilterOption[];   // Adicionado
  isLoading?: boolean;       // Adicionado
}

export const FilterBar = ({
  selectedPeriod,
  onPeriodChange,
  selectedChannel,
  onChannelChange,
  selectedStore,
  onStoreChange,
  onClearFilters,
  stores = [],
  channels = [],
  isLoading = false,
}: FilterBarProps) => {
  return (
    <div className="flex flex-wrap gap-3 items-center p-4 bg-card rounded-xl border shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        Filtros:
      </div>

      {/* Seletor de Período (sem alteração) */}
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-[180px]">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7days">Últimos 7 dias</SelectItem>
          <SelectItem value="30days">Últimos 30 dias</SelectItem>
          <SelectItem value="90days">Últimos 90 dias</SelectItem>
          <SelectItem value="year">Último ano</SelectItem>
        </SelectContent>
      </Select>

      {/* Seletor de Canal (DINÂMICO) */}
      <Select
        value={selectedChannel}
        onValueChange={onChannelChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Carregando canais..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os canais</SelectItem>
          {channels.map((channel) => (
            // O backend espera o NOME do canal, não o ID
            <SelectItem key={channel.id} value={channel.name}>
              {channel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Seletor de Loja (DINÂMICO) */}
      <Select
        value={selectedStore}
        onValueChange={onStoreChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          <Store className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Carregando lojas..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as lojas</SelectItem>
          {stores.map((store) => (
            // O backend espera o NOME da loja
            <SelectItem key={store.id} value={store.name}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Botão de Limpar */}
      <Button
        variant="outline"
        size="sm"
        className="ml-auto"
        onClick={onClearFilters}
      >
        Limpar filtros
      </Button>
    </div>
  );
};