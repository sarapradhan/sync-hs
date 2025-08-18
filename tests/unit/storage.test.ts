import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from '../../server/storage';
import type { InsertAssignment, InsertSubject, InsertUser } from '../../shared/schema';

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('User Management', () => {
    it('should create a user', async () => {
      const userData: InsertUser = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const user = await storage.createUser(userData);
      
      expect(user).toMatchObject({
        name: 'Test User',
        email: 'test@example.com'
      });
      expect(user.id).toBeDefined();
    });

    it('should get all users', async () => {
      const users = await storage.getUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0); // Default users should exist
    });

    it('should switch users', async () => {
      const users = await storage.getUsers();
      const targetUser = users[1];
      
      const switchedUser = await storage.switchUser(targetUser.id);
      expect(switchedUser.id).toBe(targetUser.id);
      
      const currentUser = await storage.getCurrentUser();
      expect(currentUser.id).toBe(targetUser.id);
    });
  });

  describe('Assignment Management', () => {
    it('should create an assignment', async () => {
      const assignmentData: InsertAssignment = {
        title: 'Test Assignment',
        description: 'Test description',
        subject: 'Math',
        dueDate: new Date('2024-12-25T23:59:00.000Z'),
        priority: 'medium',
        status: 'pending'
      };

      const assignment = await storage.createAssignment(assignmentData);
      
      expect(assignment).toMatchObject({
        title: 'Test Assignment',
        description: 'Test description',
        subject: 'Math',
        priority: 'medium',
        status: 'pending'
      });
      expect(assignment.id).toBeDefined();
    });

    it('should get all assignments for current user', async () => {
      const assignmentData: InsertAssignment = {
        title: 'Test Assignment',
        subject: 'Math',
        dueDate: new Date('2024-12-25T23:59:00.000Z'),
        priority: 'medium',
        status: 'pending'
      };

      await storage.createAssignment(assignmentData);
      const assignments = await storage.getAssignments();
      
      expect(assignments.length).toBeGreaterThan(0);
      expect(assignments[0].userId).toBe(storage.getCurrentUserId());
    });

    it('should update an assignment', async () => {
      const assignmentData: InsertAssignment = {
        title: 'Test Assignment',
        subject: 'Math',
        dueDate: new Date('2024-12-25T23:59:00.000Z'),
        priority: 'medium',
        status: 'pending'
      };

      const assignment = await storage.createAssignment(assignmentData);
      const updated = await storage.updateAssignment(assignment.id, { 
        status: 'completed',
        progress: 100 
      });
      
      expect(updated?.status).toBe('completed');
      expect(updated?.progress).toBe(100);
    });

    it('should delete an assignment', async () => {
      const assignmentData: InsertAssignment = {
        title: 'Test Assignment',
        subject: 'Math',
        dueDate: new Date('2024-12-25T23:59:00.000Z'),
        priority: 'medium',
        status: 'pending'
      };

      const assignment = await storage.createAssignment(assignmentData);
      const deleted = await storage.deleteAssignment(assignment.id);
      
      expect(deleted).toBe(true);
      
      const assignments = await storage.getAssignments();
      expect(assignments.find(a => a.id === assignment.id)).toBeUndefined();
    });

    it('should clear all assignments', async () => {
      const assignmentData: InsertAssignment = {
        title: 'Test Assignment',
        subject: 'Math',
        dueDate: new Date('2024-12-25T23:59:00.000Z'),
        priority: 'medium',
        status: 'pending'
      };

      await storage.createAssignment(assignmentData);
      await storage.clearAllAssignments();
      
      const assignments = await storage.getAssignments();
      expect(assignments.length).toBe(0);
    });

    it('should filter assignments by status', async () => {
      const pendingAssignment: InsertAssignment = {
        title: 'Pending Assignment',
        subject: 'Math',
        dueDate: new Date('2024-12-25T23:59:00.000Z'),
        priority: 'medium',
        status: 'pending'
      };

      const completedAssignment: InsertAssignment = {
        title: 'Completed Assignment',
        subject: 'Math',
        dueDate: new Date('2024-12-25T23:59:00.000Z'),
        priority: 'medium',
        status: 'completed'
      };

      await storage.createAssignment(pendingAssignment);
      await storage.createAssignment(completedAssignment);
      
      const pendingAssignments = await storage.getAssignmentsByStatus('pending');
      const completedAssignments = await storage.getAssignmentsByStatus('completed');
      
      expect(pendingAssignments.length).toBe(1);
      expect(completedAssignments.length).toBe(1);
      expect(pendingAssignments[0].status).toBe('pending');
      expect(completedAssignments[0].status).toBe('completed');
    });
  });

  describe('Subject Management', () => {
    it('should create a subject', async () => {
      const subjectData: InsertSubject = {
        name: 'Test Subject',
        color: '#FF0000',
        teacher: 'Test Teacher'
      };

      const subject = await storage.createSubject(subjectData);
      
      expect(subject).toMatchObject({
        name: 'Test Subject',
        color: '#FF0000',
        teacher: 'Test Teacher'
      });
      expect(subject.id).toBeDefined();
    });

    it('should get all subjects', async () => {
      const subjects = await storage.getSubjects();
      expect(Array.isArray(subjects)).toBe(true);
      expect(subjects.length).toBeGreaterThan(0); // Default subjects should exist
    });

    it('should update a subject', async () => {
      const subjects = await storage.getSubjects();
      const subject = subjects[0];
      
      const updated = await storage.updateSubject(subject.id, { color: '#00FF00' });
      expect(updated?.color).toBe('#00FF00');
    });
  });

  describe('Data Management', () => {
    it('should clear all data and reinitialize defaults', async () => {
      // Create some test data
      await storage.createAssignment({
        title: 'Test Assignment',
        subject: 'Math',
        dueDate: new Date('2024-12-25T23:59:00.000Z'),
        priority: 'medium',
        status: 'pending'
      });

      await storage.clearAllData();
      
      // Check that assignments are cleared
      const assignments = await storage.getAssignments();
      expect(assignments.length).toBe(0);
      
      // Check that default subjects are restored
      const subjects = await storage.getSubjects();
      expect(subjects.length).toBeGreaterThan(0);
      
      // Check that users are preserved but reinitialized
      const users = await storage.getUsers();
      expect(users.length).toBeGreaterThan(0);
    });
  });
});