import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, insertUserSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GymDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: trainers, isLoading } = useQuery<any[]>({
    queryKey: [`/api/gyms/${user?.gymId}/users`],
    enabled: !!user?.gymId
  });

  if (user?.role !== UserRole.GYM_ADMIN) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gym Administration</h1>
        <p className="text-muted-foreground">Manage your gym's trainers and settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Add Trainer</CardTitle>
            <CardDescription>
              Create a new trainer account for your gym.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <TrainerCreationForm gymId={user.gymId!} />
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Staff List</CardTitle>
            <CardDescription>
              All users currently associated with this gym.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Username</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainers?.map((trainer: any) => (
                    <TableRow key={trainer.id}>
                      <TableCell className="font-medium">{trainer.fullName}</TableCell>
                      <TableCell className="capitalize">{trainer.role.replace("_", " ")}</TableCell>
                      <TableCell>{trainer.username}</TableCell>
                    </TableRow>
                  ))}
                  {trainers?.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">No trainers found</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TrainerCreationForm({ gymId }: { gymId: string }) {
  const { toast } = useToast();

  // Custom schema for Gym Admin creating a Trainer (gymId is fixed)
  const schema = insertUserSchema.omit({ gymId: true, role: true }).extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof schema>) => {
      // We manually append role and gymId when sending to API
      const payload = {
          ...data,
          role: UserRole.TRAINER,
          gymId: gymId
      };
      const res = await apiRequest("POST", "/api/users", payload);
      return await res.json();
    },
    onSuccess: (user) => {
      toast({
        title: "Trainer created",
        description: `${user.fullName} has been added to the team.`,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/gyms/${gymId}/users`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create trainer",
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
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Smith" {...field} />
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
                <Input placeholder="trainer_jane" {...field} />
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
          Add Trainer
        </Button>
      </form>
    </Form>
  );
}
