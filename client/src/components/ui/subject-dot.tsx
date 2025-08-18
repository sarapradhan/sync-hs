import { useQuery } from "@tanstack/react-query";
import type { Subject } from "@shared/schema";

interface SubjectDotProps {
  subjectName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SubjectDot({ subjectName, size = "md", className = "" }: SubjectDotProps) {
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const subject = subjects.find(s => s.name === subjectName);
  
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const color = subject?.color || "#6B7280"; // Default gray if subject not found

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border border-gray-300 ${className}`}
      style={{ backgroundColor: color }}
      data-testid={`subject-dot-${subject?.id || 'unknown'}`}
      title={subject?.name || subjectName}
    />
  );
}