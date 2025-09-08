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
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';

const chartDataDeals = [{ name: 'Deals', value: 78, fill: 'hsl(var(--chart-2))' }];
const chartDataConversion = [{ name: 'Conversion', value: 25.4, fill: 'hsl(var(--chart-3))' }];

export function GaugeChartWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly Goals</CardTitle>
        <CardDescription>Progress towards Q2 targets.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-around items-center h-[200px]">
        <div className="flex flex-col items-center">
          <ChartContainer config={{}} className="h-[120px] w-[120px]">
            <RadialBarChart
              data={chartDataDeals}
              startAngle={-270}
              endAngle={0}
              innerRadius={80}
              outerRadius={100}
              barSize={12}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                background={{ fill: 'hsl(var(--muted))' }}
                dataKey="value"
                cornerRadius={10}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            </RadialBarChart>
          </ChartContainer>
          <p className="text-center text-sm font-medium mt-2">Deals Won</p>
          <p className="text-center text-xl font-bold">78/100</p>
        </div>
        <div className="flex flex-col items-center">
          <ChartContainer config={{}} className="h-[120px] w-[120px]">
            <RadialBarChart
              data={chartDataConversion}
              startAngle={-270}
              endAngle={0}
              innerRadius={80}
              outerRadius={100}
              barSize={12}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                background={{ fill: 'hsl(var(--muted))' }}
                dataKey="value"
                cornerRadius={10}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            </RadialBarChart>
          </ChartContainer>
          <p className="text-center text-sm font-medium mt-2">Conversion Rate</p>
          <p className="text-center text-xl font-bold">25.4%</p>
        </div>
      </CardContent>
    </Card>
  );
}
