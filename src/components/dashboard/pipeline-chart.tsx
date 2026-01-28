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
import { useMemo } from 'react';

const chartConfig = {
  deals: {
    label: 'Deals',
    color: 'hsl(var(--chart-4))',
  },
};

interface PipelineChartProps {
  deals?: any[];
}

export function PipelineChart({ deals = [] }: PipelineChartProps) {
  const chartData = useMemo(() => {
    const stages = ['Prospect', 'Qualifying', 'Proposal', 'Negotiation', 'Closed Won'];
    const stageData = stages.map(stage => ({ stage, deals: 0 }));

    // Count deals by stage
    deals.forEach((deal: any) => {
      const stageIndex = stages.indexOf(deal.stage || 'Prospect');
      if (stageIndex !== -1) {
        stageData[stageIndex].deals += 1;
      }
    });

    return stageData;
  }, [deals]);

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
