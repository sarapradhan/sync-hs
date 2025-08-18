import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';
import { MemStorage } from '../../server/storage';

describe('API Integration Tests', () => {
  let app: express.Application;
  let storage: MemStorage;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    
    // Reset storage for each test
    storage = new MemStorage();
    
    // Override the storage import in routes
    const routes = await import('../../server/routes');
    (routes as any).storage = storage;
    
    await registerRoutes(app);
  });

  describe('Assignment API', () => {
    it('should create a new assignment', async () => {
      const assignmentData = {
        title: 'Test Assignment',
        description: 'Test description',
        subject: 'Math',
        dueDate: '2024-12-25T23:59:00.000Z',
        priority: 'medium',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/assignments')
        .send(assignmentData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Test Assignment',
        description: 'Test description',
        subject: 'Math',
        priority: 'medium',
        status: 'pending'
      });
      expect(response.body.id).toBeDefined();
    });

    it('should get all assignments', async () => {
      // Create a test assignment first
      await storage.createAssignment({
        title: 'Test Assignment',
        subject: 'Math',
        dueDate: '2024-12-25T23:59:00.000Z',
        priority: 'medium',
        status: 'pending'
      });

      const response = await request(app)
        .get('/api/assignments')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should update an assignment', async () => {
      const assignment = await storage.createAssignment({
        title: 'Test Assignment',
        subject: 'Math',
        dueDate: '2024-12-25T23:59:00.000Z',
        priority: 'medium',
        status: 'pending'
      });

      const updateData = { status: 'completed', progress: 100 };

      const response = await request(app)
        .put(`/api/assignments/${assignment.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.progress).toBe(100);
    });

    it('should delete an assignment', async () => {
      const assignment = await storage.createAssignment({
        title: 'Test Assignment',
        subject: 'Math',
        dueDate: '2024-12-25T23:59:00.000Z',
        priority: 'medium',
        status: 'pending'
      });

      await request(app)
        .delete(`/api/assignments/${assignment.id}`)
        .expect(204);

      // Verify assignment is deleted
      const assignments = await storage.getAssignments();
      expect(assignments.find(a => a.id === assignment.id)).toBeUndefined();
    });

    it('should clear all assignments', async () => {
      // Create multiple assignments
      await storage.createAssignment({
        title: 'Assignment 1',
        subject: 'Math',
        dueDate: '2024-12-25T23:59:00.000Z',
        priority: 'medium',
        status: 'pending'
      });

      await storage.createAssignment({
        title: 'Assignment 2',
        subject: 'Science',
        dueDate: '2024-12-26T23:59:00.000Z',
        priority: 'high',
        status: 'pending'
      });

      await request(app)
        .delete('/api/assignments')
        .expect(200);

      // Verify all assignments are cleared
      const assignments = await storage.getAssignments();
      expect(assignments.length).toBe(0);
    });

    it('should return 404 for non-existent assignment', async () => {
      await request(app)
        .get('/api/assignments/non-existent-id')
        .expect(404);
    });

    it('should validate assignment data', async () => {
      const invalidData = {
        title: '', // Empty title should be invalid
        subject: 'Math'
      };

      await request(app)
        .post('/api/assignments')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Subject API', () => {
    it('should get all subjects', async () => {
      const response = await request(app)
        .get('/api/subjects')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0); // Default subjects should exist
    });

    it('should update a subject color', async () => {
      const subjects = await storage.getSubjects();
      const subject = subjects[0];

      const updateData = { color: '#FF0000' };

      const response = await request(app)
        .put(`/api/subjects/${subject.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.color).toBe('#FF0000');
    });
  });

  describe('User API', () => {
    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get current user', async () => {
      const response = await request(app)
        .get('/api/users/current')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });

    it('should switch users', async () => {
      const users = await storage.getUsers();
      const targetUser = users[1];

      const response = await request(app)
        .post('/api/users/switch')
        .send({ userId: targetUser.id })
        .expect(200);

      expect(response.body.id).toBe(targetUser.id);
    });
  });

  describe('Data Management API', () => {
    it('should clear all data', async () => {
      // Create some test data
      await storage.createAssignment({
        title: 'Test Assignment',
        subject: 'Math',
        dueDate: '2024-12-25T23:59:00.000Z',
        priority: 'medium',
        status: 'pending'
      });

      await request(app)
        .delete('/api/data/clear')
        .expect(200);

      // Verify data is cleared
      const assignments = await storage.getAssignments();
      expect(assignments.length).toBe(0);
    });
  });

  describe('Stats API', () => {
    it('should return assignment statistics', async () => {
      // Create test assignments with different statuses and due dates
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await storage.createAssignment({
        title: 'Due Today',
        subject: 'Math',
        dueDate: today.toISOString(),
        priority: 'high',
        status: 'pending'
      });

      await storage.createAssignment({
        title: 'Due Tomorrow',
        subject: 'Science',
        dueDate: tomorrow.toISOString(),
        priority: 'medium',
        status: 'pending'
      });

      await storage.createAssignment({
        title: 'Completed',
        subject: 'English',
        dueDate: tomorrow.toISOString(),
        priority: 'low',
        status: 'completed'
      });

      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toHaveProperty('dueToday');
      expect(response.body).toHaveProperty('thisWeek');
      expect(response.body).toHaveProperty('completed');
      expect(response.body).toHaveProperty('total');
      expect(typeof response.body.dueToday).toBe('number');
      expect(typeof response.body.thisWeek).toBe('number');
      expect(typeof response.body.completed).toBe('number');
      expect(typeof response.body.total).toBe('number');
    });
  });
});