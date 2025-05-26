import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CalendarEvent } from "@shared/schema";

type DeadlineEvent = {
  id?: number;
  date: Date;
  title: string;
  type: "primary" | "secondary" | "accent" | "muted";
  description?: string;
};

export default function ReportingCalendar() {
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(today);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeadlineTitle, setNewDeadlineTitle] = useState("");
  const [newDeadlineDescription, setNewDeadlineDescription] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"primary" | "secondary" | "accent" | "muted">("primary");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch calendar events from the API
  const { data: calendarEvents = [], isLoading, isError } = useQuery({
    queryKey: ['/api/calendar'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/calendar');
        if (!response.ok) {
          throw new Error('Failed to fetch calendar events');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        return [];
      }
    }
  });
  
  // Convert calendar events from API to deadline events format
  const deadlineEvents: DeadlineEvent[] = Array.isArray(calendarEvents) 
    ? calendarEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.eventDate),
        type: event.eventType as "primary" | "secondary" | "accent" | "muted",
        description: event.description || undefined
      }))
    : [];
  
  // Create a mutation for adding new events
  const addEventMutation = useMutation({
    mutationFn: async (newEvent: { 
      title: string; 
      eventDate: Date; 
      eventType: string; 
      description?: string;
    }) => {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add deadline');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch calendar data
      queryClient.invalidateQueries({ queryKey: ['/api/calendar'] });
      
      // Show success message
      toast({
        title: "Deadline Added",
        description: `Your deadline "${newDeadlineTitle}" has been added to the calendar for ${date?.toLocaleDateString() || 'today'}.`,
      });
      
      // Reset form
      setNewDeadlineTitle("");
      setNewDeadlineDescription("");
      setSelectedPriority("primary");
      setShowAddForm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add the deadline. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding deadline:", error);
    }
  });
  
  // Add a new deadline with the given title and priority
  function addDeadline() {
    if (!newDeadlineTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the deadline",
        variant: "destructive",
      });
      return;
    }
    
    const selectedDate = date || new Date();
    
    // Create a new deadline and add it via the API
    addEventMutation.mutate({
      title: newDeadlineTitle,
      eventDate: selectedDate,
      eventType: selectedPriority,
      description: newDeadlineDescription || undefined
    });
  }

  // Function to check if a date has an event
  const getDeadlineForDate = (date: Date): DeadlineEvent | undefined => {
    return deadlineEvents.find(
      (event) => 
        event.date.getDate() === date.getDate() && 
        event.date.getMonth() === date.getMonth() && 
        event.date.getFullYear() === date.getFullYear()
    );
  };
  
  // Function to remove time component for date comparison
  const stripTime = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Create mutation to delete an event
  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/calendar/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar'] });
      toast({
        title: "Deadline Removed",
        description: "The deadline has been removed from your calendar.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove the deadline. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter events to show only upcoming ones
  const upcomingDeadlines = deadlineEvents
    .filter(event => event.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
    
  return (
    <Card className="bg-white rounded-lg shadow-md relative w-full max-w-md mx-auto">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-primary">Reporting Calendar</CardTitle>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 flex items-center gap-1"
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Deadline</span>
        </Button>
      </CardHeader>

      {showAddForm && (
        <div className="absolute right-4 top-16 z-50 bg-white rounded-lg shadow-lg border p-4 w-72">
          <h3 className="text-base font-medium mb-3">Add New Deadline</h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="deadline-title">Title</Label>
              <Input
                id="deadline-title"
                value={newDeadlineTitle}
                onChange={(e) => setNewDeadlineTitle(e.target.value)}
                placeholder="Enter deadline title..."
                className="w-full"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="deadline-date">Date</Label>
              <div className="text-sm mb-1 text-muted-foreground">
                {date ? date.toLocaleDateString() : "No date selected"}
              </div>
              <div className="text-sm text-muted-foreground">
                Use the calendar below to select a date
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="deadline-description">Description (optional)</Label>
              <Input
                id="deadline-description"
                value={newDeadlineDescription}
                onChange={(e) => setNewDeadlineDescription(e.target.value)}
                placeholder="Enter description..."
                className="w-full"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="deadline-priority">Priority</Label>
              <Select
                value={selectedPriority}
                onValueChange={(value) => setSelectedPriority(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="secondary">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="accent">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
                      Special Event
                    </div>
                  </SelectItem>
                  <SelectItem value="muted">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                      Low Priority
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewDeadlineTitle("");
                  setNewDeadlineDescription("");
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={addDeadline}
                disabled={addEventMutation.isPending}
              >
                {addEventMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : "Add Deadline"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">
            <p>Failed to load calendar events. Please try again later.</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/calendar'] })}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border mx-auto max-w-full w-full"
              components={{
                DayContent: (props) => {
                  const deadline = getDeadlineForDate(props.date);
                  if (deadline) {
                    return (
                      <div
                        className={`h-full w-full flex items-center justify-center rounded-full ${
                          deadline.type === "accent"
                            ? "bg-accent text-white"
                            : deadline.type === "secondary"
                            ? "bg-secondary text-white"
                            : deadline.type === "muted"
                            ? "bg-gray-500 text-white"
                            : "bg-primary text-white"
                        }`}
                      >
                        {props.date.getDate()}
                      </div>
                    );
                  }
                  return <>{props.date.getDate()}</>;
                },
              }}
            />
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Upcoming Deadlines</h3>
              </div>
              {upcomingDeadlines.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {upcomingDeadlines.map((deadline) => (
                    <li key={deadline.id || `${deadline.title}-${deadline.date.toISOString()}`} className="flex items-start group">
                      <span 
                        className={`inline-block w-3 h-3 rounded-full mt-1 mr-2 ${
                          deadline.type === "accent"
                            ? "bg-accent"
                            : deadline.type === "secondary"
                            ? "bg-secondary"
                            : deadline.type === "muted"
                            ? "bg-gray-500"
                            : "bg-primary"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span>
                            <strong>
                              {deadline.date.toLocaleString('default', { month: 'short' })} {deadline.date.getDate()}:
                            </strong>{" "}
                            {deadline.title}
                          </span>
                          {deadline.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deadline.id && deleteEventMutation.mutate(deadline.id)}
                              disabled={deleteEventMutation.isPending}
                            >
                              {deleteEventMutation.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <span className="text-xs text-destructive">✕</span>
                              )}
                            </Button>
                          )}
                        </div>
                        {deadline.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {deadline.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}