import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Scale, Ruler } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertMeasurementLogSchema, type MeasurementLog, type InsertMeasurementLog } from "@shared/schema";

interface MeasurementLogListProps {
  clientId: string;
}

export function MeasurementLogList({ clientId }: MeasurementLogListProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: logs = [], isLoading } = useQuery<MeasurementLog[]>({
    queryKey: ['/api/clients', clientId, 'measurements'],
  });

  const form = useForm<InsertMeasurementLog>({
    resolver: zodResolver(insertMeasurementLogSchema),
    defaultValues: {
      clientId,
      date: new Date().toISOString().split('T')[0],
      weight: undefined,
      height: undefined,
      chest: undefined,
      waist: undefined,
      hips: undefined,
      arms: undefined,
      thighs: undefined,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertMeasurementLog) => {
      // Clean up undefined values and convert strings to numbers if needed (though zod handles checks)
      const payload = {
          ...data,
          // ensure numbers are actually numbers or undefined
          weight: data.weight ? Number(data.weight) : undefined,
          height: data.height ? Number(data.height) : undefined,
          chest: data.chest ? Number(data.chest) : undefined,
          waist: data.waist ? Number(data.waist) : undefined,
          hips: data.hips ? Number(data.hips) : undefined,
          arms: data.arms ? Number(data.arms) : undefined,
          thighs: data.thighs ? Number(data.thighs) : undefined,
      };

      const response = await apiRequest('POST', `/api/clients/${clientId}/measurements`, payload);
      try {
        return await response.json();
      } catch (e) {
        throw new Error("Failed to parse response");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'measurements'] });
      toast({ title: "Measurement logged successfully" });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Measurement log error:", error);
      toast({ title: "Failed to log measurement", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/measurements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'measurements'] });
      toast({ title: "Measurement log deleted" });
    },
  });

  const onSubmit = (data: InsertMeasurementLog) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return <div>Loading measurements...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Measurement History</h3>
          <p className="text-sm text-muted-foreground">Track body metrics over time</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Log Measurements
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log New Measurements</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(e.target.valueAsNumber || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(e.target.valueAsNumber || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chest (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(e.target.valueAsNumber || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="waist"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waist (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(e.target.valueAsNumber || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hips"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hips (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(e.target.valueAsNumber || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arms (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(e.target.valueAsNumber || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="thighs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thighs (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(e.target.valueAsNumber || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes & Observations</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Progress notes, energy levels, sleep quality..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Saving..." : "Save Log"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No measurements logged yet.
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{format(new Date(log.date), 'PPP')}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      {log.weight && (
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.weight} kg</span>
                        </div>
                      )}
                      {log.height && (
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.height} cm</span>
                        </div>
                      )}
                      {/* Body Parts */}
                      {log.chest && <div className="text-muted-foreground">Chest: <span className="text-foreground font-medium">{log.chest}cm</span></div>}
                      {log.waist && <div className="text-muted-foreground">Waist: <span className="text-foreground font-medium">{log.waist}cm</span></div>}
                      {log.hips && <div className="text-muted-foreground">Hips: <span className="text-foreground font-medium">{log.hips}cm</span></div>}
                      {log.arms && <div className="text-muted-foreground">Arms: <span className="text-foreground font-medium">{log.arms}cm</span></div>}
                      {log.thighs && <div className="text-muted-foreground">Thighs: <span className="text-foreground font-medium">{log.thighs}cm</span></div>}
                    </div>

                    {log.notes && (
                      <div className="bg-muted/50 p-3 rounded-md text-sm mt-2">
                        <span className="font-medium block mb-1">Notes:</span>
                        {log.notes}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(log.id)}
                    className="text-destructive hover:bg-destructive/10 ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
