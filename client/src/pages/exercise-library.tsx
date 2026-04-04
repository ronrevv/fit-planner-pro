import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus, Trash2, Video, Search, Image as ImageIcon
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ExerciseLibraryItem } from "@shared/schema";

const CATEGORIES = [
  "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Warmup", "Other"
];

export default function ExerciseLibrary() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  const { data: exercises = [], isLoading } = useQuery<ExerciseLibraryItem[]>({
    queryKey: ['/api/exercises'],
  });

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);
  const paginatedExercises = filteredExercises.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory]);

  const handleAddClick = () => {
    toast({
      title: "Restricted Action",
      description: "Only administrators can add exercises. Please verify your Trainer Certification.",
      variant: "destructive"
    });
  };


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
          <p className="text-muted-foreground">Manage the global list of exercises and videos.</p>
        </div>
        <Button onClick={handleAddClick}><Plus className="h-4 w-4 mr-2" />Add Exercise</Button>

      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : filteredExercises.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No exercises found. Add some to get started.
          </div>
        ) : (
          paginatedExercises.map((ex) => (
            <Card key={ex.id} className="group overflow-hidden border-border/40 hover:border-primary/50 transition-all hover:shadow-lg bg-card">
              <div className="aspect-video bg-white relative overflow-hidden">
                {ex.videoUrl ? (
                  <img 
                    src={ex.videoUrl} 
                    alt={ex.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ImageIcon className="h-10 w-10 opacity-10" />
                    <span className="text-xs font-medium opacity-40">No Visual Guide</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
                   <p className="text-white text-xs line-clamp-2 italic drop-shadow-md">{ex.description || "No description provided."}</p>
                </div>
              </div>
              <CardHeader className="p-4 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{ex.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <CardDescription className="font-medium text-xs uppercase tracking-wider">{ex.category}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6 pb-12">
          <Button 
            variant="outline" 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            disabled={page === totalPages} 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
