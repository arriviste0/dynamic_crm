'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Handshake, Activity, Target, TrendingUp, Building2 } from 'lucide-react';
import { AnimatedCounter } from './animated-counter';
import { cn } from '@/lib/utils';

type KpiCardProps = {
  title: string;
  value: number | string;
  change: string;
  icon: 'dollar' | 'handshake' | 'ticket' | 'target' | 'building';
  isPositive?: boolean;
};

const iconMap = {
  dollar: <DollarSign className="h-4 w-4 text-muted-foreground" />,
  handshake: <Handshake className="h-4 w-4 text-muted-foreground" />,
  ticket: <Activity className="h-4 w-4 text-muted-foreground" />,
  target: <Target className="h-4 w-4 text-muted-foreground" />,
  building: <Building2 className="h-4 w-4 text-muted-foreground" />,
};

export function KpiCard({ title, value, change, icon, isPositive = true }: KpiCardProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value;
  const isNumeric = !isNaN(numericValue);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="transition-transform duration-300 hover:scale-110">
          {iconMap[icon]}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {isNumeric && title.includes('Revenue') ? (
            <>
              $
              <AnimatedCounter
                end={numericValue}
                duration={2000}
                decimals={2}
              />
            </>
          ) : isNumeric ? (
            <AnimatedCounter
              end={numericValue}
              duration={2000}
              decimals={0}
            />
          ) : (
            value
          )}
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className={cn(
            "h-3 w-3 transition-all duration-300",
            isPositive ? "text-green-600" : "text-red-600"
          )} />
          <p className={cn(
            "text-xs transition-all duration-300",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {change}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
