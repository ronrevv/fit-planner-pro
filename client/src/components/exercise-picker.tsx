import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, Plus, Dumbbell, HeartPulse, Flame, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  EXERCISE_DATABASE,
  BODY_PARTS,
  INJURY_TYPES,
  getExercisesByBodyPart,
  getExercisesByInjury,
  getWarmupExercises,
  searchExercises,
  getExerciseImageUrl,
  getBodyPart,
  type ExerciseInfo,
  type BodyPart,
  type InjuryType,
} from "@/lib/exercises";

// Image component with GIF-like looping animation between frames
function ExerciseImage({ exercise, size = "md" }: { exercise: ExerciseInfo; size?: "sm" | "md" }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Create GIF-like playback continuously
  useEffect(() => {
    if (exercise.images.length <= 1) return;
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % exercise.images.length);
    }, 1200); 
    return () => clearInterval(interval);
  }, [exercise.images.length]);

  const sizeClasses = size === "sm" ? "w-14 h-14" : "w-full aspect-[4/3]";

  if (error || exercise.images.length === 0) {
    return (
      <div className={cn(sizeClasses, "bg-muted rounded-lg flex items-center justify-center")}>
        <Dumbbell className="h-5 w-5 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className={cn(sizeClasses, "relative rounded-lg overflow-hidden bg-muted group")}>
      <img
        src={getExerciseImageUrl(exercise.images[imgIndex])}
        alt={exercise.name}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}
      {exercise.images.length > 1 && loaded && (
        <div className="absolute bottom-1 right-1 flex gap-0.5">
          <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", imgIndex === 0 ? "bg-white" : "bg-white/40")} />
          <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", imgIndex === 1 ? "bg-white" : "bg-white/40")} />
        </div>
      )}
    </div>
  );
}

// Exercise card for the picker grid
function ExerciseCard({ 
  exercise, 
  onAdd, 
  compact = false 
}: { 
  exercise: ExerciseInfo; 
  onAdd: (exercise: ExerciseInfo) => void;
  compact?: boolean;
}) {
  const [showInfo, setShowInfo] = useState(false);

  const levelColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    expert: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors group">
        <ExerciseImage exercise={exercise} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{exercise.name}</p>
          <p className="text-[10px] text-muted-foreground">{exercise.equipment || "Body only"}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary/10"
          onClick={(e) => { e.stopPropagation(); onAdd(exercise); }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group flex flex-col">
      <div className="relative">
        <ExerciseImage exercise={exercise} size="md" />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className={cn("text-[10px] font-semibold border-none", levelColors[exercise.level])}>
            {exercise.level}
          </Badge>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <Info className="h-3 w-3" />
        </button>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="text-sm font-semibold leading-tight mb-1">{exercise.name}</h4>
        <div className="flex items-center gap-1 mb-2">
          {exercise.equipment && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {exercise.equipment}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">
            {exercise.primaryMuscles[0]}
          </span>
        </div>

        {showInfo && (
          <div className="mb-2 p-2 bg-muted/50 rounded-lg text-[11px] text-muted-foreground space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {exercise.instructions.slice(0, 2).map((step, i) => (
              <p key={i}>• {step}</p>
            ))}
            {exercise.instructions.length > 2 && (
              <p className="text-primary/70 font-medium">+{exercise.instructions.length - 2} more steps</p>
            )}
          </div>
        )}

        <Button
          size="sm"
          className="w-full mt-auto h-8 text-xs font-semibold gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
          onClick={() => onAdd(exercise)}
        >
          <Plus className="h-3 w-3" />
          Add Exercise
        </Button>
      </div>
    </div>
  );
}

// Tab types
type TabType = BodyPart | "Warmup" | "Injury Relief";

interface ExercisePickerProps {
  onAddExercise: (exerciseInfo: ExerciseInfo) => void;
  compact?: boolean;
}

export function ExercisePicker({ onAddExercise, compact = false }: ExercisePickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Chest");
  const [selectedInjury, setSelectedInjury] = useState<InjuryType>("Knock Knee");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const tabs: TabType[] = [...BODY_PARTS, "Warmup", "Injury Relief"];

  const tabIcons: Partial<Record<TabType, React.ReactNode>> = {
    "Warmup": <Flame className="h-3 w-3" />,
    "Injury Relief": <HeartPulse className="h-3 w-3" />,
  };

  const filteredExercises = useMemo(() => {
    if (searchQuery.length > 1) {
      return searchExercises(searchQuery);
    }
    if (activeTab === "Warmup") {
      return getWarmupExercises();
    }
    if (activeTab === "Injury Relief") {
      return getExercisesByInjury(selectedInjury);
    }
    return getExercisesByBodyPart(activeTab as BodyPart);
  }, [activeTab, selectedInjury, searchQuery]);

  const handleAdd = useCallback((exercise: ExerciseInfo) => {
    onAddExercise(exercise);
  }, [onAddExercise]);

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">Exercise Browser</h3>
          <Badge variant="secondary" className="text-[10px]">{EXERCISE_DATABASE.length} exercises</Badge>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm bg-background"
            />
          </div>

          {/* Category tabs */}
          {!searchQuery && (
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1",
                    activeTab === tab
                      ? tab === "Injury Relief"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20"
                        : tab === "Warmup"
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/20"
                        : "bg-primary/10 text-primary ring-1 ring-primary/20"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {tabIcons[tab]}
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Injury sub-tabs */}
          {activeTab === "Injury Relief" && !searchQuery && (
            <div className="flex flex-wrap gap-1">
              {INJURY_TYPES.map((injury) => (
                <button
                  key={injury}
                  onClick={() => setSelectedInjury(injury)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                    selectedInjury === injury
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-300 dark:ring-red-800"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {injury}
                </button>
              ))}
            </div>
          )}

          {/* Exercise grid */}
          <ScrollArea className={compact ? "h-[300px]" : "h-[400px]"}>
            {filteredExercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Dumbbell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No exercises found</p>
              </div>
            ) : compact ? (
              <div className="space-y-1.5 pr-2">
                {filteredExercises.map((ex) => (
                  <ExerciseCard key={ex.id} exercise={ex} onAdd={handleAdd} compact />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
                {filteredExercises.map((ex) => (
                  <ExerciseCard key={ex.id} exercise={ex} onAdd={handleAdd} />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// Inline thumbnail for exercise display in day list
export function ExerciseThumbnail({ exerciseName }: { exerciseName: string }) {
  const exercise = useMemo(() => {
    const lower = exerciseName.toLowerCase();
    return EXERCISE_DATABASE.find(ex => ex.name.toLowerCase() === lower) ||
      EXERCISE_DATABASE.find(ex => lower.includes(ex.name.toLowerCase()) || ex.name.toLowerCase().includes(lower));
  }, [exerciseName]);

  if (!exercise) return null;

  return <ExerciseImage exercise={exercise} size="sm" />;
}
