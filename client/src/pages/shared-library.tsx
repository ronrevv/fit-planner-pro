import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
  AlertCircle
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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/hooks/use-app-context";
import type { LibraryItem } from "@shared/schema";
import { useState } from "react";

export default function SharedLibrary() {
  const { activeGym } = useAppContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("exercises");
  const [search, setSearch] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: items, isLoading } = useQuery<LibraryItem[]>({
    queryKey: [`/api/library?gymId=${activeGym?.id}`],
    enabled: !!activeGym
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
      setIsDialogOpen(false);
      toast({ title: "Item added to library" });
    }
  });

  const filteredItems = items?.filter(item =>
    item.type === (activeTab === "exercises" ? "exercise" : "meal") &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!activeGym) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 animate-in fade-in duration-500">
        <div className="p-4 rounded-full bg-amber-100">
          <AlertCircle className="h-10 w-10 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold">No Gym Selected</h2>
        <p className="text-muted-foreground">Please select a gym in the dashboard to view its library.</p>
        <Button asChild className="font-bold">
          <a href="/">Go to Dashboard</a>
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
            <span>{activeGym.name} Resources</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Shared Library</h1>
          <p className="text-muted-foreground text-lg italic">Standardized exercises and meals for your trainers.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
              <span>Add to Library</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New {activeTab === "exercises" ? "Exercise" : "Meal"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Item Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={() => addItemMutation.mutate()}
                disabled={!newItemName || addItemMutation.isPending}
              >
                {addItemMutation.isPending ? "Adding..." : "Confirm Add"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search library..."
              className="pl-9 bg-muted/50 border-none focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1">
              <TabsTrigger value="exercises" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Dumbbell className="h-4 w-4 mr-2" />
                Exercises
              </TabsTrigger>
              <TabsTrigger value="meals" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Utensils className="h-4 w-4 mr-2" />
                Meals
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Card className="border-none bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Library Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Exercises</span>
                <span className="font-bold">{items?.filter(i => i.type === 'exercise').length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Meals</span>
                <span className="font-bold">{items?.filter(i => i.type === 'meal').length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map(item => (
                <Card key={item.id} className="hover-elevate transition-all border-none shadow-md overflow-hidden group border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>
                      {item.type === 'exercise' ? 'Strength & Conditioning' : 'Nutritional Template'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.type === 'exercise' ? (
                        <>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-muted">Compound</span>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-muted">Strength</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-muted">High Protein</span>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-muted">Balanced</span>
                        </>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
              <div className="p-4 rounded-full bg-muted">
                <LayoutGrid className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Library is empty</h3>
                <p className="text-muted-foreground">Start adding templates for your trainers to use.</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="font-bold">Add Your First Item</Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
