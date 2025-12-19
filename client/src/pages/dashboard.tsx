import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Users, Dumbbell, Utensils, FileText, Plus, ArrowRight, TrendingUp, Target, Activity, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Client, WorkoutPlan, DietPlan } from "@shared/schema";
import { goalLabels, fitnessLevelLabels } from "@shared/schema";
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
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-3xl font-bold tracking-tight" data-testid={`${testId}-value`}>{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
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
      <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid={`card-client-${client.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12" data-testid={`avatar-client-${client.id}`}>
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate" data-testid={`text-client-name-${client.id}`}>
                {client.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate" data-testid={`text-client-email-${client.id}`}>{client.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs" data-testid={`badge-client-goal-${client.id}`}>
                  {goalLabels[client.goal]}
                </Badge>
                <Badge variant="outline" className="text-xs" data-testid={`badge-client-level-${client.id}`}>
                  {fitnessLevelLabels[client.fitnessLevel]}
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
    <Card>
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
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: workoutPlans = [], isLoading: workoutsLoading } = useQuery<WorkoutPlan[]>({
    queryKey: ['/api/workout-plans'],
  });

  const { data: dietPlans = [], isLoading: dietsLoading } = useQuery<DietPlan[]>({
    queryKey: ['/api/diet-plans'],
  });

  const isLoading = clientsLoading || workoutsLoading || dietsLoading;
  const recentClients = clients.slice(0, 6);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, <span className="text-primary">Trainer</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your clients' fitness journeys all in one place.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="stats-grid">
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/clients/new">
              <Button className="w-full justify-start gap-2" data-testid="button-add-client">
                <Plus className="h-4 w-4" />
                Add New Client
              </Button>
            </Link>
            <Link href="/workout-plans/new">
              <Button variant="secondary" className="w-full justify-start gap-2" data-testid="button-create-workout">
                <Dumbbell className="h-4 w-4" />
                Create Workout Plan
              </Button>
            </Link>
            <Link href="/diet-plans/new">
              <Button variant="secondary" className="w-full justify-start gap-2" data-testid="button-create-diet">
                <Utensils className="h-4 w-4" />
                Create Diet Plan
              </Button>
            </Link>
            <Link href="/clients">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-view-all-clients">
                <Users className="h-4 w-4" />
                View All Clients
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Clients */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Recent Clients</h2>
          </div>
          <Link href="/clients">
            <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {clientsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ClientCardSkeleton key={i} />
            ))}
          </div>
        ) : recentClients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No clients yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Start by adding your first client to create personalized workout and diet plans.
              </p>
              <Link href="/clients/new">
                <Button data-testid="button-add-first-client">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Getting Started Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="rounded-full bg-primary/10 p-2 text-primary font-bold text-sm min-w-[32px] h-8 flex items-center justify-center">
                1
              </div>
              <div>
                <h4 className="font-medium">Add Your Clients</h4>
                <p className="text-sm text-muted-foreground">
                  Create client profiles with their fitness goals, current stats, and contact information.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="rounded-full bg-primary/10 p-2 text-primary font-bold text-sm min-w-[32px] h-8 flex items-center justify-center">
                2
              </div>
              <div>
                <h4 className="font-medium">Create Custom Plans</h4>
                <p className="text-sm text-muted-foreground">
                  Build personalized workout and diet plans for each day of the month.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="rounded-full bg-primary/10 p-2 text-primary font-bold text-sm min-w-[32px] h-8 flex items-center justify-center">
                3
              </div>
              <div>
                <h4 className="font-medium">Export & Share</h4>
                <p className="text-sm text-muted-foreground">
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
