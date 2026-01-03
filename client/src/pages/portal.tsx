import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useSearch } from "wouter";
import {
  Activity, Calendar, Dumbbell, Utensils, AlertCircle, CheckCircle2, Circle, Scale, Ruler, HeartPulse, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ItemCompletion } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { goalLabels, fitnessLevelLabels, type Client, type WorkoutPlan, type DietPlan, type InjuryLog, type MeasurementLog, type ClientResource, type TrainerProfile } from "@shared/schema";
import { MeasurementChart } from "@/components/clients/measurement-chart";
import { Link as LinkIcon, FileText, Phone, Mail, User as UserIcon } from "lucide-react";

interface PortalData {
  client: Pick<Client, "name" | "goal" | "fitnessLevel" | "notes">;
  currentWorkoutPlan: WorkoutPlan | null;
  currentDietPlan: DietPlan | null;
  injuryLogs: InjuryLog[];
  measurementLogs: MeasurementLog[];
  resources: ClientResource[];
  trainerProfile: TrainerProfile | null;
}

export default function Portal() {
  const params = useParams<{ token: string }>();
  const search = useSearch();
  const queryParams = new URLSearchParams(search);
  const dateParam = queryParams.get("date");

  const { data, isLoading, error } = useQuery<PortalData>({
    queryKey: ['/api/portal', params.token],
  });

  // Default to today if no date param, but format correctly for API
  const displayDate = dateParam || format(new Date(), 'yyyy-MM-dd');

  const { data: completions = [] } = useQuery<ItemCompletion[]>({
    queryKey: ['/api/portal', params.token, 'completions', `?date=${displayDate}`],
    enabled: !!data,
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: async (vars: { planId: string, type: 'workout' | 'diet', itemId: string, completed: boolean }) => {
      await apiRequest('POST', `/api/portal/${params.token}/completions`, {
        ...vars,
        date: displayDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal', params.token, 'completions'] });
    },
  });

  const isCompleted = (type: 'workout' | 'diet', itemId: string) => {
    return completions.some(c => c.type === type && c.itemId === itemId && c.completed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              This portal link is invalid or has expired. Please contact your trainer for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { client, currentWorkoutPlan, currentDietPlan, injuryLogs, measurementLogs, resources = [], trainerProfile } = data;

  const targetDay = dateParam ? new Date(dateParam).getDate() : null;

  const filteredWorkoutDays = currentWorkoutPlan?.days.filter(d => !targetDay || d.day === targetDay) || [];
  const filteredDietDays = currentDietPlan?.days.filter(d => !targetDay || d.day === targetDay) || [];

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Dumbbell className="h-5 w-5 text-primary" />
            FitPro Portal
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <section className="space-y-4">
          {dateParam && (
             <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center justify-between">
               <span className="text-sm font-medium">
                 Viewing content for {format(new Date(dateParam), 'PPP')}
               </span>
               <a href={window.location.pathname} className="text-xs hover:underline flex items-center gap-1">
                 <X className="h-3 w-3" /> Clear Date
               </a>
             </div>
          )}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Hi, {client.name}</h1>
              <p className="text-muted-foreground">Here is your current progress and active plans.</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-sm py-1 px-3">
                {goalLabels[client.goal]}
              </Badge>
              <Badge variant="outline" className="text-sm py-1 px-3">
                {fitnessLevelLabels[client.fitnessLevel]}
              </Badge>
            </div>
          </div>

          {client.notes && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Trainer Notes
                </h4>
                <p className="text-sm text-muted-foreground">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="plans">Active Plans</TabsTrigger>
            <TabsTrigger value="progress">Health & Progress</TabsTrigger>
          <TabsTrigger value="resources">Resources & Info</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Workout Plan */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    Current Workout
                  </CardTitle>
                  <CardDescription>
                    {currentWorkoutPlan ? `${currentWorkoutPlan.name}` : "No active workout plan"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentWorkoutPlan ? (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-6">
                        {filteredWorkoutDays.length === 0 && targetDay && (
                           <p className="text-sm text-muted-foreground">No workout scheduled for Day {targetDay}.</p>
                        )}
                        {filteredWorkoutDays.map((day) => (
                          <div key={day.day} className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              Day {day.day}
                              {day.isRestDay && <Badge variant="secondary" className="text-xs ml-2">Rest Day</Badge>}
                            </h4>
                            {!day.isRestDay && (
                              <div className="space-y-4">
                                {/* Warmup */}
                                {day.warmup && day.warmup.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Warmup</h5>
                                    <div className="grid gap-2">
                                      {day.warmup.map((ex) => (
                                        <div key={ex.id} className="text-sm border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors">
                                          <div className="flex items-start gap-3">
                                            <Checkbox
                                              id={`wu-${ex.id}`}
                                              checked={isCompleted('workout', ex.id)}
                                              onCheckedChange={(checked) => {
                                                if (currentWorkoutPlan) {
                                                  toggleCompletionMutation.mutate({
                                                    planId: currentWorkoutPlan.id,
                                                    type: 'workout',
                                                    itemId: ex.id,
                                                    completed: !!checked
                                                  });
                                                }
                                              }}
                                            />
                                            <div className="flex-1">
                                              <div className="flex justify-between items-start mb-1">
                                                <label
                                                  htmlFor={`wu-${ex.id}`}
                                                  className={`font-medium cursor-pointer ${isCompleted('workout', ex.id) ? 'line-through text-muted-foreground' : ''}`}
                                                >
                                                  {ex.name}
                                                </label>
                                                <span className="text-muted-foreground text-xs">{ex.sets} x {ex.reps}</span>
                                              </div>
                                              {ex.videoUrl && (
                                                <div className="my-2 rounded-md overflow-hidden bg-black/5 w-fit">
                                                  <img src={ex.videoUrl} alt={ex.name} className="h-24 w-auto object-contain" />
                                                </div>
                                              )}
                                              {ex.notes && <p className="text-xs text-muted-foreground">{ex.notes}</p>}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Main Workout */}
                                <div>
                                  {day.warmup && day.warmup.length > 0 && (
                                     <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Main Workout</h5>
                                  )}
                                  <div className="grid gap-2">
                                    {day.exercises.map((ex) => (
                                      <div key={ex.id} className="text-sm border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-start gap-3">
                                          <Checkbox
                                            id={`ex-${ex.id}`}
                                            checked={isCompleted('workout', ex.id)}
                                            onCheckedChange={(checked) => {
                                              if (currentWorkoutPlan) {
                                                toggleCompletionMutation.mutate({
                                                  planId: currentWorkoutPlan.id,
                                                  type: 'workout',
                                                  itemId: ex.id,
                                                  completed: !!checked
                                                });
                                              }
                                            }}
                                          />
                                          <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                              <label
                                                htmlFor={`ex-${ex.id}`}
                                                className={`font-medium cursor-pointer ${isCompleted('workout', ex.id) ? 'line-through text-muted-foreground' : ''}`}
                                              >
                                                {ex.name}
                                              </label>
                                              <span className="text-muted-foreground text-xs">{ex.sets} x {ex.reps}</span>
                                            </div>
                                            {ex.videoUrl && (
                                              <div className="my-2 rounded-md overflow-hidden bg-black/5 w-fit">
                                                <img src={ex.videoUrl} alt={ex.name} className="h-24 w-auto object-contain" />
                                              </div>
                                            )}
                                            {ex.notes && <p className="text-xs text-muted-foreground">{ex.notes}</p>}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            <Separator />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm">
                      <p>No workout plan assigned yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Diet Plan */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-green-500" />
                    Current Diet
                  </CardTitle>
                  <CardDescription>
                    {currentDietPlan ? `${currentDietPlan.name}` : "No active diet plan"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentDietPlan ? (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between text-sm bg-muted/50 p-3 rounded-lg">
                          <span className="font-medium">Target Calories</span>
                          <span>{currentDietPlan.targetCalories} kcal/day</span>
                        </div>
                        {filteredDietDays.length === 0 && targetDay && (
                           <p className="text-sm text-muted-foreground">No diet plan for Day {targetDay}.</p>
                        )}
                        {filteredDietDays.map((day) => (
                          <div key={day.day} className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              Day {day.day}
                            </h4>
                            <div className="grid gap-2">
                              {day.meals.map((meal) => (
                                <div key={meal.id} className="text-sm border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors">
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      id={`meal-${meal.id}`}
                                      checked={isCompleted('diet', meal.id)}
                                      onCheckedChange={(checked) => {
                                        if (currentDietPlan) {
                                          toggleCompletionMutation.mutate({
                                            planId: currentDietPlan.id,
                                            type: 'diet',
                                            itemId: meal.id,
                                            completed: !!checked
                                          });
                                        }
                                      }}
                                    />
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium capitalize text-muted-foreground">{meal.type.replace('_', ' ')}</span>
                                        <span className="text-muted-foreground text-xs">{meal.calories} kcal</span>
                                      </div>
                                      <p className={`font-medium text-primary text-xs mb-1 cursor-pointer ${isCompleted('diet', meal.id) ? 'line-through opacity-70' : ''}`}>
                                        <label htmlFor={`meal-${meal.id}`}>{meal.name}</label>
                                      </p>
                                      <div className="flex gap-2 text-[10px] text-muted-foreground">
                                        <span>P: {meal.protein}g</span>
                                        <span>C: {meal.carbs}g</span>
                                        <span>F: {meal.fat}g</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <Separator />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm">
                      <p>No diet plan assigned yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Charts Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Progress Charts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MeasurementChart logs={measurementLogs} />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Measurements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Scale className="h-5 w-5 text-primary" />
                    Measurement History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {measurementLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No measurements logged.</p>
                      ) : (
                        measurementLogs.map((log) => (
                          <div key={log.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                            <div>
                              <p className="font-medium text-sm">{format(new Date(log.date), 'PPP')}</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                {log.weight && <span>Weight: {log.weight}kg</span>}
                                {log.waist && <span>Waist: {log.waist}cm</span>}
                              </div>
                              {log.notes && <p className="text-xs mt-1 italic">"{log.notes}"</p>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Injuries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HeartPulse className="h-5 w-5 text-destructive" />
                    Injuries & Recovery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {injuryLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No injuries reported.</p>
                      ) : (
                        injuryLogs.map((log) => (
                          <div key={log.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{log.title}</span>
                              <Badge variant={log.status === "Active" ? "destructive" : "secondary"} className="text-[10px]">
                                {log.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{log.description}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>Reported: {format(new Date(log.date), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Trainer Profile Card - Takes up 1 column on medium screens */}
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    Trainer Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trainerProfile ? (
                    <>
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg">{trainerProfile.name}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <a href={`mailto:${trainerProfile.email}`} className="hover:text-primary transition-colors">
                              {trainerProfile.email}
                            </a>
                          </div>
                          {trainerProfile.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <a href={`tel:${trainerProfile.phone}`} className="hover:text-primary transition-colors">
                                {trainerProfile.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      {trainerProfile.bio && (
                        <>
                          <Separator />
                          <div className="text-sm text-muted-foreground italic">
                            "{trainerProfile.bio}"
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <UserIcon className="h-10 w-10 mb-2 opacity-20" />
                      <p>Trainer contact info not available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resources List - Takes up 2 columns on medium screens */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    Resources & Links
                  </CardTitle>
                  <CardDescription>
                    Materials shared by your trainer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {resources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                          <FileText className="h-10 w-10 mb-2 opacity-20" />
                          <p>No resources shared yet.</p>
                        </div>
                      ) : (
                        resources.map((resource) => (
                          <div key={resource.id} className="group border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                {resource.type === 'link' ? (
                                  <LinkIcon className="h-5 w-5" />
                                ) : (
                                  <FileText className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate pr-2">{resource.title}</h4>
                                {resource.description && (
                                  <p className="text-sm text-muted-foreground mt-1 mb-2 line-clamp-2">
                                    {resource.description}
                                  </p>
                                )}
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs font-medium text-primary hover:underline mt-1"
                                >
                                  Open {resource.type === 'link' ? 'Link' : 'File'}
                                  <LinkIcon className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
