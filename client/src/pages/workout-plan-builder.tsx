import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, useSearch } from "wouter";
import { 
  ArrowLeft, Save, Loader2, Dumbbell, Plus, Trash2, Calendar, 
  ChevronLeft, ChevronRight, Download, Share2, Copy, Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { generateWorkoutPDF, downloadPDF, shareToWhatsApp } from "@/lib/pdf-generator";
import type { Client, WorkoutPlan, DayWorkout, Exercise } from "@shared/schema";

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function generateEmptyDays(month: number, year: number): DayWorkout[] {
  const daysCount = getDaysInMonth(month, year);
  return Array.from({ length: daysCount }, (_, i) => ({
    day: i + 1,
    isRestDay: false,
    exercises: [],
    notes: "",
  }));
}

function ExerciseForm({ 
  exercise, 
  onChange, 
  onRemove 
}: { 
  exercise: Exercise; 
  onChange: (exercise: Exercise) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-start justify-between gap-2">
        <Input
          value={exercise.name}
          onChange={(e) => onChange({ ...exercise, name: e.target.value })}
          placeholder="Exercise name"
          className="flex-1 font-medium"
          data-testid={`input-exercise-name-${exercise.id}`}
        />
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive flex-shrink-0"
          data-testid={`button-remove-exercise-${exercise.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Sets</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={exercise.sets}
            onChange={(e) => onChange({ ...exercise, sets: parseInt(e.target.value) || 1 })}
            data-testid={`input-exercise-sets-${exercise.id}`}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Reps</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={exercise.reps}
            onChange={(e) => onChange({ ...exercise, reps: parseInt(e.target.value) || 1 })}
            data-testid={`input-exercise-reps-${exercise.id}`}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Rest (sec)</Label>
          <Input
            type="number"
            min={0}
            max={600}
            value={exercise.restSeconds}
            onChange={(e) => onChange({ ...exercise, restSeconds: parseInt(e.target.value) || 0 })}
            data-testid={`input-exercise-rest-${exercise.id}`}
          />
        </div>
      </div>
      <Input
        value={exercise.notes || ""}
        onChange={(e) => onChange({ ...exercise, notes: e.target.value })}
        placeholder="Notes (optional)"
        className="text-sm"
        data-testid={`input-exercise-notes-${exercise.id}`}
      />
    </div>
  );
}

function DayEditor({ 
  day, 
  onChange 
}: { 
  day: DayWorkout; 
  onChange: (day: DayWorkout) => void;
}) {
  const addExercise = () => {
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: "",
      sets: 3,
      reps: 10,
      restSeconds: 60,
      notes: "",
    };
    onChange({
      ...day,
      exercises: [...day.exercises, newExercise],
    });
  };

  const updateExercise = (index: number, exercise: Exercise) => {
    const newExercises = [...day.exercises];
    newExercises[index] = exercise;
    onChange({ ...day, exercises: newExercises });
  };

  const removeExercise = (index: number) => {
    onChange({
      ...day,
      exercises: day.exercises.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            checked={day.isRestDay}
            onCheckedChange={(checked) => onChange({ ...day, isRestDay: checked })}
            data-testid={`switch-rest-day-${day.day}`}
          />
          <Label className="text-sm font-medium">Rest Day</Label>
        </div>
        {day.exercises.length > 0 && (
          <Badge variant="secondary">
            {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {!day.isRestDay && (
        <>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {day.exercises.map((exercise, index) => (
                <ExerciseForm
                  key={exercise.id}
                  exercise={exercise}
                  onChange={(ex) => updateExercise(index, ex)}
                  onRemove={() => removeExercise(index)}
                />
              ))}
            </div>
          </ScrollArea>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={addExercise}
            data-testid={`button-add-exercise-day-${day.day}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </>
      )}

      <div>
        <Label className="text-sm text-muted-foreground">Day Notes</Label>
        <Textarea
          value={day.notes || ""}
          onChange={(e) => onChange({ ...day, notes: e.target.value })}
          placeholder="Optional notes for this day..."
          className="mt-1"
          data-testid={`textarea-day-notes-${day.day}`}
        />
      </div>
    </div>
  );
}

