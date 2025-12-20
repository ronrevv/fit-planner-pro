import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientResourceSchema, type ClientResource } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Trash2, Link as LinkIcon, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClientResources({ clientId }: { clientId: string }) {
  const { toast } = useToast();

  const { data: resources = [], isLoading } = useQuery<ClientResource[]>({
    queryKey: ['/api/clients', clientId, 'resources'],
  });

  const form = useForm({
    resolver: zodResolver(insertClientResourceSchema),
    defaultValues: {
      title: "",
      type: "link" as const,
      url: "",
      description: "",
      clientId
    }
  });

  const createResource = useMutation({
    mutationFn: async (values: any) => {
      await apiRequest("POST", `/api/clients/${clientId}/resources`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'resources'] });
      form.reset({ title: "", type: "link", url: "", description: "", clientId });
      toast({ title: "Resource added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add resource", variant: "destructive" });
    }
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/resources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'resources'] });
      toast({ title: "Resource deleted" });
    }
  });

  const onSubmit = (values: any) => {
    createResource.mutate({ ...values, clientId });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Resource</CardTitle>
          <CardDescription>Share links or documents with your client.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Warmup Video" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="link">External Link</SelectItem>
                          <SelectItem value="file">File (URL)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createResource.isPending}>
                {createResource.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Resource
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium">Shared Resources</h3>
        {isLoading ? (
          <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
        ) : resources.length === 0 ? (
          <p className="text-muted-foreground text-sm">No resources shared yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="p-2 bg-muted rounded-lg">
                      {resource.type === 'link' ? <LinkIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{resource.title}</h4>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">
                        {resource.url}
                      </a>
                      {resource.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => deleteResource.mutate(resource.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
