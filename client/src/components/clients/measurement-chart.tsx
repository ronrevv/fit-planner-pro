"use client";

import * as React from "react";
import { format } from "date-fns";
import type { MeasurementLog } from "@shared/schema";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const MEASUREMENT_TYPES = [
  { key: "weight", label: "Weight", color: "hsl(var(--primary))" },
  { key: "chest", label: "Chest (cm)", color: "#3b82f6" },
  { key: "waist", label: "Waist (cm)", color: "#22c55e" },
  { key: "hips", label: "Hips (cm)", color: "#f97316" },
  { key: "arms", label: "Arms (cm)", color: "#a855f7" },
  { key: "thighs", label: "Thighs (cm)", color: "#ef4444" },
] as const;

export function MeasurementChart({
  logs,
}: {
  logs: MeasurementLog[];
}) {
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(["weight"]);

  const data = React.useMemo(() => {
    return (logs || [])
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
      .map((l) => ({
        date: format(new Date(l.date), "MMM d"),
        weight: l.weight,
        chest: l.chest,
        waist: l.waist,
        hips: l.hips,
        arms: l.arms,
        thighs: l.thighs,
      }));
  }, [logs]);

  if (!data.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No measurements to display.
      </div>
    );
  }

  const config = MEASUREMENT_TYPES.reduce((acc, type) => {
    acc[type.key] = {
      label: type.label,
      color: type.color,
    };
    return acc;
  }, {} as any);

  const toggleType = (key: string) => {
    setSelectedTypes(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-card/50">
        {MEASUREMENT_TYPES.map((type) => (
          <div key={type.key} className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${type.key}`}
              checked={selectedTypes.includes(type.key)}
              onCheckedChange={() => toggleType(type.key)}
            />
            <Label
              htmlFor={`checkbox-${type.key}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              style={{ color: type.color }}
            >
              {type.label}
            </Label>
          </div>
        ))}
      </div>

      <ChartContainer config={config} className="w-full h-[400px]">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {MEASUREMENT_TYPES.map((type) => (
            selectedTypes.includes(type.key) && (
              <Line
                key={type.key}
                type="monotone"
                dataKey={type.key}
                stroke={`var(--color-${type.key})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
