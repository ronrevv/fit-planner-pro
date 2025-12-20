import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGymSchema, insertUserSchema, UserRole } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertGymSchema),
    defaultValues: {
      name: "",
      slug: "",
      address: "",
      settings: "{}",
    },
  });

  const createGymMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertGymSchema>) => {
      const res = await apiRequest("POST", "/api/gyms", data);
      return await res.json();
    },
    onSuccess: (gym) => {
      toast({
        title: "Gym created",
        description: `${gym.name} has been successfully onboarded.`,
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create gym",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (user?.role !== UserRole.SUPER_ADMIN) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Admin</h1>
        <p className="text-muted-foreground">Manage gyms and platform settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Onboard New Gym</CardTitle>
            <CardDescription>
              Create a new gym entity in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createGymMutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gym Name</FormLabel>
                      <FormControl>
                        <Input placeholder="FitPro Downtown" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (Unique ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="fitpro-downtown" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used in URLs and system references. Must be unique.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Fitness St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createGymMutation.isPending}
                >
                  {createGymMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Gym
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Admin User</CardTitle>
            <CardDescription>
              Create an initial admin for a gym.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserCreationForm role={UserRole.GYM_ADMIN} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UserCreationForm({ role }: { role: string }) {
  const { toast } = useToast();

  // Custom schema to include gymId if we are super admin
  const schema = insertUserSchema.extend({
      gymId: z.string().min(1, "Gym ID is required"),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      role: role as any,
      gymId: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof schema>) => {
      const res = await apiRequest("POST", "/api/users", data);
      return await res.json();
    },
    onSuccess: (user) => {
      toast({
        title: "User created",
        description: `User ${user.username} created successfully.`,
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => createUserMutation.mutate(data))}
        className="space-y-4"
      >
         {/* Gym ID Selection - simplified as text input for now, ideally a select dropdown */}
        <FormField
          control={form.control}
          name="gymId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gym ID</FormLabel>
              <FormControl>
                <Input placeholder="UUID of the Gym" {...field} />
              </FormControl>
              <FormDescription>
                Copy the ID from database or response for now.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="admin_user" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={createUserMutation.isPending}
        >
          {createUserMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create User
        </Button>
      </form>
    </Form>
  );
}
