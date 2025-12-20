import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTrainerProfileSchema, type TrainerProfile } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TrainerProfileForm() {
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<TrainerProfile>({
    queryKey: ['/api/trainer/profile'],
  });

  const form = useForm({
    resolver: zodResolver(insertTrainerProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: ""
    },
    values: profile ? {
      name: profile.name,
      email: profile.email,
      phone: profile.phone || "",
      bio: profile.bio || ""
    } : undefined
  });

  const updateProfile = useMutation({
    mutationFn: async (values: any) => {
      await apiRequest("POST", "/api/trainer/profile", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trainer/profile'] });
      toast({ title: "Profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trainer Profile</CardTitle>
        <CardDescription>
          Update your contact information and bio. This will be visible to your clients in their portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio / Welcome Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short bio or welcome message for your clients..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
