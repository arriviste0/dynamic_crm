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

const chartData = [
  { month: 'January', income: 0, outcome: 0 },
  { month: 'February', income: 0, outcome: 0 },
  { month: 'March', income: 0, outcome: 0 },
  { month: 'April', income: 0, outcome: 0 },
  { month: 'May', income: 0, outcome: 0 },
  { month: 'June', income: 0, outcome: 0 },
];

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

export function CashFlowChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
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
