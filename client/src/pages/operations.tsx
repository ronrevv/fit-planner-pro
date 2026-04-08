import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
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
  Calendar,
  CreditCard,
  Plus,
  Clock,
  User,
  MoreVertical,
  Clock3,
  AlertCircle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  CreditCard as StripeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useAppContext } from "@/hooks/use-app-context";
import { useToast } from "@/hooks/use-toast";
import type { Session, Payment, Client } from "@shared/schema";
import { useState } from "react";

export default function Operations() {
  const { activeTrainer } = useAppContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sessions");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New Session/Payment state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [amount, setAmount] = useState("");

  const { data: sessions, isLoading: isLoadingSessions } = useQuery<Session[]>({
    queryKey: [`/api/sessions?trainerId=${activeTrainer?.id}`],
    enabled: !!activeTrainer
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: [`/api/payments?trainerId=${activeTrainer?.id}`],
    enabled: !!activeTrainer
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: [`/api/clients?trainerId=${activeTrainer?.id}`],
    enabled: !!activeTrainer
  });

  const addActionMutation = useMutation({
    mutationFn: async () => {
      if (!activeTrainer || !selectedClientId) return;

      const endpoint = activeTab === "sessions" ? "/api/sessions" : "/api/payments";
      const payload = activeTab === "sessions" ? {
        trainerId: activeTrainer.id,
        clientId: selectedClientId,
        dateTime: new Date().toISOString(),
        durationMinutes: 60,
        status: "scheduled"
      } : {
        trainerId: activeTrainer.id,
        clientId: selectedClientId,
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        status: "pending"
      };

      const res = await apiRequest("POST", endpoint, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${activeTab}?trainerId=${activeTrainer?.id}`] });
      setIsDialogOpen(false);
      setSelectedClientId("");
      setAmount("");
      toast({ title: `${activeTab.slice(0, -1)} added successfully` });
    }
  });

  const getClientName = (id: string) => clients?.find(c => c.id === id)?.name || "Unknown Client";

  if (!activeTrainer) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 animate-in fade-in duration-500">
        <div className="p-4 rounded-full bg-blue-100">
          <User className="h-10 w-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">No Trainer Selected</h2>
        <p className="text-muted-foreground">Please select a trainer in the dashboard to manage operations.</p>
        <Button asChild className="font-bold">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const totalRevenue = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingRevenue = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Revenue Dashboard */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground border-none shadow-2xl shadow-primary/20 overflow-hidden relative group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
             <TrendingUp className="h-40 w-40" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/70 font-black uppercase tracking-widest text-[10px]">Total Revenue</CardDescription>
            <CardTitle className="text-4xl font-black italic">${totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-bold text-primary-foreground/80">
              <ArrowUpRight className="h-3 w-3" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardDescription className="font-black uppercase tracking-widest text-[10px]">Pending Invoices</CardDescription>
            <CardTitle className="text-4xl font-black italic text-amber-500">${pendingRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{payments?.filter(p => p.status === 'pending').length || 0} unpaid records</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card overflow-hidden flex flex-col justify-center p-6 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-full w-full border-none flex flex-col gap-2 hover:bg-primary/5">
                <StripeIcon className="h-8 w-8 text-primary" />
                <span className="font-black uppercase tracking-widest text-xs">Stripe Connect</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-[#635BFF]/10 flex items-center justify-center">
                   <StripeIcon className="h-6 w-6 text-[#635BFF]" />
                </div>
                <div className="text-center">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Connect with Stripe</DialogTitle>
                  <DialogDescription className="font-bold uppercase text-[10px] tracking-widest pt-1">
                    Direct Payouts & Automated Invoicing
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="bg-muted/50 p-6 rounded-2xl space-y-4 border-2 border-dashed border-muted-foreground/10">
                 <div className="flex items-start gap-3">
                   <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5" />
                   <div>
                     <p className="text-sm font-bold uppercase tracking-tight">Secure Onboarding</p>
                     <p className="text-xs text-muted-foreground">Stripe handles all identity verification and sensitive banking data.</p>
                   </div>
                 </div>
              </div>
              <DialogFooter>
                 <Button className="w-full h-12 font-black uppercase tracking-widest bg-[#635BFF] hover:bg-[#635BFF]/90">
                   Setup Stripe Express
                 </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
            <Clock className="h-4 w-4" />
            <span>Workflow for {activeTrainer.name}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Trainer Operations</h1>
          <p className="text-muted-foreground text-lg italic">Streamlining your sessions and payments.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
              <span>New {activeTab === "sessions" ? "Session" : "Payment"}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New {activeTab === "sessions" ? "Session" : "Payment Record"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Client</p>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeTab === "payments" && (
                <div className="space-y-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Amount ($)</p>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-9"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button
                className="w-full h-11 font-bold"
                onClick={() => addActionMutation.mutate()}
                disabled={!selectedClientId || (activeTab === "payments" && !amount) || addActionMutation.isPending}
              >
                {addActionMutation.isPending ? "Creating..." : "Confirm"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 h-14 bg-muted/50 p-1 mb-8">
          <TabsTrigger value="sessions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-lg">
            <Clock3 className="h-5 w-5 mr-2 text-blue-500" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-lg">
            <CreditCard className="h-5 w-5 mr-2 text-emerald-500" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingSessions ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)
            ) : sessions && sessions.length > 0 ? (
              sessions.map(session => (
                <Card key={session.id} className="hover-elevate transition-all border-none shadow-md overflow-hidden border-l-4 border-l-blue-500 group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <User className="h-5 w-5 text-blue-500" />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-xl pt-2">{getClientName(session.clientId)}</CardTitle>
                    <CardDescription className="flex items-center gap-1 font-medium">
                      <Clock3 className="h-3 w-3" />
                      {format(new Date(session.dateTime), "PPP p")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{session.durationMinutes} mins</span>
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                      session.status === 'completed' ? 'bg-green-100 text-green-700' :
                      session.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {session.status}
                    </span>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted text-center flex flex-col items-center justify-center space-y-4">
                <Calendar className="h-10 w-10 text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-bold">No sessions found</h3>
                  <p className="text-muted-foreground">Start scheduling appointments with your clients.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingPayments ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)
            ) : payments && payments.length > 0 ? (
              payments.map(payment => (
                <Card key={payment.id} className="hover-elevate transition-all border-none shadow-md overflow-hidden border-l-4 border-l-emerald-500 group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <CreditCard className="h-5 w-5 text-emerald-500" />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-xl pt-2">{getClientName(payment.clientId)}</CardTitle>
                    <CardDescription className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3" />
                      Due on {format(new Date(payment.date), "PPP")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <span className="text-2xl font-black text-emerald-600">${payment.amount}</span>
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                      payment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted text-center flex flex-col items-center justify-center space-y-4">
                <CreditCard className="h-10 w-10 text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-bold">No payment records</h3>
                  <p className="text-muted-foreground">Keep track of your client invoices and earnings.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
