import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { format } from "date-fns";
import { Check, Dumbbell, Utensils, Calendar, User, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Client, WorkoutPlan, DietPlan, DailyLog, Meal, Exercise } from "@shared/schema";

export default function ClientPortal() {
  const [match, params] = useRoute("/portal/:token");
  const { toast } = useToast();

  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: ['/api/portal', params?.token],
    enabled: !!params?.token,
  });

  const { data: workoutPlans = [] } = useQuery<WorkoutPlan[]>({
    queryKey: ['/api/workout-plans', `?clientId=${client?.id}`],
    enabled: !!client?.id,
  });

  const { data: dietPlans = [] } = useQuery<DietPlan[]>({
    queryKey: ['/api/diet-plans', `?clientId=${client?.id}`],
    enabled: !!client?.id,
  });

  const currentDate = new Date();
  // Reset time to start of day for consistent daily log lookups
  const todayTimestamp = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
  const currentDayOfMonth = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Find active plans for this month/year
  // (In a real app, logic might be more complex to find "current" plan regardless of exact month/year match if plans span multiple months)
  const activeWorkoutPlan = workoutPlans.find(p => p.month === currentMonth && p.year === currentYear);
  const activeDietPlan = dietPlans.find(p => p.month === currentMonth && p.year === currentYear);

  const todaysWorkout = activeWorkoutPlan?.days.find(d => d.day === currentDayOfMonth);
  const todaysDiet = activeDietPlan?.days.find(d => d.day === currentDayOfMonth);

  // Fetch daily logs
  const { data: dailyLogs = [] } = useQuery<DailyLog[]>({
    queryKey: ['/api/clients', client?.id, 'logs'],
    enabled: !!client?.id,
  });

  const todaysLog = dailyLogs.find(l => {
    const logDate = new Date(l.date);
    return logDate.getDate() === currentDayOfMonth &&
           logDate.getMonth() === currentDate.getMonth() &&
           logDate.getFullYear() === currentDate.getFullYear();
  });

  const completedExercises = new Set(todaysLog?.completedExercises || []);
  const completedMeals = new Set(todaysLog?.completedMeals || []);

  const updateLogMutation = useMutation({
    mutationFn: async (data: Partial<DailyLog>) => {
      await apiRequest('POST', `/api/clients/${client?.id}/logs`, {
        date: todayTimestamp,
        completedExercises: Array.from(completedExercises),
        completedMeals: Array.from(completedMeals),
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', client?.id, 'logs'] });
    },
  });

  const toggleExercise = (id: string) => {
    if (completedExercises.has(id)) {
      completedExercises.delete(id);
    } else {
      completedExercises.add(id);
    }
    updateLogMutation.mutate({ completedExercises: Array.from(completedExercises) });
  };

  const toggleMeal = (id: string) => {
    if (completedMeals.has(id)) {
      completedMeals.delete(id);
    } else {
      completedMeals.add(id);
    }
    updateLogMutation.mutate({ completedMeals: Array.from(completedMeals) });
  };

  if (clientLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid Link</CardTitle>
            <CardDescription>
              This portal link is invalid or expired. Please contact your trainer.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const workoutProgress = todaysWorkout?.exercises.length
    ? (completedExercises.size / todaysWorkout.exercises.length) * 100
    : 0;

  const dietProgress = todaysDiet?.meals.length
    ? (completedMeals.size / todaysDiet.meals.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Mobile Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium">Welcome back,</p>
            <h1 className="text-2xl font-bold">{client.name}</h1>
          </div>
          <User className="h-8 w-8 bg-primary-foreground/20 p-1.5 rounded-full" />
        </div>

        <div className="flex items-center gap-2 text-sm bg-primary-foreground/10 w-fit px-3 py-1.5 rounded-full">
          <Calendar className="h-4 w-4" />
          <span>{format(currentDate, "EEEE, MMM d, yyyy")}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6">
        <Tabs defaultValue="today" className="space-y-4">
          <TabsList className="w-full h-12 bg-white shadow-sm border">
            <TabsTrigger value="today" className="flex-1">Today's Plan</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {/* Workout Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">Workout</CardTitle>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {completedExercises.size}/{todaysWorkout?.exercises.length || 0}
                  </span>
                </div>
                <Progress value={workoutProgress} className="h-2 mt-2" />
              </CardHeader>
              <CardContent>
                {!todaysWorkout ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No workout scheduled for today.
                  </div>
                ) : todaysWorkout.isRestDay ? (
                  <div className="text-center py-6">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Rest Day 🌿
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">Take it easy today!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaysWorkout.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          completedExercises.has(exercise.id) ? 'bg-blue-50 border-blue-100' : 'bg-white'
                        }`}
                        onClick={() => toggleExercise(exercise.id)}
                      >
                        <Checkbox
                          checked={completedExercises.has(exercise.id)}
                          onCheckedChange={() => toggleExercise(exercise.id)}
                        />
                        <div className="flex-1 space-y-1">
                          <p className={`font-medium text-sm ${completedExercises.has(exercise.id) ? 'line-through text-muted-foreground' : ''}`}>
                            {exercise.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.restSeconds > 0 && ` • ${exercise.restSeconds}s rest`}
                          </p>
                          {exercise.notes && (
                            <p className="text-xs text-blue-600 mt-1 bg-blue-50 p-1.5 rounded">
                              📝 {exercise.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Diet Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">Diet</CardTitle>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {completedMeals.size}/{todaysDiet?.meals.length || 0}
                  </span>
                </div>
                <Progress value={dietProgress} className="h-2 mt-2" />
              </CardHeader>
              <CardContent>
                {!todaysDiet || todaysDiet.meals.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No meals scheduled for today.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaysDiet.meals.map((meal) => (
                      <div
                        key={meal.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          completedMeals.has(meal.id) ? 'bg-green-50 border-green-100' : 'bg-white'
                        }`}
                        onClick={() => toggleMeal(meal.id)}
                      >
                        <Checkbox
                          checked={completedMeals.has(meal.id)}
                          onCheckedChange={() => toggleMeal(meal.id)}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <p className={`font-medium text-sm ${completedMeals.has(meal.id) ? 'line-through text-muted-foreground' : ''}`}>
                              {meal.name}
                            </p>
                            <span className="text-xs font-medium text-muted-foreground">
                              {meal.calories} kcal
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {meal.type.replace('_', ' ')}
                          </p>
                          {meal.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {meal.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>History view coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
