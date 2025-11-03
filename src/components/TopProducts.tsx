import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Product {
  name: string;
  category: string;
  sales: number;
  quantity: number;
  change: number;
}

interface TopProductsProps {
  products: Product[];
}

export const TopProducts = ({ products }: TopProductsProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top 10 Produtos</h3>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.name}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {product.quantity} vendidos
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                R$ {product.sales.toLocaleString("pt-BR")}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {product.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-secondary" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span
                  className={`text-xs font-medium ${
                    product.change >= 0 ? "text-secondary" : "text-destructive"
                  }`}
                >
                  {product.change > 0 ? "+" : ""}
                  {product.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
