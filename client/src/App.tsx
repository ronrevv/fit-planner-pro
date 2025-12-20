import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Dumbbell, Utensils, ChevronRight, Settings } from "lucide-react";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import GymDashboard from "@/pages/gym-dashboard";
import Clients from "@/pages/clients";
import ClientForm from "@/pages/client-form";
import ClientDetail from "@/pages/client-detail";
import WorkoutPlanBuilder from "@/pages/workout-plan-builder";
import DietPlanBuilder from "@/pages/diet-plan-builder";
import Portal from "@/pages/portal";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

function AppSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navigation = [
    { title: "Dashboard", href: "/", icon: LayoutDashboard },
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Workout Plans", href: "/workout-plans/new", icon: Dumbbell },
    { title: "Diet Plans", href: "/diet-plans/new", icon: Utensils },
  ];

  if (user?.role === UserRole.SUPER_ADMIN) {
      navigation.push({ title: "Admin", href: "/admin", icon: Settings });
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/">
          <div className="flex items-center gap-2 hover-elevate rounded-lg px-2 py-1 -mx-2 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight">FitPro</span>
              <span className="text-xs text-muted-foreground -mt-1">
                {user?.role === UserRole.SUPER_ADMIN ? "Platform Admin" : "Trainer Platform"}
              </span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/" && location.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {user?.fullName?.substring(0, 2).toUpperCase() || "TR"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[100px]">{user?.fullName || "Trainer"}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role?.replace("_", " ") || "Pro Account"}</span>
            </div>
          </div>
          <div className="cursor-pointer" onClick={() => logoutMutation.mutate()}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/portal/:token" component={Portal} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/gym-admin" component={GymDashboard} />
      <ProtectedRoute path="/clients" component={Clients} />
      <ProtectedRoute path="/clients/new" component={ClientForm} />
      <ProtectedRoute path="/clients/:id/edit" component={ClientForm} />
      <ProtectedRoute path="/clients/:id" component={ClientDetail} />
      <ProtectedRoute path="/workout-plans/new" component={WorkoutPlanBuilder} />
      <ProtectedRoute path="/workout-plans/:id" component={WorkoutPlanBuilder} />
      <ProtectedRoute path="/diet-plans/new" component={DietPlanBuilder} />
      <ProtectedRoute path="/diet-plans/:id" component={DietPlanBuilder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="fitpro-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isPortal = location.startsWith("/portal/");
  const isLogin = location === "/login";

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isPortal) {
    return <Router />;
  }

  if (isLogin) {
    return <Router />;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default App;
