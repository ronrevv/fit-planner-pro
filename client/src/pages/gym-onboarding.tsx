import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertGymSchema, type InsertGym } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, Building2, Mail, MapPin, ArrowRight } from "lucide-react";

export default function GymOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertGym>({
    resolver: zodResolver(insertGymSchema),
    defaultValues: {
      name: "",
      contactEmail: "",
      address: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertGym) => {
      const res = await apiRequest("POST", "/api/gyms", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Gym Onboarded Successfully",
        description: "Your gym has been registered on the FitPro platform.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gyms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <Card className="w-full max-w-xl relative overflow-hidden border-none shadow-2xl">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="space-y-4 pt-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">Onboard Your Gym</CardTitle>
            <CardDescription className="text-lg">Join the network and start managing trainers and clients.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-10 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Gym Name</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Dumbbell className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input placeholder="e.g. Elite Fitness Hub" className="pl-10 h-12 border-muted focus-visible:ring-primary" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Business Email</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input placeholder="contact@gymname.com" className="pl-10 h-12 border-muted focus-visible:ring-primary" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Location</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input placeholder="123 Workout Ave, New York" className="pl-10 h-12 border-muted focus-visible:ring-primary" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold group rounded-lg"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Registering..." : "Onboard Gym"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
