import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dumbbell, Building2 } from "lucide-react";
import { useEffect } from "react";

// Schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  gymName: z.string().min(1, "Gym Name is required"),
  gymSlug: z.string().min(3, "Gym Code must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { gymName: "", gymSlug: "", username: "", password: "" },
  });

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left Panel: Hero */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-zinc-900 z-0" />
        <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 text-4xl font-bold">
                <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                    <Dumbbell className="h-10 w-10" />
                </div>
                <h1>FitTrack Enterprise</h1>
            </div>
            <p className="text-xl text-zinc-300 max-w-md">
                Manage your gym, trainers, and clients with the most advanced fitness platform.
                Built for scale, designed for results.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-12">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <Building2 className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-semibold text-lg">Multi-Gym Support</h3>
                    <p className="text-sm text-zinc-400">Manage multiple locations seamlessly.</p>
                </div>
                 <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <Dumbbell className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-semibold text-lg">Trainer Tools</h3>
                    <p className="text-sm text-zinc-400">Empower your trainers with pro tools.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader className="text-center">
             <CardTitle className="text-2xl">Welcome</CardTitle>
             <CardDescription>Sign in to your account or onboard a new gym</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register Gym</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input type="password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                   <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                     <FormField
                      control={registerForm.control}
                      name="gymName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gym Name</FormLabel>
                          <FormControl><Input placeholder="e.g. Iron Paradise" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="gymSlug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gym Code (URL Slug)</FormLabel>
                          <FormControl><Input placeholder="iron-paradise" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Admin Username</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl><Input type="password" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                         {registerMutation.isPending ? "Creating Gym..." : "Register Gym"}
                    </Button>
                   </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
