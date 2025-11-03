import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: "primary" | "secondary" | "accent";
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "primary",
}: MetricCardProps) => {
  const iconColorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  };

  const changeColorClasses = {
    positive: "text-secondary",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0 overflow-hidden">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold tracking-tight break-words">{value}</p>
          {change && (
            <p className={cn("text-sm font-medium", changeColorClasses[changeType])}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl shrink-0 flex items-center justify-center w-12 h-12", iconColorClasses[iconColor])}>
          <Icon className="h-6 w-6 shrink-0" />
        </div>
      </div>
    </Card>
  );
};
