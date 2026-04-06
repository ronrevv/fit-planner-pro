import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dumbbell,
  Utensils,
  Plus,
  Search,
  BookOpen,
  LayoutGrid,
  AlertCircle,
  ChevronRight,
  Send,
  Sparkles,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/hooks/use-app-context";
import type { LibraryItem, Client } from "@shared/schema";
import { useState, useMemo } from "react";
import { EXERCISES_LIST } from "@/lib/exercises";
import { MEAL_DATABASE } from "@/lib/meals";
import { Badge } from "@/components/ui/badge";

export default function SharedLibrary() {
  const { activeGym, activeTrainer } = useAppContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("exercises");
  const [search, setSearch] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [assignItem, setAssignItem] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState("");

  const { data: gymItems, isLoading: isGymLoading } = useQuery<LibraryItem[]>({
    queryKey: [`/api/library?gymId=${activeGym?.id}`],
    enabled: !!activeGym
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: [`/api/clients?trainerId=${activeTrainer?.id}`],
    enabled: !!activeTrainer
  });

  const addItemMutation = useMutation({
    mutationFn: async () => {
      if (!activeGym) return;
      const res = await apiRequest("POST", "/api/library", {
        gymId: activeGym.id,
        name: newItemName,
        type: activeTab === "exercises" ? "exercise" : "meal",
        data: {}
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/library?gymId=${activeGym?.id}`] });
      setNewItemName("");
      setIsAddDialogOpen(false);
      toast({ title: "Item added to library" });
    }
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClientId || !assignItem) return;

      const payload = {
        clientId: selectedClientId,
        title: `Recommended: ${assignItem.name}`,
        type: "link",
        url: "#",
        description: `This ${assignItem.type || 'template'} was referred to you by your trainer from the gym library.`
      };

      const res = await apiRequest("POST", `/api/clients/${selectedClientId}/resources`, payload);
      if (!res.ok) throw new Error("Failed to assign item");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Successfully Assigned",
        description: `${assignItem.name} has been referred to ${clients?.find(c => c.id === selectedClientId)?.name}.`
      });
      setAssignItem(null);
      setSelectedClientId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Merge System and Gym items
  const allExercises = useMemo(() => {
    const system = EXERCISES_LIST.flatMap(cat =>
      cat.items.map(name => ({
        id: `sys-${name}`,
        name,
        type: 'exercise',
        category: cat.category,
        isSystem: true
      }))
    );
    const gym = (gymItems || []).filter(i => i.type === 'exercise').map(i => ({
      ...i,
      category: 'Gym Custom',
      isSystem: false
    }));
    return [...system, ...gym];
  }, [gymItems]);

  const allMeals = useMemo(() => {
    const system = MEAL_DATABASE.map(meal => ({
      ...meal,
      id: `sys-${meal.name}`,
      category: meal.type.replace('_', ' '),
      isSystem: true
    }));
    const gym = (gymItems || []).filter(i => i.type === 'meal').map(i => ({
      ...i,
      category: 'Gym Custom',
      isSystem: false
    }));
    return [...system, ...gym];
  }, [gymItems]);

  const filteredItems = useMemo(() => {
    const currentList = activeTab === "exercises" ? allExercises : allMeals;
    return currentList.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item as any).category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeTab, allExercises, allMeals, search]);

  if (!activeGym) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 animate-in fade-in duration-500">
        <div className="p-4 rounded-full bg-amber-100">
          <AlertCircle className="h-10 w-10 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold">No Gym Selected</h2>
        <p className="text-muted-foreground">Please select a gym in the dashboard to view its library.</p>
        <Button asChild className="font-bold">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
            <BookOpen className="h-4 w-4" />
            <span>{activeGym.name} Multi-tenant Resources</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Shared Library</h1>
          <p className="text-muted-foreground text-lg italic">Standardized templates for your entire training staff.</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
              <span>Add Gym Item</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom {activeTab === "exercises" ? "Exercise" : "Meal"}</DialogTitle>
              <DialogDescription>This item will be available to all trainers in {activeGym.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Item Name</p>
                <Input
                  placeholder="e.g. Advanced Deadlift Variant"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>
              <Button
                className="w-full h-11 font-bold"
                onClick={() => addItemMutation.mutate()}
                disabled={!newItemName || addItemMutation.isPending}
              >
                {addItemMutation.isPending ? "Adding..." : "Confirm Add"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-72 space-y-8">
          <div className="space-y-4">
             <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-9 h-11 bg-muted/50 border-none focus-visible:ring-primary shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1">
                <TabsTrigger value="exercises" className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
                  <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                  Exercises
                </TabsTrigger>
                <TabsTrigger value="meals" className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
                  <Utensils className="h-4 w-4 mr-2 text-primary" />
                  Meals
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Card className="border-none bg-primary/5 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-widest">Library Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium">Standard Library</span>
                  <Badge variant="outline" className="bg-background">{activeTab === 'exercises' ? EXERCISES_LIST.reduce((acc, c) => acc + c.items.length, 0) : MEAL_DATABASE.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium">Gym Custom</span>
                  <Badge variant="outline" className="bg-background">{gymItems?.filter(i => i.type === (activeTab === 'exercises' ? 'exercise' : 'meal')).length || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2">
              <div className="flex items-center gap-2 text-orange-600">
                <Zap className="h-4 w-4 fill-current" />
                <span className="text-sm font-bold uppercase tracking-tight">Quick Pro Tip</span>
              </div>
              <p className="text-xs text-orange-700/80 leading-relaxed font-medium">
                Standard items are verified by our team. Custom items are added by your gym admins.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {isGymLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map(item => (
                <Card key={item.id} className="hover-elevate transition-all border-none shadow-lg overflow-hidden group flex flex-col">
                  <CardHeader className="pb-3 relative">
                    <div className="absolute top-4 right-4">
                      {item.isSystem ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">System</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Gym</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold pr-16">{item.name}</CardTitle>
                    <CardDescription className="font-bold text-primary/70 text-xs uppercase tracking-widest flex items-center gap-1">
                       <LayoutGrid className="h-3 w-3" />
                       {(item as any).category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
                      {(item as any).description || `A standardized ${(item as any).category.toLowerCase()} template for trainers.`}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 pb-6 px-6">
                    <Button
                      className="w-full h-11 font-bold gap-2 group shadow-md"
                      onClick={() => setAssignItem(item)}
                    >
                      <Send className="h-4 w-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                      Refer to Client
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
              <div className="p-6 rounded-full bg-muted shadow-inner">
                <LayoutGrid className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">No templates found</h3>
                <p className="text-muted-foreground max-w-sm font-medium">Try adjusting your search or add a new custom item for your gym.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Dialog */}
      <Dialog open={!!assignItem} onOpenChange={(open) => !open && setAssignItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="h-5 w-5 fill-current" />
              <span className="font-black uppercase tracking-widest text-xs">Smart Referral</span>
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Refer Template</DialogTitle>
            <DialogDescription className="font-medium">
              Directly assign <span className="text-primary font-bold">{assignItem?.name}</span> to a client in {activeGym.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Select Target Client</p>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="h-14 text-lg font-bold">
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients?.length ? (
                    clients.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-lg font-medium">{c.name}</SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground font-bold">No clients found for this trainer.</p>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl space-y-2">
               <div className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground">
                 <Zap className="h-3 w-3" />
                 <span>What happens next?</span>
               </div>
               <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                 Referring an item will add it to the client's resource feed and notify them in their portal. Trainers from your gym can quickly reuse these templates to save time.
               </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full h-14 text-lg font-black uppercase tracking-tight shadow-xl shadow-primary/20"
              onClick={() => assignMutation.mutate()}
              disabled={!selectedClientId || assignMutation.isPending}
            >
              {assignMutation.isPending ? "Referencing..." : "Confirm Referral"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
