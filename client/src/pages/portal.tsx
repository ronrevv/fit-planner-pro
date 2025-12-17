import { useQuery } from "@tanstack/react-query";
import { useParams, useSearch } from "wouter";
import {
  Activity, Calendar, Dumbbell, Utensils, AlertCircle, CheckCircle2, Circle, Scale, Ruler, HeartPulse, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { goalLabels, fitnessLevelLabels, type Client, type WorkoutPlan, type DietPlan, type InjuryLog, type MeasurementLog } from "@shared/schema";
import { MeasurementChart } from "@/components/clients/measurement-chart";

interface PortalData {
  client: Pick<Client, "name" | "goal" | "fitnessLevel" | "notes">;
  currentWorkoutPlan: WorkoutPlan | null;
  currentDietPlan: DietPlan | null;
  injuryLogs: InjuryLog[];
  measurementLogs: MeasurementLog[];
}

export default function Portal() {
  const params = useParams<{ token: string }>();
  const search = useSearch();
  const queryParams = new URLSearchParams(search);
  const dateParam = queryParams.get("date");

  const { data, isLoading, error } = useQuery<PortalData>({
    queryKey: ['/api/portal', params.token],
  });

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

  const { client, currentWorkoutPlan, currentDietPlan, injuryLogs, measurementLogs } = data;

  const targetDay = dateParam ? new Date(dateParam).getDate() : null;

  const filteredWorkoutDays = currentWorkoutPlan?.days.filter(d => !targetDay || d.day === targetDay) || [];
  const filteredDietDays = currentDietPlan?.days.filter(d => !targetDay || d.day === targetDay) || [];

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Dumbbell className="h-5 w-5 text-primary" />
            FitPro Portal
          </div>
        </div>
      </header>

      <main className="container pt-8 space-y-8">
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
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="plans">Active Plans</TabsTrigger>
            <TabsTrigger value="progress">Health & Progress</TabsTrigger>
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
                              <div className="grid gap-2">
                                {day.exercises.map((ex) => (
                                  <div key={ex.id} className="text-sm border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="font-medium">{ex.name}</span>
                                      <span className="text-muted-foreground text-xs">{ex.sets} x {ex.reps}</span>
                                    </div>
                                    {ex.notes && <p className="text-xs text-muted-foreground">{ex.notes}</p>}
                                  </div>
                                ))}
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
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium capitalize">{meal.type.replace('_', ' ')}</span>
                                    <span className="text-muted-foreground text-xs">{meal.calories} kcal</span>
                                  </div>
                                  <p className="font-medium text-primary text-xs mb-1">{meal.name}</p>
                                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                                    <span>P: {meal.protein}g</span>
                                    <span>C: {meal.carbs}g</span>
                                    <span>F: {meal.fat}g</span>
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
        </Tabs>
      </main>
    </div>
  );
}
