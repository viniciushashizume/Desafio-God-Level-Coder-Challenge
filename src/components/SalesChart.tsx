import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SalesChartProps {
  data: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export const SalesChart = ({ data }: SalesChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Performance de Vendas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="Faturamento (R$)"
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            name="Pedidos"
            dot={{ fill: "hsl(var(--secondary))", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
