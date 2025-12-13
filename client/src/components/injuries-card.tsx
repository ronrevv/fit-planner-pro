import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Injury, InsertInjury } from "@shared/schema";

export function InjuriesCard({ clientId }: { clientId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newInjury, setNewInjury] = useState<Partial<InsertInjury>>({
    status: "active",
    type: "",
    description: "",
  });

  const { data: injuries = [] } = useQuery<Injury[]>({
    queryKey: ['/api/clients', clientId, 'injuries'],
    enabled: !!clientId,
  });

  const addInjuryMutation = useMutation({
    mutationFn: async (injury: InsertInjury) => {
      const res = await apiRequest('POST', `/api/clients/${clientId}/injuries`, injury);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'injuries'] });
      toast({ title: "Injury logged" });
      setOpen(false);
      setNewInjury({ status: "active", type: "", description: "" });
    },
  });

  const updateInjuryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Injury['status'] }) => {
      await apiRequest('PATCH', `/api/injuries/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'injuries'] });
      toast({ title: "Status updated" });
    },
  });

  const handleSave = () => {
    if (!newInjury.type) return;
    addInjuryMutation.mutate({
      ...newInjury,
      clientId,
      date: Date.now(),
    } as InsertInjury);
  };

  const activeInjuries = injuries.filter(i => i.status === "active");
  const pastInjuries = injuries.filter(i => i.status !== "active");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Injuries & Limitations</CardTitle>
          <CardDescription>Track active and past injuries</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Injury</DialogTitle>
              <DialogDescription>
                Record a new injury or limitation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Type / Area</Label>
                <Input
                  value={newInjury.type}
                  onChange={e => setNewInjury({...newInjury, type: e.target.value})}
                  placeholder="e.g. Right Knee, Lower Back"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input
                  value={newInjury.description}
                  onChange={e => setNewInjury({...newInjury, description: e.target.value})}
                  placeholder="Pain when squatting..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={newInjury.status}
                  onValueChange={(v: any) => setNewInjury({...newInjury, status: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="recovering">Recovering</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={!newInjury.type}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {activeInjuries.length === 0 && pastInjuries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No injuries recorded.</p>
        ) : (
          <div className="space-y-4">
            {activeInjuries.map(injury => (
              <div key={injury.id} className="flex items-start justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">{injury.type}</p>
                    {injury.description && <p className="text-sm text-red-700">{injury.description}</p>}
                    <Badge variant="outline" className="mt-1 bg-white text-red-700 border-red-200">Active</Badge>
                  </div>
                </div>
                <Select
                  defaultValue={injury.status}
                  onValueChange={(v: any) => updateInjuryMutation.mutate({ id: injury.id, status: v })}
                >
                  <SelectTrigger className="w-[110px] h-8 text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="recovering">Recovering</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}

            {pastInjuries.length > 0 && (
              <>
                <p className="text-xs font-medium text-muted-foreground uppercase mt-4">Past Injuries</p>
                {pastInjuries.map(injury => (
                  <div key={injury.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20">
                    <div>
                      <p className="text-sm font-medium">{injury.type}</p>
                      <span className="text-xs text-muted-foreground capitalize">{injury.status}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => updateInjuryMutation.mutate({ id: injury.id, status: 'active' })}
                    >
                      Reactivate
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
