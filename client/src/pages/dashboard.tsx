import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/hooks/use-app-context";
import { Building2, UserCheck, Plus, Settings2, LogOut } from "lucide-react";
import type { Gym, Trainer } from "@shared/schema";
import { useState } from "react";

export default function Dashboard() {
  const { activeGym, setActiveGym, activeTrainer, setActiveTrainer } = useAppContext();
  const { toast } = useToast();
  const [newTrainerName, setNewTrainerName] = useState("");

  const { data: gyms } = useQuery<Gym[]>({ queryKey: ["/api/gyms"] });
  const { data: trainers } = useQuery<Trainer[]>({
    queryKey: [`/api/trainers?gymId=${activeGym?.id}`],
    enabled: !!activeGym
  });

  const createTrainerMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!activeGym) return;
      const res = await apiRequest("POST", "/api/trainers", {
        name,
        email: `${name.toLowerCase().replace(/\s/g, '.')}@${activeGym.name.toLowerCase().replace(/\s/g, '')}.com`,
        gymId: activeGym.id
      });
      return res.json();
    },
    onSuccess: (newTrainer) => {
      queryClient.invalidateQueries({ queryKey: [`/api/trainers?gymId=${activeGym?.id}`] });
      setActiveTrainer(newTrainer);
      setNewTrainerName("");
      toast({ title: "Trainer added and selected" });
    }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-black tracking-tighter">FITPRO DASHBOARD</h1>
        <p className="text-muted-foreground text-xl">Manage your multi-tenant fitness ecosystem.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Gym Selection */}
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3 text-primary mb-2">
              <Building2 className="h-6 w-6" />
              <span className="font-bold uppercase tracking-widest text-sm">Step 1: Select Gym</span>
            </div>
            <CardTitle className="text-2xl">Active Gym</CardTitle>
            <CardDescription>Choose which gym's context you are working in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select
              value={activeGym?.id || ""}
              onValueChange={(id) => {
                const gym = gyms?.find(g => g.id === id);
                setActiveGym(gym || null);
                setActiveTrainer(null);
              }}
            >
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Select a Gym" />
              </SelectTrigger>
              <SelectContent>
                {gyms?.map(gym => (
                  <SelectItem key={gym.id} value={gym.id}>{gym.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!gyms?.length && (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
                No gyms found. Please use "Onboard Gym" in the sidebar first.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Trainer Selection */}
        <Card className={`border-none shadow-xl bg-card/50 backdrop-blur-sm transition-opacity ${!activeGym ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
          <CardHeader>
            <div className="flex items-center gap-3 text-primary mb-2">
              <UserCheck className="h-6 w-6" />
              <span className="font-bold uppercase tracking-widest text-sm">Step 2: Select Trainer</span>
            </div>
            <CardTitle className="text-2xl">Active Trainer</CardTitle>
            <CardDescription>Working on behalf of this trainer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Select
                value={activeTrainer?.id || ""}
                onValueChange={(id) => {
                  const trainer = trainers?.find(t => t.id === id);
                  setActiveTrainer(trainer || null);
                }}
              >
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Select a Trainer" />
                </SelectTrigger>
                <SelectContent>
                  {trainers?.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="pt-4 border-t space-y-4">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Or Add New Trainer to {activeGym?.name}</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Trainer Name"
                    value={newTrainerName}
                    onChange={(e) => setNewTrainerName(e.target.value)}
                    className="h-11"
                  />
                  <Button
                    onClick={() => createTrainerMutation.mutate(newTrainerName)}
                    disabled={!newTrainerName || createTrainerMutation.isPending}
                    size="icon"
                    className="h-11 w-11 shrink-0"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeGym && activeTrainer && (
        <Card className="border-none bg-primary text-primary-foreground shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="space-y-2">
                <p className="text-primary-foreground/70 font-bold uppercase tracking-[0.2em] text-xs">Currently Working As</p>
                <h2 className="text-4xl font-black">{activeTrainer.name}</h2>
                <div className="flex items-center gap-2 justify-center md:justify-start bg-black/10 w-fit px-3 py-1 rounded-full border border-white/10">
                  <Building2 className="h-4 w-4" />
                  <span className="font-semibold text-sm">{activeGym.name}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="secondary" className="font-bold h-12 px-6" asChild>
                  <a href="/clients">Manage Clients</a>
                </Button>
                <Button variant="ghost" className="h-12 w-12 rounded-full hover:bg-white/10" onClick={() => {
                  setActiveGym(null);
                  setActiveTrainer(null);
                }}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
