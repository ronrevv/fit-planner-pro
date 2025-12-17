import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertInjuryLogSchema, type InjuryLog, type InsertInjuryLog } from "@shared/schema";

interface InjuryLogListProps {
  clientId: string;
}

export function InjuryLogList({ clientId }: InjuryLogListProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: logs = [], isLoading } = useQuery<InjuryLog[]>({
    queryKey: ['/api/clients', clientId, 'injuries'],
  });

  const form = useForm<InsertInjuryLog>({
    resolver: zodResolver(insertInjuryLogSchema),
    defaultValues: {
      clientId,
      date: new Date().toISOString().split('T')[0],
      title: "",
      description: "",
      status: "Active",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertInjuryLog) => {
      const response = await apiRequest('POST', `/api/clients/${clientId}/injuries`, data);
      try {
        return await response.json();
      } catch (e) {
        throw new Error("Failed to parse response");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'injuries'] });
      toast({ title: "Injury logged successfully" });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Injury log error:", error);
      toast({ title: "Failed to log injury", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/injuries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'injuries'] });
      toast({ title: "Injury log deleted" });
    },
  });

  const onSubmit = (data: InsertInjuryLog) => {
    createMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "destructive";
      case "Recovering": return "warning"; // Note: standard badge doesn't have warning, might need default or custom class
      case "Recovered": return "secondary"; // Using secondary for green-ish semantics usually
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "Recovering": return <Circle className="h-4 w-4 text-yellow-500" />;
      case "Recovered": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return <div>Loading injuries...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Injury History</h3>
          <p className="text-sm text-muted-foreground">Track injuries and recovery progress</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Log Injury
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Injury</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Injury Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sprained Ankle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Recovering">Recovering</SelectItem>
                          <SelectItem value="Recovered">Recovered</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Details about the injury..." {...field} />
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
              No injuries logged yet.
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{log.title}</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getStatusIcon(log.status)}
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reported on {format(new Date(log.date), 'PPP')}
                    </p>
                    <p className="text-sm mt-2">{log.description}</p>
                    {log.recoveryDate && (
                      <p className="text-xs text-green-600 mt-1">
                        Recovered: {format(new Date(log.recoveryDate), 'PPP')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(log.id)}
                    className="text-destructive hover:bg-destructive/10"
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
