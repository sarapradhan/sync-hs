import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertAssignmentSchema, type InsertAssignment, type Assignment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MATERIAL_ICONS } from "@/lib/constants";
import { format } from "date-fns";

interface AssignmentFormProps {
  open: boolean;
  onClose: () => void;
  assignment?: Assignment;
}

export function AssignmentForm({ open, onClose, assignment }: AssignmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncCalendar, setSyncCalendar] = useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  // Create a simplified form with only the 3 essential fields
  const simplifiedSchema = insertAssignmentSchema.pick({
    subject: true,
    title: true,
    dueDate: true,
  });

  const form = useForm<Pick<InsertAssignment, 'subject' | 'title' | 'dueDate'>>({
    resolver: zodResolver(simplifiedSchema),
    defaultValues: {
      subject: assignment?.subject || "",
      title: assignment?.title || "",
      dueDate: assignment ? format(new Date(assignment.dueDate), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'23:59"),
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAssignment) => {
      const response = await apiRequest("POST", "/api/assignments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Assignment created successfully!",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertAssignment) => {
      const response = await apiRequest("PUT", `/api/assignments/${assignment!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Assignment updated successfully!",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    setSyncCalendar(false);
    onClose();
  };

  const onSubmit = (data: InsertAssignment) => {
    // Add default values for fields not included in the simplified form
    const submissionData: InsertAssignment = {
      ...data,
      dueDate: new Date(data.dueDate as string),
      description: "", // Default empty description
      priority: "medium", // Default medium priority
      status: "pending", // Default pending status
      progress: 0, // Default 0% progress
      teacher: "", // Default empty teacher
      type: "homework", // Default homework type
      pointsEarned: null, // Default no points earned yet
      pointsPossible: 100, // Default 100 points possible
      googleCalendarEventId: null, // Default no calendar sync
      userId: "" // Will be set by the backend
    };

    if (assignment) {
      updateMutation.mutate(submissionData);
    } else {
      createMutation.mutate(submissionData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md" data-testid="assignment-form-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-gray-900">
              {assignment ? "Edit Assignment" : "Add New Assignment"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              data-testid="button-close-modal"
            >
              <span className="material-icons text-gray-400">{MATERIAL_ICONS.close}</span>
            </Button>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Subject - First Field */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Assignment Title - Second Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter assignment title" 
                      {...field} 
                      data-testid="input-assignment-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Due Date & Time - Third Field */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date & Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field}
                      data-testid="input-due-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? "Saving..." 
                  : assignment ? "Update Assignment" : "Add Assignment"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
