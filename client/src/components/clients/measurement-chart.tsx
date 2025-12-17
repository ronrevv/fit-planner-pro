"use client";

import * as React from "react";
import { format } from "date-fns";
import type { MeasurementLog } from "@shared/schema";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export function MeasurementChart({
  logs,
}: {
  logs: MeasurementLog[];
}) {
  const data = (logs || [])
    .filter((l) => typeof l.weight === "number" && l.weight !== undefined)
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    .map((l) => ({
      date: format(new Date(l.date), "MMM d"),
      weight: l.weight as number,
    }));

  if (!data.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No weight measurements to display.
      </div>
    );
  }

  const config = {
    weight: {
      label: "Weight (kg)",
      color: "hsl(var(--primary))",
    },
  } as const;

  return (
    <ChartContainer config={config} className="w-full">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" dot={false} />
      </LineChart>
    </ChartContainer>
  );
}