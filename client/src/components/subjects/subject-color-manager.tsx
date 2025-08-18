import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, Save, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Subject } from "@shared/schema";

const DEFAULT_COLORS = [
  "#C2185B", // Pink
  "#2196F3", // Blue  
  "#4CAF50", // Green
  "#FF9800", // Orange
  "#9C27B0", // Purple
  "#607D8B", // Blue Grey
  "#F44336", // Red
  "#009688", // Teal
  "#FF5722", // Deep Orange
  "#795548", // Brown
  "#3F51B5", // Indigo
  "#8BC34A", // Light Green
];

export function SubjectColorManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState("");

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async ({ id, color }: { id: string; color: string }) => {
      return await apiRequest(`/api/subjects/${id}`, "PATCH", { color });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Color Updated",
        description: "Subject color has been updated successfully.",
      });
      setEditingSubject(null);
      setTempColor("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update color: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleStartEdit = (subject: Subject) => {
    setEditingSubject(subject.id);
    setTempColor(subject.color);
  };

  const handleSaveColor = (subjectId: string) => {
    if (!tempColor || tempColor === subjects.find(s => s.id === subjectId)?.color) {
      setEditingSubject(null);
      setTempColor("");
      return;
    }
    updateSubjectMutation.mutate({ id: subjectId, color: tempColor });
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setTempColor("");
  };

  const handleQuickColorSelect = (color: string) => {
    setTempColor(color);
  };

  if (isLoading) {
    return (
      <Card className="shadow-material-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Subject Colors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-material-1" data-testid="subject-color-manager">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-indigo-600" />
          Subject Colors
        </CardTitle>
        <p className="text-sm text-gray-600">
          Customize colors for each subject to better organize your assignments
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No subjects found. Add assignments to create subjects.</p>
          </div>
        ) : (
          subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              data-testid={`subject-color-item-${subject.id}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded border-2 border-gray-300"
                  style={{ backgroundColor: editingSubject === subject.id ? tempColor : subject.color }}
                  data-testid={`color-preview-${subject.id}`}
                />
                <div>
                  <div className="font-medium text-gray-900">{subject.name}</div>
                  {subject.teacher && (
                    <div className="text-sm text-gray-500">{subject.teacher}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingSubject === subject.id ? (
                  <div className="space-y-3">
                    {/* Color Input */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`color-${subject.id}`} className="text-xs">
                        Color:
                      </Label>
                      <Input
                        id={`color-${subject.id}`}
                        type="color"
                        value={tempColor}
                        onChange={(e) => setTempColor(e.target.value)}
                        className="w-16 h-8 p-1 border rounded"
                        data-testid={`color-picker-${subject.id}`}
                      />
                      <Input
                        type="text"
                        value={tempColor}
                        onChange={(e) => setTempColor(e.target.value)}
                        placeholder="#000000"
                        className="w-24 h-8 text-xs"
                        data-testid={`color-input-${subject.id}`}
                      />
                    </div>

                    {/* Quick Color Palette */}
                    <div className="flex flex-wrap gap-1">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                          style={{ backgroundColor: color }}
                          onClick={() => handleQuickColorSelect(color)}
                          data-testid={`quick-color-${color}`}
                        />
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveColor(subject.id)}
                        disabled={updateSubjectMutation.isPending}
                        data-testid={`save-color-${subject.id}`}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        data-testid={`cancel-edit-${subject.id}`}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-white"
                      style={{ backgroundColor: subject.color }}
                      data-testid={`color-badge-${subject.id}`}
                    >
                      {subject.color}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartEdit(subject)}
                      data-testid={`edit-color-${subject.id}`}
                    >
                      <Palette className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}