import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Activity, HeartPulse, Scale, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Client } from "@shared/schema";
import { InjuryLogList } from "@/components/clients/injury-log";
import { MeasurementLogList } from "@/components/clients/measurement-log";
import { MeasurementChart } from "@/components/clients/measurement-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HealthTracker() {
  const [open, setOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: measurementLogs = [] } = useQuery<any[]>({
    queryKey: ['/api/clients', selectedClientId, 'measurements'],
    enabled: !!selectedClientId,
  });

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          Health Tracker
        </h1>
        <p className="text-muted-foreground">
          Monitor injuries, log body measurements, and track client progress.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[300px] justify-between"
            >
              {selectedClientId
                ? clients.find((client) => client.id === selectedClientId)?.name
                : "Select client..."}
              <Users className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search client..." />
              <CommandList>
                <CommandEmpty>No client found.</CommandEmpty>
                <CommandGroup>
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.name}
                      onSelect={() => {
                        setSelectedClientId(client.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedClientId === client.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {client.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedClientId && (
          <div className="text-sm text-muted-foreground">
             Viewing health data for <span className="font-medium text-foreground">{selectedClient?.name}</span>
          </div>
        )}
      </div>

      <Separator />

      {!selectedClientId ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-lg border-dashed">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Activity className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Client Selected</h3>
          <p className="text-muted-foreground max-w-sm">
            Please select a client from the dropdown above to view and manage their health logs.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
           {measurementLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Progress Overview
                </CardTitle>
                <CardDescription>
                  Visual tracking of weight and measurements over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MeasurementChart logs={measurementLogs} />
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="measurements" className="space-y-6">
            <TabsList>
              <TabsTrigger value="measurements" className="gap-2">
                <Scale className="h-4 w-4" />
                Body Measurements
              </TabsTrigger>
              <TabsTrigger value="injuries" className="gap-2">
                <HeartPulse className="h-4 w-4" />
                Injuries & Recovery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="measurements">
               <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Measurement Logs
                  </CardTitle>
                  <CardDescription>
                    Record and track body weight and dimensions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MeasurementLogList clientId={selectedClientId} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="injuries">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-destructive" />
                    Injury Tracker
                  </CardTitle>
                  <CardDescription>
                    Log injuries and monitor recovery status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <InjuryLogList clientId={selectedClientId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
