import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Send, User, MessageSquare, Loader2, Check, CheckCheck,
  Search, X, Smile, MoreHorizontal, Phone, Video
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { ChatMessage } from "@shared/schema";

interface ChatSystemProps {
  currentUserId: string;
  targetUserId: string;
  targetUserName: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ChatSystem({ currentUserId, targetUserId, targetUserName, isOpen = true, onClose }: ChatSystemProps) {
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: [`/api/chat/${currentUserId}/${targetUserId}`],
    refetchInterval: 3000, // Poll for new messages every 3s
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest('POST', '/api/chat', {
        senderId: currentUserId,
        receiverId: targetUserId,
        content: text
      });
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/chat/${currentUserId}/${targetUserId}`] });
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendMutation.mutate(content);
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] shadow-2xl flex flex-col border-none overflow-hidden z-50 animate-in slide-in-from-bottom-10 duration-500">
      <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
            <AvatarFallback className="bg-white/10 text-white font-black">
              {targetUserName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest">{targetUserName}</CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold opacity-70 uppercase">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 bg-muted/30">
        <ScrollArea className="h-[360px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Start the conversation</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] space-y-1`}>
                    <div
                      className={`p-3 rounded-2xl text-sm font-medium shadow-sm ${
                        msg.senderId === currentUserId
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-white text-foreground rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-1 text-[9px] font-bold uppercase text-muted-foreground ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                      {format(new Date(msg.timestamp), 'h:mm a')}
                      {msg.senderId === currentUserId && <CheckCheck className="h-3 w-3 text-primary" />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 bg-white border-t">
        <form onSubmit={handleSend} className="flex gap-2 w-full">
          <Input
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 h-11 border-2 font-medium"
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl shadow-lg shadow-primary/20"
            disabled={!content.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
