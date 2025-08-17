import { type User, type InsertUser, type Assignment, type InsertAssignment, type UpdateAssignment, type Subject, type InsertSubject } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCurrentUser(): Promise<User>;
  switchUser(userId: string): Promise<User>;
  
  // Assignments
  getAssignments(userId?: string): Promise<Assignment[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, assignment: UpdateAssignment): Promise<Assignment | undefined>;
  deleteAssignment(id: string): Promise<boolean>;
  getAssignmentsByStatus(status: string, userId?: string): Promise<Assignment[]>;
  getAssignmentsBySubject(subject: string, userId?: string): Promise<Assignment[]>;
  getUpcomingAssignments(limit?: number, userId?: string): Promise<Assignment[]>;
  
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private assignments: Map<string, Assignment>;
  private subjects: Map<string, Subject>;
  private currentUserId: string;

  constructor() {
    this.users = new Map();
    this.assignments = new Map();
    this.subjects = new Map();
    this.currentUserId = "";
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default users
    const zooId = randomUUID();
    const nishId = randomUUID();
    
    const defaultUsers: User[] = [
      {
        id: zooId,
        name: "Zoo",
        email: "zoo@example.com",
        avatar: null,
        createdAt: new Date(),
      },
      {
        id: nishId,
        name: "Nish", 
        email: "nish@example.com",
        avatar: null,
        createdAt: new Date(),
      },
    ];

    defaultUsers.forEach(user => {
      this.users.set(user.id, user);
    });
    
    // Set Zoo as the current user by default
    this.currentUserId = zooId;

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

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email || null,
      avatar: insertUser.avatar || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getCurrentUser(): Promise<User> {
    const user = this.users.get(this.currentUserId);
    if (!user) {
      throw new Error("No current user found");
    }
    return user;
  }

  async switchUser(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    this.currentUserId = userId;
    return user;
  }

  // Assignment methods
  async getAssignments(userId?: string): Promise<Assignment[]> {
    const targetUserId = userId || this.currentUserId;
    return Array.from(this.assignments.values())
      .filter(a => a.userId === targetUserId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
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
      userId: insertAssignment.userId || this.currentUserId,
      description: insertAssignment.description || null,
      progress: insertAssignment.progress || 0,
      teacher: insertAssignment.teacher || null,
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

  async getAssignmentsByStatus(status: string, userId?: string): Promise<Assignment[]> {
    const targetUserId = userId || this.currentUserId;
    return Array.from(this.assignments.values())
      .filter(a => a.status === status && a.userId === targetUserId);
  }

  async getAssignmentsBySubject(subject: string, userId?: string): Promise<Assignment[]> {
    const targetUserId = userId || this.currentUserId;
    return Array.from(this.assignments.values())
      .filter(a => a.subject === subject && a.userId === targetUserId);
  }

  async getUpcomingAssignments(limit = 10, userId?: string): Promise<Assignment[]> {
    const targetUserId = userId || this.currentUserId;
    const now = new Date();
    return Array.from(this.assignments.values())
      .filter(a => new Date(a.dueDate) >= now && a.status !== 'completed' && a.userId === targetUserId)
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
      teacher: insertSubject.teacher || null,
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
