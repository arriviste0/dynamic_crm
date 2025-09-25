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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartData = [
  { stage: 'Prospect', deals: 0 },
  { stage: 'Qualifying', deals: 0 },
  { stage: 'Proposal', deals: 0 },
  { stage: 'Negotiation', deals: 0 },
  { stage: 'Closed Won', deals: 0 },
];

const chartConfig = {
  deals: {
    label: 'Deals',
    color: 'hsl(var(--chart-4))',
  },
};

export function PipelineChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline by Stage</CardTitle>
        <CardDescription>Current open deals</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={chartData} layout="vertical" accessibilityLayer>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="stage"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={80}
            />
            <XAxis dataKey="deals" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="deals" layout="vertical" fill="hsl(var(--chart-4))" radius={4}>
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
