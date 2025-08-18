import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import type { Subject } from "@shared/schema";

interface SubjectBadgeProps {
  subjectName: string;
  variant?: "default" | "outline" | "secondary";
  className?: string;
  showTeacher?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SubjectBadge({ 
  subjectName, 
  variant = "default", 
  className = "",
  showTeacher = false,
  size = "md"
}: SubjectBadgeProps) {
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const subject = subjects.find(s => s.name === subjectName);
  
  if (!subject) {
    return (
      <Badge variant={variant} className={`${className} bg-gray-100 text-gray-800`}>
        {subjectName}
        {showTeacher && " - Unknown"}
      </Badge>
    );
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1", 
    lg: "text-base px-3 py-1.5"
  };

  const badgeStyle = variant === "outline" 
    ? { 
        borderColor: subject.color,
        color: subject.color,
        backgroundColor: "transparent"
      }
    : {
        backgroundColor: subject.color,
        color: "white",
        borderColor: subject.color
      };

  return (
    <Badge 
      variant={variant}
      className={`${className} ${sizeClasses[size]} border-2 font-medium`}
      style={badgeStyle}
      data-testid={`subject-badge-${subject.id}`}
    >
      {subject.name}
      {showTeacher && subject.teacher && ` - ${subject.teacher}`}
    </Badge>
  );
}