import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
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
import {
  Building2,
  UserCheck,
  Plus,
  LogOut,
  Users,
  Dumbbell,
  Utensils,
  FileText,
  ArrowRight,
  TrendingUp,
  Target,
  Activity,
  Settings,
  ChevronLeft
} from "lucide-react";
import type { Gym, Trainer, Client, WorkoutPlan, DietPlan } from "@shared/schema";
import { goalLabels, fitnessLevelLabels } from "@shared/schema";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TrainerProfileForm } from "@/components/trainer-profile";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading = false,
  testId
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  loading?: boolean;
  testId?: string;
}) {
  return (
    <Card data-testid={testId} className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-3xl font-black tracking-tighter" data-testid={`${testId}-value`}>{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 font-medium">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ClientCard({ client }: { client: Client }) {
  const initials = client.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all border-none shadow-md bg-card/50 backdrop-blur-sm" data-testid={`card-client-${client.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12" data-testid={`avatar-client-${client.id}`}>
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate" data-testid={`text-client-name-${client.id}`}>
                {client.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate" data-testid={`text-client-email-${client.id}`}>{client.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider" data-testid={`badge-client-goal-${client.id}`}>
                  {goalLabels[client.goal as keyof typeof goalLabels]}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider" data-testid={`badge-client-level-${client.id}`}>
                  {fitnessLevelLabels[client.fitnessLevel as keyof typeof fitnessLevelLabels]}
                </Badge>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ClientCardSkeleton() {
  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { activeGym, setActiveGym, activeTrainer, setActiveTrainer } = useAppContext();
  const { toast } = useToast();
  const [newTrainerName, setNewTrainerName] = useState("");

  const { data: gyms } = useQuery<Gym[]>({ queryKey: ["/api/gyms"] });
  const { data: trainers } = useQuery<Trainer[]>({
    queryKey: [`/api/trainers?gymId=${activeGym?.id}`],
    enabled: !!activeGym
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: [`/api/clients?trainerId=${activeTrainer?.id}`],
    enabled: !!activeTrainer
  });

  const { data: workoutPlans = [], isLoading: workoutsLoading } = useQuery<WorkoutPlan[]>({
    queryKey: [`/api/workout-plans?trainerId=${activeTrainer?.id}`],
    enabled: !!activeTrainer
  });

  const { data: dietPlans = [], isLoading: dietsLoading } = useQuery<DietPlan[]>({
    queryKey: [`/api/diet-plans?trainerId=${activeTrainer?.id}`],
    enabled: !!activeTrainer
  });

  const createTrainerMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!activeGym) return;
      const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
      const sanitizedGymName = activeGym.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      const res = await apiRequest("POST", "/api/trainers", {
        name,
        email: `${sanitizedName}@${sanitizedGymName}.com`,
        gymId: activeGym.id
      });
      return res.json();
    },
    onSuccess: (newTrainer) => {
      queryClient.invalidateQueries({ queryKey: [`/api/trainers?gymId=${activeGym?.id}`] });
      setActiveTrainer(newTrainer);
      setNewTrainerName("");
      toast({ title: "Trainer added and selected" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add trainer",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const isLoading = clientsLoading || workoutsLoading || dietsLoading;
  const recentClients = clients.slice(0, 6);

  if (!activeGym || !activeTrainer) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-black tracking-tighter">FITPRO DASHBOARD</h1>
          <p className="text-muted-foreground text-xl font-medium">Select your context to begin.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Gym Selection */}
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <Building2 className="h-6 w-6" />
                <span className="font-bold uppercase tracking-widest text-sm">Step 1: Select Gym</span>
              </div>
              <CardTitle className="text-2xl font-black">Active Gym</CardTitle>
              <CardDescription className="font-medium">Choose which gym's context you are working in.</CardDescription>
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
                <SelectTrigger className="h-12 text-lg font-semibold">
                  <SelectValue placeholder="Select a Gym" />
                </SelectTrigger>
                <SelectContent>
                  {gyms?.map(gym => (
                    <SelectItem key={gym.id} value={gym.id} className="font-medium">{gym.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!gyms?.length && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic font-medium">
                  No gyms found. Please use "Onboard Gym" in the sidebar first.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Trainer Selection */}
          <Card className={`border-none shadow-2xl bg-card/50 backdrop-blur-sm transition-all duration-500 ${!activeGym ? 'opacity-50 grayscale pointer-events-none scale-95' : 'scale-100'}`}>
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <UserCheck className="h-6 w-6" />
                <span className="font-bold uppercase tracking-widest text-sm">Step 2: Select Trainer</span>
              </div>
              <CardTitle className="text-2xl font-black">Active Trainer</CardTitle>
              <CardDescription className="font-medium">Working on behalf of this trainer.</CardDescription>
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
                  <SelectTrigger className="h-12 text-lg font-semibold">
                    <SelectValue placeholder="Select a Trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers?.map(t => (
                      <SelectItem key={t.id} value={t.id} className="font-medium">{t.name}</SelectItem>
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
                      className="h-11 font-medium"
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
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Active Context Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-primary/10 w-fit px-3 py-1 rounded-full border border-primary/20">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="font-bold text-xs uppercase tracking-widest text-primary">{activeGym.name}</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter">
              WELCOME BACK, <span className="text-primary uppercase">{activeTrainer.name}</span>
            </h1>
            <p className="text-muted-foreground text-xl font-medium">
              Manage your clients' fitness journeys in {activeGym.name}.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-bold h-12 px-6 rounded-xl border-2" onClick={() => setActiveTrainer(null)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Switch Trainer
          </Button>
          <Button variant="ghost" className="h-12 w-12 rounded-xl bg-muted/50 hover:bg-destructive/10 hover:text-destructive" onClick={() => {
            setActiveGym(null);
            setActiveTrainer(null);
          }}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-testid="stats-grid">
        <StatCard
          title="Total Clients"
          value={clients.length}
          icon={Users}
          description="Active client profiles"
          loading={isLoading}
          testId="stat-total-clients"
        />
        <StatCard
          title="Workout Plans"
          value={workoutPlans.length}
          icon={Dumbbell}
          description="Created this month"
          loading={isLoading}
          testId="stat-workout-plans"
        />
        <StatCard
          title="Diet Plans"
          value={dietPlans.length}
          icon={Utensils}
          description="Active meal plans"
          loading={isLoading}
          testId="stat-diet-plans"
        />
        <StatCard
          title="Plans Shared"
          value={(workoutPlans.length + dietPlans.length)}
          icon={FileText}
          description="PDFs generated"
          loading={isLoading}
          testId="stat-plans-shared"
        />
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-black uppercase tracking-tight">
              <Activity className="h-6 w-6 text-primary" />
              Quick Actions
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 font-bold border-2 rounded-lg">
                  <Settings className="h-4 w-4" />
                  Trainer Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <TrainerProfileForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/clients/new">
              <Button className="w-full h-14 justify-start gap-3 font-bold text-lg rounded-xl shadow-lg shadow-primary/20" data-testid="button-add-client">
                <Plus className="h-5 w-5" />
                Add New Client
              </Button>
            </Link>
            <Link href="/workout-plans/new">
              <Button variant="secondary" className="w-full h-14 justify-start gap-3 font-bold text-lg rounded-xl border-none" data-testid="button-create-workout">
                <Dumbbell className="h-5 w-5" />
                Create Workout
              </Button>
            </Link>
            <Link href="/diet-plans/new">
              <Button variant="secondary" className="w-full h-14 justify-start gap-3 font-bold text-lg rounded-xl border-none" data-testid="button-create-diet">
                <Utensils className="h-5 w-5" />
                Create Diet
              </Button>
            </Link>
            <Link href="/clients">
              <Button variant="outline" className="w-full h-14 justify-start gap-3 font-bold text-lg rounded-xl border-2" data-testid="button-view-all-clients">
                <Users className="h-5 w-5" />
                View Clients
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Clients */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Recent Clients</h2>
          </div>
          <Link href="/clients">
            <Button variant="ghost" size="sm" className="gap-2 font-bold hover:bg-primary/5" data-testid="link-view-all">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {clientsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ClientCardSkeleton key={i} />
            ))}
          </div>
        ) : recentClients.length === 0 ? (
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-6">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-black text-2xl mb-2 uppercase tracking-tight">No clients yet</h3>
              <p className="text-muted-foreground mb-8 max-w-sm font-medium">
                Start by adding your first client to create personalized workout and diet plans.
              </p>
              <Link href="/clients/new">
                <Button size="lg" className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20" data-testid="button-add-first-client">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Client
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>

      {/* Getting Started Guide */}
      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 font-black uppercase tracking-tight">
            <TrendingUp className="h-6 w-6 text-primary" />
            Getting Started Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-background/50 border border-border/50">
              <div className="rounded-xl bg-primary text-primary-foreground font-black text-xl w-12 h-12 flex items-center justify-center shadow-lg shadow-primary/20">
                1
              </div>
              <div>
                <h4 className="font-black uppercase tracking-tight mb-1">Add Your Clients</h4>
                <p className="text-sm text-muted-foreground font-medium">
                  Create client profiles with their fitness goals, current stats, and contact information.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-background/50 border border-border/50">
              <div className="rounded-xl bg-primary text-primary-foreground font-black text-xl w-12 h-12 flex items-center justify-center shadow-lg shadow-primary/20">
                2
              </div>
              <div>
                <h4 className="font-black uppercase tracking-tight mb-1">Create Custom Plans</h4>
                <p className="text-sm text-muted-foreground font-medium">
                  Build personalized workout and diet plans for each day of the month.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-background/50 border border-border/50">
              <div className="rounded-xl bg-primary text-primary-foreground font-black text-xl w-12 h-12 flex items-center justify-center shadow-lg shadow-primary/20">
                3
              </div>
              <div>
                <h4 className="font-black uppercase tracking-tight mb-1">Export & Share</h4>
                <p className="text-sm text-muted-foreground font-medium">
                  Generate professional PDFs and share them instantly via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
