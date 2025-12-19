import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { 
  ArrowLeft, Edit, Trash2, Dumbbell, Utensils, FileText, Download, 
  Phone, Mail, Target, Activity, Scale, Ruler, Calendar, Plus,
  Share2, Loader2, MoreVertical, HeartPulse, Link as LinkIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { generateWorkoutPDF, generateDietPDF, downloadPDF, shareToWhatsApp } from "@/lib/pdf-generator";
import type { Client, WorkoutPlan, DietPlan } from "@shared/schema";
import { goalLabels, fitnessLevelLabels } from "@shared/schema";
import { useState } from "react";
import { InjuryLogList } from "@/components/clients/injury-log";
import { MeasurementLogList } from "@/components/clients/measurement-log";
import { MeasurementChart } from "@/components/clients/measurement-chart";
import { ClientResources } from "@/components/clients/client-resources";
import { MeasurementLog } from "@shared/schema";

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function PlanCard({ 
  plan, 
  type, 
  client,
  onDelete 
}: { 
  plan: WorkoutPlan | DietPlan; 
  type: 'workout' | 'diet';
  client: Client;
  onDelete: () => void;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = type === 'workout' 
        ? generateWorkoutPDF(client, plan as WorkoutPlan)
        : generateDietPDF(client, plan as DietPlan);
      downloadPDF(doc, `${client.name.replace(/\s+/g, '_')}_${type}_plan_${MONTH_NAMES[plan.month - 1]}_${plan.year}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Hi ${client.name}!\n\nYour ${type === 'workout' ? 'Workout' : 'Diet'} Plan for ${MONTH_NAMES[plan.month - 1]} ${plan.year} is ready!\n\nPlan: ${plan.name}\n\nDownload the PDF or contact me for any questions.\n\n- Your Trainer`;
    shareToWhatsApp(message, client.phone);
  };

  return (
    <Card data-testid={`card-${type}-plan-${plan.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-2 ${type === 'workout' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-600'}`}>
              {type === 'workout' ? <Dumbbell className="h-5 w-5" /> : <Utensils className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="font-medium" data-testid={`text-plan-name-${plan.id}`}>{plan.name}</h4>
              <p className="text-sm text-muted-foreground" data-testid={`text-plan-date-${plan.id}`}>
                {MONTH_NAMES[plan.month - 1]} {plan.year}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs" data-testid={`badge-plan-days-${plan.id}`}>
                  {(plan as WorkoutPlan).days?.length || (plan as DietPlan).days?.length || 0} days
                </Badge>
                {'targetCalories' in plan && (
                  <Badge variant="outline" className="text-xs" data-testid={`badge-plan-calories-${plan.id}`}>
                    {plan.targetCalories} kcal/day
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid={`button-plan-menu-${plan.id}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/${type}-plans/${plan.id}`}>
                <DropdownMenuItem data-testid={`menuitem-edit-plan-${plan.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting} data-testid={`menuitem-export-pdf-${plan.id}`}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareWhatsApp} data-testid={`menuitem-share-whatsapp-${plan.id}`}>
                <Share2 className="h-4 w-4 mr-2" />
                Share via WhatsApp
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
                data-testid={`menuitem-delete-plan-${plan.id}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyPlanState({ type, clientId }: { type: 'workout' | 'diet'; clientId: string }) {
  return (
    <Card data-testid={`card-empty-${type}-plans`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className={`rounded-full p-4 mb-4 ${type === 'workout' ? 'bg-primary/10' : 'bg-green-500/10'}`}>
          {type === 'workout' ? (
            <Dumbbell className={`h-8 w-8 ${type === 'workout' ? 'text-primary' : 'text-green-600'}`} />
          ) : (
            <Utensils className="h-8 w-8 text-green-600" />
          )}
        </div>
        <h3 className="font-semibold text-lg mb-2" data-testid={`text-empty-${type}-title`}>
          No {type === 'workout' ? 'workout' : 'diet'} plans yet
        </h3>
        <p className="text-muted-foreground mb-4 max-w-sm" data-testid={`text-empty-${type}-description`}>
          Create a personalized {type === 'workout' ? 'workout' : 'diet'} plan for this client.
        </p>
        <Link href={`/${type}-plans/new?clientId=${clientId}`}>
          <Button data-testid={`button-create-${type}-plan`}>
            <Plus className="h-4 w-4 mr-2" />
            Create {type === 'workout' ? 'Workout' : 'Diet'} Plan
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<{ id: string; type: 'workout' | 'diet' } | null>(null);
  const [selectedPortalDate, setSelectedPortalDate] = useState<Date | undefined>(new Date());

  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: ['/api/clients', params.id],
  });

  const { data: workoutPlans = [] } = useQuery<WorkoutPlan[]>({
    queryKey: ['/api/workout-plans', `?clientId=${params.id}`],
    enabled: !!params.id,
  });

  const { data: dietPlans = [] } = useQuery<DietPlan[]>({
    queryKey: ['/api/diet-plans', `?clientId=${params.id}`],
    enabled: !!params.id,
  });

  const { data: measurementLogs = [] } = useQuery<MeasurementLog[]>({
    queryKey: ['/api/clients', params.id, 'measurements'],
    enabled: !!params.id,
  });

  const deleteClientMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/clients/${params.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client deleted",
        description: "The client has been removed successfully.",
      });
      setLocation('/clients');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'workout' | 'diet' }) => {
      await apiRequest('DELETE', `/api/${type}-plans/${id}`);
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type}-plans`] });
      toast({
        title: "Plan deleted",
        description: "The plan has been removed successfully.",
      });
      setPlanToDelete(null);
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeletePlan = (id: string, type: 'workout' | 'diet') => {
    setPlanToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const confirmDeletePlan = () => {
    if (planToDelete) {
      deletePlanMutation.mutate(planToDelete);
    }
  };

  if (clientLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="font-semibold text-lg mb-2">Client not found</h3>
            <p className="text-muted-foreground mb-4">
              The client you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/clients">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = client.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const clientWorkoutPlans = workoutPlans.filter(p => p.clientId === params.id);
  const clientDietPlans = dietPlans.filter(p => p.clientId === params.id);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation('/clients')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-client-name">
              {client.name}
            </h1>
            <p className="text-muted-foreground">Client Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" data-testid="button-portal-options">
                <LinkIcon className="h-4 w-4 mr-2" />
                Portal Link
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Share Portal</h4>
                  <p className="text-sm text-muted-foreground">
                    Select a date to share specific daily content.
                  </p>
                </div>
                <div className="border rounded-md">
                  <CalendarComponent
                    mode="single"
                    selected={selectedPortalDate}
                    onSelect={setSelectedPortalDate}
                    initialFocus
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (client.token) {
                      let url = `${window.location.origin}/portal/${client.token}`;
                      if (selectedPortalDate) {
                        url += `?date=${format(selectedPortalDate, 'yyyy-MM-dd')}`;
                      }
                      navigator.clipboard.writeText(url);
                      toast({ title: "Portal link copied", description: "Link includes selected date." });
                    } else {
                      toast({ title: "Portal link not available", variant: "destructive" });
                    }
                  }}
                  disabled={!client.token}
                >
                  Copy Link
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Link href={`/clients/${params.id}/edit`}>
            <Button variant="outline" data-testid="button-edit-client">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="text-destructive hover:text-destructive"
            onClick={() => deleteClientMutation.mutate()}
            disabled={deleteClientMutation.isPending}
            data-testid="button-delete-client"
          >
            {deleteClientMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{client.age} years old</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className="gap-1">
                  <Target className="h-3 w-3" />
                  {goalLabels[client.goal]}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Activity className="h-3 w-3" />
                  {fitnessLevelLabels[client.fitnessLevel]}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Scale className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{client.weight}</p>
                    <p className="text-xs text-muted-foreground">kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Ruler className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{client.height}</p>
                    <p className="text-xs text-muted-foreground">cm</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{clientWorkoutPlans.length + clientDietPlans.length}</p>
                    <p className="text-xs text-muted-foreground">plans</p>
                  </div>
                </div>
              </div>

              {client.notes && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{client.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Tabs */}
      <Tabs defaultValue="workout" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="workout" className="gap-2" data-testid="tab-workout-plans">
              <Dumbbell className="h-4 w-4" />
              Workout Plans
              {clientWorkoutPlans.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {clientWorkoutPlans.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="diet" className="gap-2" data-testid="tab-diet-plans">
              <Utensils className="h-4 w-4" />
              Diet Plans
              {clientDietPlans.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {clientDietPlans.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2" data-testid="tab-tracking">
              <HeartPulse className="h-4 w-4" />
              Health & Progress
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tracking" className="space-y-6">
          <ClientResources clientId={params.id!} />

          {measurementLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Progress Charts
                </CardTitle>
                <CardDescription>
                  Visual tracking of weight and measurements over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MeasurementChart logs={measurementLogs} />
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-destructive" />
                  Injuries & Recovery
                </CardTitle>
                <CardDescription>
                  Log and monitor client injuries and rehabilitation status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InjuryLogList clientId={params.id!} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Body Measurements
                </CardTitle>
                <CardDescription>
                  Historical log of weight and body dimensions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MeasurementLogList clientId={params.id!} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workout" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Workout Plans</h3>
              <p className="text-sm text-muted-foreground">Monthly workout routines</p>
            </div>
            <Link href={`/workout-plans/new?clientId=${params.id}`}>
              <Button size="sm" data-testid="button-new-workout-plan">
                <Plus className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </Link>
          </div>
          {clientWorkoutPlans.length === 0 ? (
            <EmptyPlanState type="workout" clientId={params.id!} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {clientWorkoutPlans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  type="workout" 
                  client={client}
                  onDelete={() => handleDeletePlan(plan.id, 'workout')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="diet" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Diet Plans</h3>
              <p className="text-sm text-muted-foreground">Monthly meal plans</p>
            </div>
            <Link href={`/diet-plans/new?clientId=${params.id}`}>
              <Button size="sm" data-testid="button-new-diet-plan">
                <Plus className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </Link>
          </div>
          {clientDietPlans.length === 0 ? (
            <EmptyPlanState type="diet" clientId={params.id!} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {clientDietPlans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  type="diet" 
                  client={client}
                  onDelete={() => handleDeletePlan(plan.id, 'diet')}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Plan Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {planToDelete?.type} plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePlanMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
