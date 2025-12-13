import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Send, StickyNote } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TrainerNote, InsertTrainerNote } from "@shared/schema";

export function TrainerNotes({ clientId }: { clientId: string }) {
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const { data: notes = [] } = useQuery<TrainerNote[]>({
    queryKey: ['/api/clients', clientId, 'notes'],
  });

  const addNoteMutation = useMutation({
    mutationFn: async (noteContent: string) => {
      const res = await apiRequest('POST', `/api/clients/${clientId}/notes`, {
        content: noteContent,
        date: Date.now(),
      } as InsertTrainerNote);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'notes'] });
      setContent("");
      toast({ title: "Note added" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addNoteMutation.mutate(content);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Trainer Notes
        </CardTitle>
        <CardDescription>Private session notes and observations.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 min-h-[300px]">
        <ScrollArea className="flex-1 h-[200px] pr-4">
          <div className="space-y-4">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No notes yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-muted/30 p-3 rounded-lg border text-sm">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{format(note.date, "MMM d, yyyy • h:mm a")}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex gap-2 mt-auto pt-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a new note..."
            className="min-h-[80px]"
          />
          <Button type="submit" size="icon" className="h-auto" disabled={!content.trim() || addNoteMutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
