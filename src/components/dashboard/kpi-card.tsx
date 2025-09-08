import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Handshake, Activity, Target } from 'lucide-react';

type KpiCardProps = {
  title: string;
  value: string;
  change: string;
  icon: 'dollar' | 'handshake' | 'ticket' | 'target';
};

const iconMap = {
  dollar: <DollarSign className="h-4 w-4 text-muted-foreground" />,
  handshake: <Handshake className="h-4 w-4 text-muted-foreground" />,
  ticket: <Activity className="h-4 w-4 text-muted-foreground" />,
  target: <Target className="h-4 w-4 text-muted-foreground" />,
};

export function KpiCard({ title, value, change, icon }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {iconMap[icon]}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}
