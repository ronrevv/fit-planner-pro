import { useState } from "react";
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
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");

  const { data: exercises = [], isLoading } = useQuery<ExerciseLibraryItem[]>({
    queryKey: ['/api/exercises'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<ExerciseLibraryItem, 'id'>) => {
      const response = await apiRequest('POST', '/api/exercises', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
      toast({ title: "Exercise added", description: "Added to global library." });
      setIsAddOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add exercise.", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
      toast({ title: "Exercise deleted" });
    }
  });

  const resetForm = () => {
    setName("");
    setCategory(CATEGORIES[0]);
    setVideoUrl("");
    setDescription("");
  };

  const handleSave = () => {
    if (!name.trim()) return;
    createMutation.mutate({
      name,
      category,
      videoUrl: videoUrl.trim() || undefined,
      description: description.trim() || undefined
    });
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
          <p className="text-muted-foreground">Manage the global list of exercises and videos.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Add Exercise</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Exercise</DialogTitle>
              <DialogDescription>
                Add an exercise to the global library. URL for GIF/Video is recommended.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Exercise Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pushup" />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Video/GIF URL</Label>
                <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." />
                {videoUrl && (
                  <div className="mt-2 aspect-video rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    <img src={videoUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Instructions..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
          filteredExercises.map((ex) => (
            <Card key={ex.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {ex.videoUrl ? (
                  <img src={ex.videoUrl} alt={ex.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 opacity-20" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => {
                      if(confirm('Delete this exercise?')) deleteMutation.mutate(ex.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{ex.name}</CardTitle>
                    <CardDescription>{ex.category}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
