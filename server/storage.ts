import { type Assignment, type InsertAssignment, type UpdateAssignment, type Subject, type InsertSubject } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Assignments
  getAssignments(): Promise<Assignment[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, assignment: UpdateAssignment): Promise<Assignment | undefined>;
  deleteAssignment(id: string): Promise<boolean>;
  getAssignmentsByStatus(status: string): Promise<Assignment[]>;
  getAssignmentsBySubject(subject: string): Promise<Assignment[]>;
  getUpcomingAssignments(limit?: number): Promise<Assignment[]>;
  
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private assignments: Map<string, Assignment>;
  private subjects: Map<string, Subject>;

  constructor() {
    this.assignments = new Map();
    this.subjects = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default subjects
    const defaultSubjects: Subject[] = [
      {
        id: randomUUID(),
        name: "Mathematics",
        color: "#2196F3",
        teacher: "Mr. Johnson",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "English",
        color: "#4CAF50",
        teacher: "Ms. Davis",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Science",
        color: "#FF9800",
        teacher: "Dr. Smith",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "History",
        color: "#9C27B0",
        teacher: "Mr. Wilson",
        createdAt: new Date(),
      },
    ];

    defaultSubjects.forEach(subject => {
      this.subjects.set(subject.id, subject);
    });
  }

  // Assignment methods
  async getAssignments(): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }

  async createAssignment(insertAssignment: InsertAssignment): Promise<Assignment> {
    const id = randomUUID();
    const now = new Date();
    const assignment: Assignment = {
      ...insertAssignment,
      id,
      createdAt: now,
      updatedAt: now,
      googleCalendarEventId: null,
    };
    this.assignments.set(id, assignment);
    return assignment;
  }

  async updateAssignment(id: string, updateAssignment: UpdateAssignment): Promise<Assignment | undefined> {
    const existing = this.assignments.get(id);
    if (!existing) return undefined;

    const updated: Assignment = {
      ...existing,
      ...updateAssignment,
      updatedAt: new Date(),
    };
    this.assignments.set(id, updated);
    return updated;
  }

  async deleteAssignment(id: string): Promise<boolean> {
    return this.assignments.delete(id);
  }

  async getAssignmentsByStatus(status: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(a => a.status === status);
  }

  async getAssignmentsBySubject(subject: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(a => a.subject === subject);
  }

  async getUpcomingAssignments(limit = 10): Promise<Assignment[]> {
    const now = new Date();
    return Array.from(this.assignments.values())
      .filter(a => new Date(a.dueDate) >= now && a.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, limit);
  }

  // Subject methods
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const subject: Subject = {
      ...insertSubject,
      id,
      createdAt: new Date(),
    };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: string, updateSubject: Partial<InsertSubject>): Promise<Subject | undefined> {
    const existing = this.subjects.get(id);
    if (!existing) return undefined;

    const updated: Subject = {
      ...existing,
      ...updateSubject,
    };
    this.subjects.set(id, updated);
    return updated;
  }

  async deleteSubject(id: string): Promise<boolean> {
    return this.subjects.delete(id);
  }
}

export const storage = new MemStorage();
