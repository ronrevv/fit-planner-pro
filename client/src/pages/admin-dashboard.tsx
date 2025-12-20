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
import { Loader2, Plus, Building, Users as UsersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();

  if (user?.role !== UserRole.SUPER_ADMIN) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Admin</h1>
        <p className="text-muted-foreground">Manage gyms, administrators, and platform settings.</p>
      </div>

      <Tabs defaultValue="gyms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gyms" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Gyms
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gyms" className="space-y-4">
          <GymsTab />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GymsTab() {
  const { data: gyms, isLoading } = useQuery<any[]>({
    queryKey: ["/api/gyms"],
  });
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Gym Management</CardTitle>
          <CardDescription>View and manage onboarded gyms.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Gym
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Onboard New Gym</DialogTitle>
              <DialogDescription>
                Create a new gym entity in the system.
              </DialogDescription>
            </DialogHeader>
            <GymForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gyms?.map((gym) => (
                <TableRow key={gym.id}>
                  <TableCell className="font-medium">{gym.name}</TableCell>
                  <TableCell>{gym.slug}</TableCell>
                  <TableCell>{gym.address || "-"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{gym.id}</TableCell>
                </TableRow>
              ))}
              {gyms?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No gyms found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function GymForm({ onSuccess }: { onSuccess: () => void }) {
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
        description: `${gym.name} has been onboarded.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gyms"] });
      onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-generate slug from name if slug is untouched
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!form.getFieldState("slug").isDirty) {
        form.setValue("slug", slug);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createGymMutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gym Name</FormLabel>
              <FormControl>
                <Input placeholder="FitPro Downtown" {...field} onChange={handleNameChange} />
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
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="fitpro-downtown" {...field} />
              </FormControl>
              <FormDescription>Unique identifier for URLs.</FormDescription>
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
        <div className="flex justify-end pt-2">
            <Button type="submit" disabled={createGymMutation.isPending}>
            {createGymMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Gym
            </Button>
        </div>
      </form>
    </Form>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage administrators and trainers.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a Gym Admin or Trainer.
              </DialogDescription>
            </DialogHeader>
            <UserForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Gym ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell className="capitalize">{user.role?.replace("_", " ")}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[100px]" title={user.gymId}>
                    {user.gymId || "-"}
                  </TableCell>
                </TableRow>
              ))}
              {users?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function UserForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { data: gyms } = useQuery<any[]>({ queryKey: ["/api/gyms"] });

  // Custom schema to include gymId if we are super admin
  const schema = insertUserSchema.extend({
      gymId: z.string().optional(), // Optional for super admin, required for others usually
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      role: UserRole.GYM_ADMIN,
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
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
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
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value={UserRole.GYM_ADMIN}>Gym Admin</SelectItem>
                        <SelectItem value={UserRole.TRAINER}>Trainer</SelectItem>
                        <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="gymId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Gym</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select gym" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {gyms?.map((gym) => (
                            <SelectItem key={gym.id} value={gym.id}>
                                {gym.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="flex justify-end pt-2">
            <Button type="submit" disabled={createUserMutation.isPending}>
            {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create User
            </Button>
        </div>
      </form>
    </Form>
  );
}
