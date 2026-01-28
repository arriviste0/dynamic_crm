'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { useMemo } from 'react';

const chartConfig = {
  income: {
    label: 'Income',
    color: 'hsl(var(--chart-1))',
  },
  outcome: {
    label: 'Outcome',
    color: 'hsl(var(--chart-2))',
  },
};

interface CashFlowChartProps {
  invoices?: any[];
}

export function CashFlowChart({ invoices = [] }: CashFlowChartProps) {
  const chartData = useMemo(() => {
    const monthData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(new Date().getFullYear(), i, 1).toLocaleString('default', { month: 'long' }),
      income: 0,
      outcome: 0,
    }));

    // Process invoices to calculate monthly income
    invoices.forEach((invoice: any) => {
      if (invoice.createdAt) {
        const date = new Date(invoice.createdAt);
        const monthIndex = date.getMonth();
        if (invoice.status === 'Paid') {
          monthData[monthIndex].income += invoice.totalAmount || 0;
        } else if (invoice.status === 'Draft') {
          monthData[monthIndex].outcome += invoice.totalAmount || 0;
        }
      }
    });

    return monthData;
  }, [invoices]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow</CardTitle>
        <CardDescription>Monthly Income vs Outcome</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={value => value.slice(0, 3)}
            />
             <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="income"
              type="monotone"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="outcome"
              type="monotone"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
