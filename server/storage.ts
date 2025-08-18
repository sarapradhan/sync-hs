import { type User, type InsertUser, type UpdateUser, type Assignment, type InsertAssignment, type UpdateAssignment, type Subject, type InsertSubject, type UploadLog, type InsertUploadLog, type UpdateUploadLog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: UpdateUser): Promise<User>;
  getCurrentUser(): Promise<User>;
  switchUser(userId: string): Promise<User>;
  
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
  
  // Upload logs
  getUploadLogs(): Promise<UploadLog[]>;
  createUploadLog(uploadLog: InsertUploadLog): Promise<UploadLog>;
  updateUploadLog(id: string, uploadLog: UpdateUploadLog): Promise<UploadLog | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private assignments: Map<string, Assignment>;
  private subjects: Map<string, Subject>;
  private uploadLogs: Map<string, UploadLog>;
  private currentUserId: string;

  constructor() {
    this.users = new Map();
    this.assignments = new Map();
    this.subjects = new Map();
    this.uploadLogs = new Map();
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
        googleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nishId,
        name: "Nish", 
        email: "nish@example.com",
        avatar: null,
        googleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultUsers.forEach(user => {
      this.users.set(user.id, user);
    });
    
    // Set Zoo as the current user by default
    this.currentUserId = zooId;

    // Create default subjects based on user's course list
    const defaultSubjects: Subject[] = [
      {
        id: randomUUID(),
        name: "French V",
        color: "#E91E63",
        teacher: "Mme. Dubois",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "French V Honors",
        color: "#C2185B",
        teacher: "Mme. Laurent",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "AP Physics",
        color: "#2196F3",
        teacher: "Dr. Newton",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "AP Biology",
        color: "#4CAF50",
        teacher: "Dr. Darwin",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "AP Calc BC",
        color: "#FF9800",
        teacher: "Mr. Euler",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "AP Lang",
        color: "#9C27B0",
        teacher: "Ms. Shakespeare",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "US History",
        color: "#607D8B",
        teacher: "Mr. Lincoln",
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
      googleId: insertUser.googleId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async updateUser(id: string, updateUser: UpdateUser): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const updatedUser: User = {
      ...existingUser,
      ...updateUser,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
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
  async getAssignments(): Promise<Assignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.userId === this.currentUserId)
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
      status: insertAssignment.status || "pending",
      priority: insertAssignment.priority || "medium",
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
    return Array.from(this.assignments.values())
      .filter(a => a.status === status && a.userId === this.currentUserId);
  }

  async getAssignmentsBySubject(subject: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.subject === subject && a.userId === this.currentUserId);
  }

  async getUpcomingAssignments(limit = 10): Promise<Assignment[]> {
    const now = new Date();
    return Array.from(this.assignments.values())
      .filter(a => new Date(a.dueDate) >= now && a.status !== 'completed' && a.userId === this.currentUserId)
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

  // Upload log methods
  async getUploadLogs(): Promise<UploadLog[]> {
    return Array.from(this.uploadLogs.values())
      .filter(log => log.userId === this.currentUserId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async createUploadLog(insertUploadLog: InsertUploadLog): Promise<UploadLog> {
    const id = randomUUID();
    const uploadLog: UploadLog = {
      ...insertUploadLog,
      id,
      userId: this.currentUserId,
      uploadedAt: new Date(),
      processedAt: null,
      assignmentsCreated: 0,
      errorMessage: null,
    };
    this.uploadLogs.set(id, uploadLog);
    return uploadLog;
  }

  async updateUploadLog(id: string, updateUploadLog: UpdateUploadLog): Promise<UploadLog | undefined> {
    const existing = this.uploadLogs.get(id);
    if (!existing) return undefined;

    const updated: UploadLog = {
      ...existing,
      ...updateUploadLog,
    };
    this.uploadLogs.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
