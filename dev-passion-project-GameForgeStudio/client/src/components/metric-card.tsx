import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  iconColor: string;
  value: string | number;
  label: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export function MetricCard({ 
  icon: Icon, 
  iconColor, 
  value, 
  label, 
  change, 
  changeType = 'positive' 
}: MetricCardProps) {
  return (
    <Card className="metric-card p-6 rounded-xl" data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6" data-testid="metric-icon" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1" data-testid={`text-${label.toLowerCase().replace(/\s+/g, '-')}-value`}>
          {value}
        </h3>
        <p className="text-muted-foreground text-sm mb-2">{label}</p>
        {change && (
          <span 
            className={`text-xs font-medium ${
              changeType === 'positive' 
                ? 'text-green-400' 
                : changeType === 'negative' 
                ? 'text-red-400' 
                : 'text-muted-foreground'
            }`}
            data-testid={`text-${label.toLowerCase().replace(/\s+/g, '-')}-change`}
          >
            {change}
          </span>
        )}
      </div>
    </Card>
  );
}
