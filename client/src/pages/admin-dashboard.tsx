import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Building2,
  Users,
  UserCheck,
  ArrowUpRight,
  Activity,
  Calendar,
  CreditCard
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<{
    gymCount: number;
    trainerCount: number;
    clientCount: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Gyms",
      value: stats?.gymCount || 0,
      icon: Building2,
      description: "Onboarded fitness centers",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Total Trainers",
      value: stats?.trainerCount || 0,
      icon: UserCheck,
      description: "Active certified trainers",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Total Clients",
      value: stats?.clientCount || 0,
      icon: Users,
      description: "Clients across all gyms",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground text-lg">System-wide performance and onboarding metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title} className="hover-elevate transition-all border-none shadow-md overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg} group-hover:scale-110 transition-transform`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span>{card.description}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest signups and engagements across the network.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { label: "New Gym Joined", value: "Elite Fitness Center", time: "2 hours ago", icon: Building2 },
                { label: "New Trainer Onboarded", value: "Sarah Johnson", time: "5 hours ago", icon: UserCheck },
                { label: "New Client Registered", value: "Michael Chen", time: "1 day ago", icon: Users },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Live monitoring of platform services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "API Status", value: "Operational", status: "success", icon: Activity },
              { label: "Database", value: "Connected", status: "success", icon: Activity },
              { label: "Storage", value: "98% Free", status: "warning", icon: Activity },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 ${item.status === 'success' ? 'text-green-500' : 'text-amber-500'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
