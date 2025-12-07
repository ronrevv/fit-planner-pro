import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, useSearch } from "wouter";
import { 
  ArrowLeft, Save, Loader2, Utensils, Plus, Trash2, Calendar, 
  ChevronLeft, ChevronRight, Download, Share2, Copy, Check, Droplets, Wand2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
import { generateDietPDF, downloadPDF, shareToWhatsApp } from "@/lib/pdf-generator";
import { generateDailyMeals } from "@/lib/meals";
import type { Client, DietPlan, DayDiet, Meal } from "@shared/schema";
import { mealTypeLabels } from "@shared/schema";

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MEAL_TYPES = ['breakfast', 'snack_morning', 'lunch', 'snack_afternoon', 'dinner'] as const;

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function generateEmptyDays(month: number, year: number): DayDiet[] {
  const daysCount = getDaysInMonth(month, year);
  return Array.from({ length: daysCount }, (_, i) => ({
    day: i + 1,
    meals: [],
    waterIntake: 2,
    notes: "",
  }));
}

function MealForm({ 
  meal, 
  onChange, 
  onRemove 
}: { 
  meal: Meal; 
  onChange: (meal: Meal) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-start justify-between gap-2">
        <Select value={meal.type} onValueChange={(v) => onChange({ ...meal, type: v as Meal['type'] })}>
          <SelectTrigger className="w-40" data-testid={`select-meal-type-${meal.id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEAL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {mealTypeLabels[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive flex-shrink-0"
          data-testid={`button-remove-meal-${meal.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Input
        value={meal.name}
        onChange={(e) => onChange({ ...meal, name: e.target.value })}
        placeholder="Food/meal name"
        className="font-medium"
        data-testid={`input-meal-name-${meal.id}`}
      />
      <div className="grid grid-cols-4 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Calories</Label>
          <Input
            type="number"
            min={0}
            max={3000}
            value={meal.calories}
            onChange={(e) => onChange({ ...meal, calories: parseInt(e.target.value) || 0 })}
            data-testid={`input-meal-calories-${meal.id}`}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Protein (g)</Label>
          <Input
            type="number"
            min={0}
            max={300}
            value={meal.protein}
            onChange={(e) => onChange({ ...meal, protein: parseInt(e.target.value) || 0 })}
            data-testid={`input-meal-protein-${meal.id}`}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Carbs (g)</Label>
          <Input
            type="number"
            min={0}
            max={500}
            value={meal.carbs}
            onChange={(e) => onChange({ ...meal, carbs: parseInt(e.target.value) || 0 })}
            data-testid={`input-meal-carbs-${meal.id}`}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Fat (g)</Label>
          <Input
            type="number"
            min={0}
            max={200}
            value={meal.fat}
            onChange={(e) => onChange({ ...meal, fat: parseInt(e.target.value) || 0 })}
            data-testid={`input-meal-fat-${meal.id}`}
          />
        </div>
      </div>
      <Input
        value={meal.description || ""}
        onChange={(e) => onChange({ ...meal, description: e.target.value })}
        placeholder="Description (optional)"
        className="text-sm"
        data-testid={`input-meal-description-${meal.id}`}
      />
    </div>
  );
}

function DayEditor({ 
  day, 
  onChange,
  targetCalories
}: { 
  day: DayDiet; 
  onChange: (day: DayDiet) => void;
  targetCalories?: number;
}) {
  const totalCalories = day.meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = day.meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = day.meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = day.meals.reduce((sum, m) => sum + m.fat, 0);

  const addMeal = () => {
    const newMeal: Meal = {
      id: crypto.randomUUID(),
      type: "breakfast",
      name: "",
      description: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    onChange({
      ...day,
      meals: [...day.meals, newMeal],
    });
  };

  const generateMeals = () => {
    const meals = generateDailyMeals(targetCalories || 2000).map(m => ({
      ...m,
      id: crypto.randomUUID()
    }));
    onChange({
      ...day,
      meals: [...day.meals, ...meals]
    });
  };

  const updateMeal = (index: number, meal: Meal) => {
    const newMeals = [...day.meals];
    newMeals[index] = meal;
    onChange({ ...day, meals: newMeals });
  };

  const removeMeal = (index: number) => {
    onChange({
      ...day,
      meals: day.meals.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      {/* Daily Totals */}
      {day.meals.length > 0 && (
        <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{totalCalories}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{totalProtein}g</p>
            <p className="text-xs text-muted-foreground">protein</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{totalCarbs}g</p>
            <p className="text-xs text-muted-foreground">carbs</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{totalFat}g</p>
            <p className="text-xs text-muted-foreground">fat</p>
          </div>
        </div>
      )}

      {/* Water Intake */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            Water Intake
          </Label>
          <span className="text-sm font-medium">{day.waterIntake}L</span>
        </div>
        <Slider
          value={[day.waterIntake]}
          onValueChange={([v]) => onChange({ ...day, waterIntake: v })}
          min={0}
          max={10}
          step={0.5}
          className="py-2"
          data-testid={`slider-water-intake-${day.day}`}
        />
      </div>

      {/* Meals */}
      <ScrollArea className="h-[350px] pr-4">
        <div className="space-y-3">
          {day.meals
            .sort((a, b) => MEAL_TYPES.indexOf(a.type) - MEAL_TYPES.indexOf(b.type))
            .map((meal, index) => (
              <MealForm
                key={meal.id}
                meal={meal}
                onChange={(m) => updateMeal(day.meals.findIndex(x => x.id === meal.id), m)}
                onRemove={() => removeMeal(day.meals.findIndex(x => x.id === meal.id))}
              />
            ))}
        </div>
      </ScrollArea>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={addMeal}
          data-testid={`button-add-meal-day-${day.day}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Meal
        </Button>
        <Button
          variant="outline"
          onClick={generateMeals}
          data-testid={`button-generate-meals-${day.day}`}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Auto Generate
        </Button>
      </div>

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

export default function DietPlanBuilder() {
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
  const [targetCalories, setTargetCalories] = useState(2000);
  const [clientId, setClientId] = useState(clientIdFromUrl || "");
  const [days, setDays] = useState<DayDiet[]>([]);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<number | null>(null);
  const [copyTargetDays, setCopyTargetDays] = useState<number[]>([]);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: existingPlan, isLoading: planLoading } = useQuery<DietPlan>({
    queryKey: ['/api/diet-plans', params.id],
    enabled: !!isEditing,
  });

  const selectedClient = clients.find(c => c.id === clientId);

  useEffect(() => {
    if (existingPlan) {
      setPlanName(existingPlan.name);
      setClientId(existingPlan.clientId);
      setSelectedMonth(existingPlan.month);
      setSelectedYear(existingPlan.year);
      setTargetCalories(existingPlan.targetCalories);
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
    mutationFn: async (data: Omit<DietPlan, 'id'>) => {
      const response = await apiRequest('POST', '/api/diet-plans', data);
      return response.json();
    },
    onSuccess: (newPlan: DietPlan) => {
      queryClient.invalidateQueries({ queryKey: ['/api/diet-plans'] });
      toast({
        title: "Diet plan created",
        description: "The diet plan has been saved successfully.",
      });
      setLocation(`/clients/${newPlan.clientId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create diet plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Omit<DietPlan, 'id'>) => {
      const response = await apiRequest('PATCH', `/api/diet-plans/${params.id}`, data);
      return response.json();
    },
    onSuccess: (updatedPlan: DietPlan) => {
      queryClient.invalidateQueries({ queryKey: ['/api/diet-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/diet-plans', params.id] });
      toast({
        title: "Diet plan updated",
        description: "Your changes have been saved.",
      });
      setLocation(`/clients/${updatedPlan.clientId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update diet plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!clientId) {
      toast({
        title: "Select a client",
        description: "Please select a client for this diet plan.",
        variant: "destructive",
      });
      return;
    }

    if (!planName.trim()) {
      toast({
        title: "Enter a plan name",
        description: "Please provide a name for this diet plan.",
        variant: "destructive",
      });
      return;
    }

    const planData = {
      clientId,
      name: planName,
      month: selectedMonth,
      year: selectedYear,
      targetCalories,
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
    const plan: DietPlan = {
      id: params.id || 'temp',
      clientId,
      name: planName,
      month: selectedMonth,
      year: selectedYear,
      targetCalories,
      days,
    };
    const doc = generateDietPDF(selectedClient, plan);
    downloadPDF(doc, `${selectedClient.name.replace(/\s+/g, '_')}_diet_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}.pdf`);
  };

  const handleShareWhatsApp = () => {
    if (!selectedClient) return;
    const message = `Hi ${selectedClient.name}!\n\nYour Diet Plan for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} is ready!\n\nPlan: ${planName}\nTarget: ${targetCalories} calories/day\n\nContact me for any questions.\n\n- Your Trainer`;
    shareToWhatsApp(message, selectedClient.phone);
  };

  const handleDayChange = (updatedDay: DayDiet) => {
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
          meals: sourceData.meals.map(m => ({ ...m, id: crypto.randomUUID() })),
          waterIntake: sourceData.waterIntake,
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
              <Utensils className="h-7 w-7 text-green-600" />
              {isEditing ? "Edit Diet Plan" : "New Diet Plan"}
            </h1>
            <p className="text-muted-foreground">
              Create a customized meal plan for each day.
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
          <CardDescription>Configure the basic settings for this diet plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                placeholder="e.g., Weight Loss Diet"
                className="mt-1"
                data-testid="input-plan-name"
              />
            </div>
            <div>
              <Label>Target Calories/Day</Label>
              <Input
                type="number"
                min={1000}
                max={5000}
                value={targetCalories}
                onChange={(e) => setTargetCalories(parseInt(e.target.value) || 2000)}
                className="mt-1"
                data-testid="input-target-calories"
              />
            </div>
            <div>
              <Label>Month</Label>
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
                disabled={!!isEditing}
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
                disabled={!!isEditing}
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
                <Calendar className="h-5 w-5 text-green-600" />
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
                  disabled={!!isEditing}
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
                  disabled={!!isEditing}
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
                const totalCalories = day.meals.reduce((sum, m) => sum + m.calories, 0);
                const hasMeals = day.meals.length > 0;
                const isSelected = selectedDay === day.day;
                const caloriePercent = targetCalories > 0 ? (totalCalories / targetCalories) * 100 : 0;
                
                return (
                  <button
                    type="button"
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`
                      aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 transition-all
                      ${isSelected 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-transparent hover:border-muted-foreground/20'
                      }
                    `}
                    data-testid={`button-day-${day.day}`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-green-600' : ''}`}>
                      {day.day}
                    </span>
                    {hasMeals && (
                      <div 
                        className={`text-[9px] font-mono ${
                          caloriePercent >= 90 && caloriePercent <= 110 
                            ? 'text-green-600' 
                            : caloriePercent > 110 
                              ? 'text-red-500' 
                              : 'text-muted-foreground'
                        }`}
                      >
                        {totalCalories}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-mono">1800</span>
                <span>On target</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-red-500 font-mono">2500</span>
                <span>Over target</span>
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
                disabled={!currentDay || currentDay.meals.length === 0}
                data-testid="button-copy-day"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to...
              </Button>
            </div>
            <CardDescription>
              {currentDay?.meals.length || 0} meal{(currentDay?.meals.length || 0) !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentDay && (
              <DayEditor
                day={currentDay}
                onChange={handleDayChange}
                targetCalories={targetCalories}
              />
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
              Select the days you want to copy this meal plan to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-7 gap-2 py-4">
            {days.map((day) => {
              if (day.day === copySourceDay) return null;
              const isSelected = copyTargetDays.includes(day.day);
              return (
                <button
                  type="button"
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
                      ? 'border-green-500 bg-green-500 text-white' 
                      : 'border-muted hover:border-green-500/50'
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
