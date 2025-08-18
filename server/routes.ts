import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { insertAssignmentSchema, updateAssignmentSchema, insertSubjectSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Auth routes are now handled in setupAuth

  // Assignment routes (protected)
  app.get("/api/assignments", requireAuth, async (req: any, res) => {
    try {
      const { status, subject } = req.query;
      const userId = req.user.id;
      
      let assignments;
      if (status && typeof status === 'string') {
        assignments = await storage.getAssignmentsByStatus(status, userId);
      } else if (subject && typeof subject === 'string') {
        assignments = await storage.getAssignmentsBySubject(subject, userId);
      } else {
        assignments = await storage.getAssignments(userId);
      }
      
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get("/api/assignments/upcoming", requireAuth, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const userId = req.user.id;
      const assignments = await storage.getUpcomingAssignments(limit, userId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming assignments" });
    }
  });

  app.get("/api/assignments/:id", requireAuth, async (req, res) => {
    try {
      const assignment = await storage.getAssignment(req.params.id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignment" });
    }
  });

  app.post("/api/assignments", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertAssignmentSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const assignment = await storage.createAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  app.put("/api/assignments/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = updateAssignmentSchema.parse(req.body);
      const assignment = await storage.updateAssignment(req.params.id, validatedData);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update assignment" });
    }
  });

  app.delete("/api/assignments/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteAssignment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });

  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const validatedData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(validatedData);
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const assignments = await storage.getAssignments(userId);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const stats = {
        dueToday: assignments.filter(a => {
          const dueDate = new Date(a.dueDate);
          const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          return dueDateOnly.getTime() === today.getTime() && a.status !== 'completed';
        }).length,
        thisWeek: assignments.filter(a => {
          const dueDate = new Date(a.dueDate);
          return dueDate >= today && dueDate <= weekFromNow && a.status !== 'completed';
        }).length,
        completed: assignments.filter(a => a.status === 'completed').length,
        totalActive: assignments.filter(a => a.status !== 'completed').length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Google Calendar integration endpoints (mock)
  app.post("/api/google/calendar/import", async (req, res) => {
    try {
      // Mock implementation - in real app would integrate with Google Calendar API
      res.json({ message: "Calendar import functionality would be implemented here" });
    } catch (error) {
      res.status(500).json({ message: "Failed to import from Google Calendar" });
    }
  });

  // Google Sheets export endpoint (mock)
  app.post("/api/google/sheets/export", async (req, res) => {
    try {
      // Mock implementation - in real app would integrate with Google Sheets API
      const assignments = await storage.getAssignments();
      res.json({ 
        message: "Sheets export functionality would be implemented here",
        data: assignments
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export to Google Sheets" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