export default function WorkoutPlanBuilder() {
  const params = useParams<{ id?: string }>();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const clientIdFromUrl = searchParams.get('clientId');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = params.id && params.id !== "new";

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedDay, setSelectedDay] = useState(1);
  const [planName, setPlanName] = useState("");
  const [clientId, setClientId] = useState(clientIdFromUrl || "");
  const [days, setDays] = useState<DayWorkout[]>([]);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<number | null>(null);
  const [copyTargetDays, setCopyTargetDays] = useState<number[]>([]);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: existingPlan, isLoading: planLoading } = useQuery<WorkoutPlan>({
    queryKey: ['/api/workout-plans', params.id],
    enabled: !!isEditing,
  });

  const selectedClient = clients.find(c => c.id === clientId);

  useEffect(() => {
    if (existingPlan) {
      setPlanName(existingPlan.name);
      setClientId(existingPlan.clientId);
      setSelectedMonth(existingPlan.month);
      setSelectedYear(existingPlan.year);
      setDays(existingPlan.days);
    } else if (!isEditing) {
      setDays(generateEmptyDays(selectedMonth, selectedYear));
    }
  }, [existingPlan, isEditing, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!isEditing && days.length !== getDaysInMonth(selectedMonth, selectedYear)) {
      setDays(generateEmptyDays(selectedMonth, selectedYear));
      setSelectedDay(1);
    }
  }, [selectedMonth, selectedYear, isEditing]);

  const createMutation = useMutation({
    mutationFn: async (data: Omit<WorkoutPlan, 'id'>) => {
      const response = await apiRequest('POST', '/api/workout-plans', data);
      return response.json();
    },
    onSuccess: (newPlan: WorkoutPlan) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workout-plans'] });
      toast({
        title: "Workout plan created",
        description: "The workout plan has been saved successfully.",
      });
      setLocation(`/clients/${newPlan.clientId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create workout plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Omit<WorkoutPlan, 'id'>) => {
      const response = await apiRequest('PATCH', `/api/workout-plans/${params.id}`, data);
      return response.json();
    },
    onSuccess: (updatedPlan: WorkoutPlan) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workout-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workout-plans', params.id] });
      toast({
        title: "Workout plan updated",
        description: "Your changes have been saved.",
      });
      setLocation(`/clients/${updatedPlan.clientId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update workout plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!clientId) {
      toast({
        title: "Select a client",
        description: "Please select a client for this workout plan.",
        variant: "destructive",
      });
      return;
    }

    if (!planName.trim()) {
      toast({
        title: "Enter a plan name",
        description: "Please provide a name for this workout plan.",
        variant: "destructive",
      });
      return;
    }

    const planData = {
      clientId,
      name: planName,
      month: selectedMonth,
      year: selectedYear,
      days,
    };

    if (isEditing) {
      updateMutation.mutate(planData);
    } else {
      createMutation.mutate(planData);
    }
  };

  const handleExportPDF = () => {
    if (!selectedClient) return;
    const plan: WorkoutPlan = {
      id: params.id || 'temp',
      clientId,
      name: planName,
      month: selectedMonth,
      year: selectedYear,
      days,
    };
    const doc = generateWorkoutPDF(selectedClient, plan);
    downloadPDF(doc, `${selectedClient.name.replace(/\s+/g, '_')}_workout_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}.pdf`);
  };

  const handleShareWhatsApp = () => {
    if (!selectedClient) return;
    const message = `Hi ${selectedClient.name}!\n\nYour Workout Plan for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} is ready!\n\nPlan: ${planName}\n\nContact me for any questions.\n\n- Your Trainer`;
    shareToWhatsApp(message, selectedClient.phone);
  };

  const handleDayChange = (updatedDay: DayWorkout) => {
    const newDays = [...days];
    const index = newDays.findIndex(d => d.day === updatedDay.day);
    if (index !== -1) {
      newDays[index] = updatedDay;
      setDays(newDays);
    }
  };

  const openCopyDialog = (sourceDay: number) => {
    setCopySourceDay(sourceDay);
    setCopyTargetDays([]);
    setCopyDialogOpen(true);
  };

  const handleCopyToSelectedDays = () => {
    if (copySourceDay === null) return;
    const sourceData = days.find(d => d.day === copySourceDay);
    if (!sourceData) return;

    const newDays = days.map(d => {
      if (copyTargetDays.includes(d.day)) {
        return {
          ...d,
          isRestDay: sourceData.isRestDay,
          exercises: sourceData.exercises.map(e => ({ ...e, id: crypto.randomUUID() })),
          notes: sourceData.notes,
        };
      }
      return d;
    });
    setDays(newDays);
    setCopyDialogOpen(false);
    toast({
      title: "Copied successfully",
      description: `Day ${copySourceDay} copied to ${copyTargetDays.length} day(s).`,
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const currentDay = days.find(d => d.day === selectedDay);

  if (isEditing && planLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation(clientId ? `/clients/${clientId}` : '/clients')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Dumbbell className="h-7 w-7 text-primary" />
              {isEditing ? "Edit Workout Plan" : "New Workout Plan"}
            </h1>
            <p className="text-muted-foreground">
              Create a customized workout routine for each day.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedClient && (
            <>
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                data-testid="button-export-pdf"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button 
                variant="outline"
                onClick={handleShareWhatsApp}
                className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                data-testid="button-share-whatsapp"
              >
                <Share2 className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </>
          )}
          <Button onClick={handleSave} disabled={isPending} data-testid="button-save-plan">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Plan Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>Configure the basic settings for this workout plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId} disabled={!!clientIdFromUrl}>
                <SelectTrigger className="mt-1" data-testid="select-client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan Name</Label>
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., Muscle Building Program"
                className="mt-1"
                data-testid="input-plan-name"
              />
            </div>
            <div>
              <Label>Month</Label>
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
                disabled={isEditing}
              >
                <SelectTrigger className="mt-1" data-testid="select-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(v) => setSelectedYear(parseInt(v))}
                disabled={isEditing}
              >
                <SelectTrigger className="mt-1" data-testid="select-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar + Day Editor */}
      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* Calendar View */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (selectedMonth === 1) {
                      setSelectedMonth(12);
                      setSelectedYear(y => y - 1);
                    } else {
                      setSelectedMonth(m => m - 1);
                    }
                  }}
                  disabled={isEditing}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (selectedMonth === 12) {
                      setSelectedMonth(1);
                      setSelectedYear(y => y + 1);
                    } else {
                      setSelectedMonth(m => m + 1);
                    }
                  }}
                  disabled={isEditing}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before first day of month */}
              {Array.from({ length: new Date(selectedYear, selectedMonth - 1, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {/* Day cells */}
              {days.map((day) => {
                const hasExercises = day.exercises.length > 0;
                const isSelected = selectedDay === day.day;
                return (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`
                      aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 transition-all
                      ${isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-transparent hover:border-muted-foreground/20'
                      }
                      ${day.isRestDay ? 'bg-muted/50' : ''}
                    `}
                    data-testid={`button-day-${day.day}`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                      {day.day}
                    </span>
                    {day.isRestDay ? (
                      <span className="text-[10px] text-muted-foreground">REST</span>
                    ) : hasExercises ? (
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Has exercises</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded bg-muted" />
                <span>Rest day</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Day {selectedDay}</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openCopyDialog(selectedDay)}
                disabled={!currentDay || (currentDay.exercises.length === 0 && !currentDay.isRestDay)}
                data-testid="button-copy-day"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to...
              </Button>
            </div>
            <CardDescription>
              {currentDay?.isRestDay 
                ? "This is a rest day" 
                : `${currentDay?.exercises.length || 0} exercises scheduled`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentDay && (
              <DayEditor day={currentDay} onChange={handleDayChange} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Copy Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Day {copySourceDay} to Other Days</DialogTitle>
            <DialogDescription>
              Select the days you want to copy this workout to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-7 gap-2 py-4">
            {days.map((day) => {
              if (day.day === copySourceDay) return null;
              const isSelected = copyTargetDays.includes(day.day);
              return (
                <button
                  key={day.day}
                  onClick={() => {
                    if (isSelected) {
                      setCopyTargetDays(copyTargetDays.filter(d => d !== day.day));
                    } else {
                      setCopyTargetDays([...copyTargetDays, day.day]);
                    }
                  }}
                  className={`
                    aspect-square rounded-lg border-2 flex items-center justify-center transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-muted hover:border-primary/50'
                    }
                  `}
                >
                  {isSelected ? <Check className="h-4 w-4" /> : day.day}
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopyToSelectedDays} disabled={copyTargetDays.length === 0}>
              Copy to {copyTargetDays.length} day{copyTargetDays.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
