import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Trophy, MapPin, Users, MessageSquare, Search,
  Filter, Flame, Sparkles, UserPlus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAppContext } from "@/hooks/use-app-context";
import type { SocialProfile } from "@shared/schema";

export default function CommunityHub() {
  const { toast } = useToast();
  const [scope, setScope] = useState("global");
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [search, setSearch] = useState("");

  const { data: leaderboard = [] } = useQuery<any[]>({
    queryKey: [`/api/leaderboards?scope=${scope}`],
  });

  const { data: profiles = [] } = useQuery<SocialProfile[]>({
    queryKey: ['/api/social/profiles'],
  });

  const { data: currentClient } = useQuery<any>({
    queryKey: ['/api/clients/me'], // Mock or actual endpoint for session client
    enabled: activeTab === 'discover'
  });

  const sendMatchMutation = useMutation({
    mutationFn: async (toClientId: string) => {
      if (!currentClient?.id) {
        toast({ title: "Portal Required", description: "You must be logged in as a client to connect.", variant: "destructive" });
        return;
      }
      return apiRequest('POST', '/api/social/matches', {
        fromClientId: currentClient.id,
        toClientId,
        type: 'buddy',
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast({ title: "Request Sent", description: "Buddy request has been sent successfully." });
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
            <Users className="h-4 w-4" />
            <span>FitPro Social Ecosystem</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase">Community Hub</h1>
          <p className="text-muted-foreground text-lg font-medium italic">Connect, compete, and conquer your goals together.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-14">
          <TabsTrigger value="leaderboard" className="px-8 font-black uppercase text-xs tracking-widest gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="discover" className="px-8 font-black uppercase text-xs tracking-widest gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Discover Buddies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex items-center gap-4">
             <Button
               variant={scope === 'global' ? 'default' : 'outline'}
               onClick={() => setScope('global')}
               className="font-black uppercase text-[10px] tracking-widest h-9"
             >
               Global
             </Button>
             <Button
               variant={scope === 'state' ? 'default' : 'outline'}
               onClick={() => setScope('state')}
               className="font-black uppercase text-[10px] tracking-widest h-9"
             >
               My State
             </Button>
             <Button
               variant={scope === 'city' ? 'default' : 'outline'}
               onClick={() => setScope('city')}
               className="font-black uppercase text-[10px] tracking-widest h-9"
             >
               My City
             </Button>
          </div>

          <div className="grid gap-6">
            {leaderboard.map((user, index) => (
              <Card key={user.id} className={`hover-elevate transition-all border-none shadow-xl ${index < 3 ? 'bg-gradient-to-r from-card to-primary/5' : ''}`}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-black text-xl italic">
                      {index + 1}
                    </div>
                    <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                      <AvatarFallback className="font-bold text-lg bg-primary/10 text-primary">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">{user.name}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold uppercase tracking-widest">
                        <MapPin className="h-3 w-3" />
                        {user.city}, {user.state}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-primary">
                      <Flame className="h-6 w-6 fill-current" />
                      <span className="text-3xl font-black italic">{user.score}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gym Check-ins</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-8">
          <div className="flex items-center gap-4 max-w-xl">
             <div className="relative flex-1 group">
               <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                 placeholder="Find fitness partners..."
                 className="pl-10 h-11 border-2 font-bold"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             <Button variant="outline" className="h-11 border-2 px-6">
               <Filter className="h-4 w-4" />
             </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map(profile => (
              <Card key={profile.id} className="group hover-elevate transition-all border-none shadow-2xl overflow-hidden flex flex-col">
                <div className="aspect-[4/5] bg-muted relative overflow-hidden">
                  {profile.photos?.[0] ? (
                    <img src={profile.photos[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
                      <Users className="h-20 w-20 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className="bg-black/60 backdrop-blur-md border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                      {profile.isDatingEnabled ? '❤️ Dating On' : '🤝 Buddy Only'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{profile.displayName}</h3>
                    <p className="text-white/70 text-sm font-bold uppercase tracking-widest">{profile.gender}</p>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 space-y-4">
                  <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">
                    "{profile.bio || 'Looking for a dedicated workout partner to crush goals together!'}"
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests?.map(interest => (
                      <Badge key={interest} variant="secondary" className="font-bold uppercase text-[9px] tracking-widest py-1">
                        #{interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex gap-3">
                  <Button
                    className="flex-1 h-12 font-black uppercase tracking-widest text-xs gap-2 rounded-xl shadow-xl shadow-primary/20"
                    onClick={() => sendMatchMutation.mutate(profile.clientId)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Connect
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
