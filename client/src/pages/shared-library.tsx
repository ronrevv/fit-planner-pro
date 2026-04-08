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
  Send,
  Sparkles,
  Zap,
  Filter,
  CheckSquare,
  Square,
  Loader2
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
import {
  Checkbox
} from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/hooks/use-app-context";
import type { LibraryItem, Client } from "@shared/schema";
import { useState, useMemo, useEffect, useRef } from "react";
import { FULL_EXERCISES_DATA } from "../../../shared/exercises-data";
import { MEAL_DATABASE } from "@/lib/meals";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 20;

export default function SharedLibrary() {
  const { activeGym, activeTrainer } = useAppContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("exercises");
  const [search, setSearch] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [assignItem, setAssignItem] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState("");

  // Filtering states
  const [targetFilter, setTargetFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");

  // Checkbox/Bulk states
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Lazy loading state
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerTarget = useRef(null);

  const { data: gymItems, isLoading: isGymLoading } = useQuery<LibraryItem[]>({
    queryKey: [`/api/library?gymId=${activeGym?.id}`],
    enabled: !!activeGym
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: [`/api/clients?trainerId=${activeTrainer?.id}`],
    enabled: !!activeTrainer
  });

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [search, targetFilter, equipmentFilter, activeTab]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + ITEMS_PER_PAGE);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [observerTarget]);

  const allExercises = useMemo(() => {
    const system = FULL_EXERCISES_DATA.map(ex => ({
      ...ex,
      type: 'exercise',
      isSystem: true
    }));
    const gym = (gymItems || []).filter(i => i.type === 'exercise').map(i => ({
      ...i,
      target: i.data?.target || 'custom',
      equipment: i.data?.equipment || 'custom',
      videoUrl: i.data?.videoUrl,
      isSystem: false
    }));
    return [...gym, ...system];
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
    return [...gym, ...system];
  }, [gymItems]);

  const filteredItems = useMemo(() => {
    const currentList = activeTab === "exercises" ? allExercises : allMeals;
    return currentList.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item as any).category?.toLowerCase().includes(search.toLowerCase()) ||
        (item as any).target?.toLowerCase().includes(search.toLowerCase());

      const matchesTarget = targetFilter === "all" || (item as any).target === targetFilter;
      const matchesEquipment = equipmentFilter === "all" || (item as any).equipment === equipmentFilter;

      return matchesSearch && matchesTarget && matchesEquipment;
    });
  }, [activeTab, allExercises, allMeals, search, targetFilter, equipmentFilter]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Unique filter options
  const targets = useMemo(() => {
    const set = new Set(allExercises.map(ex => ex.target));
    return Array.from(set).sort();
  }, [allExercises]);

  const equipments = useMemo(() => {
    const set = new Set(allExercises.map(ex => ex.equipment));
    return Array.from(set).sort();
  }, [allExercises]);

  const bulkAddMutation = useMutation({
    mutationFn: async () => {
      if (!activeGym || selectedItemIds.size === 0) return;

      const itemsToAdd = Array.from(selectedItemIds).map(id => {
        const source = activeTab === "exercises" ? allExercises : allMeals;
        const item = source.find(i => i.id === id);
        return {
          gymId: activeGym.id,
          name: item?.name,
          type: activeTab === "exercises" ? "exercise" : "meal",
          data: item
        };
      });

      // API request for bulk add
      for (const item of itemsToAdd) {
        await apiRequest("POST", "/api/library", item);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/library?gymId=${activeGym?.id}`] });
      setSelectedItemIds(new Set());
      toast({ title: "Selected items added to your gym library" });
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
        description: `This ${assignItem.type || 'template'} was referred to you by your trainer.`
      };
      const res = await apiRequest("POST", `/api/clients/${selectedClientId}/resources`, payload);
      if (!res.ok) throw new Error("Failed to assign item");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Successfully Assigned" });
      setAssignItem(null);
      setSelectedClientId("");
    }
  });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedItemIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItemIds(next);
  };

  if (!activeGym) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-amber-500" />
        <h2 className="text-2xl font-bold">No Gym Selected</h2>
        <Button asChild><Link href="/">Go to Dashboard</Link></Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
            <BookOpen className="h-4 w-4" />
            <span>FitPro Enterprise Library</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase">{activeGym.name} Shared Assets</h1>
          <p className="text-muted-foreground text-lg font-medium italic">Standardized high-performance templates with real-time video previews.</p>
        </div>

        <div className="flex gap-3">
          {selectedItemIds.size > 0 && (
            <Button
              variant="default"
              className="font-bold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 animate-in slide-in-from-right"
              onClick={() => bulkAddMutation.mutate()}
              disabled={bulkAddMutation.isPending}
            >
              {bulkAddMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Import {selectedItemIds.size} to Gym
            </Button>
          )}
          <Button variant="outline" className="font-bold border-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Custom Item
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 space-y-6">
          <div className="sticky top-20 space-y-6">
            <div className="relative group">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search exercises..."
                className="pl-10 h-12 bg-card border-2 focus-visible:ring-primary shadow-sm text-lg font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="exercises" className="data-[state=active]:bg-background data-[state=active]:shadow-md font-black uppercase text-xs tracking-widest">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Exercises
                </TabsTrigger>
                <TabsTrigger value="meals" className="data-[state=active]:bg-background data-[state=active]:shadow-md font-black uppercase text-xs tracking-widest">
                  <Utensils className="h-4 w-4 mr-2" />
                  Meals
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === "exercises" && (
              <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Filter className="h-4 w-4" />
                    <CardTitle className="text-xs font-black uppercase tracking-widest">Advanced Filters</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Target Muscle</label>
                    <Select value={targetFilter} onValueChange={setTargetFilter}>
                      <SelectTrigger className="h-11 font-bold border-2 bg-background">
                        <SelectValue placeholder="All Muscles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-bold">All Muscles</SelectItem>
                        {targets.map(t => <SelectItem key={t} value={t} className="font-medium capitalize">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Equipment</label>
                    <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                      <SelectTrigger className="h-11 font-bold border-2 bg-background">
                        <SelectValue placeholder="All Equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-bold">All Equipment</SelectItem>
                        {equipments.map(e => <SelectItem key={e} value={e} className="font-medium capitalize">{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="p-5 rounded-2xl bg-primary text-primary-foreground shadow-2xl space-y-3">
               <div className="flex items-center gap-2">
                 <Sparkles className="h-5 w-5 fill-current" />
                 <span className="font-black uppercase tracking-widest text-xs">Gym Exclusive</span>
               </div>
               <p className="text-xs leading-relaxed font-medium opacity-90">
                 Adding items to your gym library allows all trainers in your facility to access them instantly during plan building.
               </p>
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Badge variant="outline" className="text-[10px] font-black h-6">{filteredItems.length} RESULTS</Badge>
               {selectedItemIds.size > 0 && (
                 <Badge className="text-[10px] font-black h-6 bg-orange-600">{selectedItemIds.size} SELECTED</Badge>
               )}
             </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map(item => {
              const isSelected = selectedItemIds.has(item.id);
              const videoUrl = (item as any).videoUrl;
              return (
                <Card
                  key={item.id}
                  className={`hover-elevate transition-all border-none shadow-xl overflow-hidden group flex flex-col relative ${isSelected ? 'ring-2 ring-orange-600' : ''}`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-lg ${isSelected ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(item.id);
                      }}
                    >
                      {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                    </Button>
                  </div>

                  <div className="aspect-video w-full bg-muted relative overflow-hidden group-hover:shadow-inner transition-all">
                    {videoUrl ? (
                      <img
                        src={videoUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                        <Dumbbell className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Zap className="h-8 w-8 text-white animate-pulse" />
                    </div>
                  </div>

                  <CardHeader className="pb-3 pt-6">
                    <div className="flex justify-between items-start gap-2">
                       <CardTitle className="text-xl font-black uppercase tracking-tight line-clamp-1">{item.name}</CardTitle>
                       {item.isSystem ? (
                         <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[9px] font-black border-none uppercase tracking-tighter">System</Badge>
                       ) : (
                         <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-[9px] font-black border-none uppercase tracking-tighter">Gym</Badge>
                       )}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-primary/20 text-primary/70">{(item as any).target || (item as any).category}</Badge>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-muted-foreground/20 italic">{(item as any).equipment}</Badge>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2 uppercase">
                       Targeting {(item as any).target || 'full body'} using {(item as any).equipment || 'standard equipment'}.
                    </p>
                  </CardContent>

                  <CardFooter className="pt-0 pb-6 px-6">
                    <Button
                      className="w-full h-11 font-black uppercase tracking-widest text-xs gap-2 group shadow-xl shadow-primary/10 rounded-xl"
                      onClick={() => setAssignItem(item)}
                    >
                      <Send className="h-4 w-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                      Refer to Client
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Infinite Scroll Anchor */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {visibleCount < filteredItems.length && (
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-[0.3em]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more power...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referral Dialog - Remains similar but styled */}
      <Dialog open={!!assignItem} onOpenChange={(open) => !open && setAssignItem(null)}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-6 w-6 fill-current" />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Refer Asset</DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground uppercase text-[10px] tracking-[0.2em]">
                Sending <span className="text-primary">{assignItem?.name}</span>
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Assign to Client</label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="h-14 text-lg font-black uppercase border-2 shadow-inner">
                  <SelectValue placeholder="Choose Target..." />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map(c => <SelectItem key={c.id} value={c.id} className="font-bold uppercase text-xs">{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/50 p-4 rounded-2xl border-2 border-dashed border-muted-foreground/10 space-y-2">
               <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase text-center">
                 Client will be notified in their personalized portal instantly.
               </p>
            </div>
          </div>
          <DialogFooter className="px-0">
            <Button
              className="w-full h-14 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30 rounded-2xl"
              onClick={() => assignMutation.mutate()}
              disabled={!selectedClientId || assignMutation.isPending}
            >
              {assignMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5 fill-current" />}
              Execute Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
