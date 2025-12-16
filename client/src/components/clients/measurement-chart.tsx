import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MeasurementLog } from "@shared/schema";

interface MeasurementChartProps {
  logs: MeasurementLog[];
}

export function MeasurementChart({ logs }: MeasurementChartProps) {
  // Sort logs by date ascending for the chart
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Format data for Recharts
  const data = sortedLogs.map(log => ({
    date: format(new Date(log.date), 'MMM d'),
    weight: log.weight,
    waist: log.waist,
    // Add more metrics if needed
  }));

  if (logs.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center border rounded-lg bg-muted/10 text-muted-foreground text-sm">
        No measurement data available for charts
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            labelStyle={{ color: '#64748b' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            activeDot={{ r: 4 }}
            name="Weight (kg)"
          />
          <Line
            type="monotone"
            dataKey="waist"
            stroke="#10b981"
            strokeWidth={2}
            activeDot={{ r: 4 }}
            name="Waist (cm)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
