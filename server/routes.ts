import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssignmentSchema, updateAssignmentSchema, insertSubjectSchema } from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";
import { z } from "zod";
import * as XLSX from "xlsx";


export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/current", async (req, res) => {
    try {
      const user = await storage.getCurrentUser();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current user" });
    }
  });

  app.post("/api/users/switch", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const user = await storage.switchUser(userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to switch user" });
    }
  });

  // Assignment routes
  app.get("/api/assignments", async (req, res) => {
    try {
      const { status, subject } = req.query;
      
      let assignments;
      if (status && typeof status === 'string') {
        assignments = await storage.getAssignmentsByStatus(status);
      } else if (subject && typeof subject === 'string') {
        assignments = await storage.getAssignmentsBySubject(subject);
      } else {
        assignments = await storage.getAssignments();
      }
      
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get("/api/assignments/upcoming", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const assignments = await storage.getUpcomingAssignments(limit);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming assignments" });
    }
  });

  app.get("/api/assignments/:id", async (req, res) => {
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

  app.post("/api/assignments", async (req, res) => {
    try {
      const validatedData = insertAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  app.put("/api/assignments/:id", async (req, res) => {
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

  app.delete("/api/assignments/:id", async (req, res) => {
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

  // Delete all assignments (for clearing duplicates)
  app.delete("/api/assignments", async (req, res) => {
    try {
      await storage.clearAllAssignments();
      res.json({ message: "All assignments deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete assignments" });
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
  app.get("/api/stats", async (req, res) => {
    try {
      const assignments = await storage.getAssignments();
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

  // Direct file upload for spreadsheets - using dynamic import for ES modules
  const multer = (await import('multer')).default;
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
        'text/plain', // Sometimes CSV files are detected as plain text
        'application/csv', // Alternative CSV MIME type
        'application/octet-stream' // Generic binary - check extension
      ];
      
      // Also check file extension as backup
      const allowedExtensions = ['.xlsx', '.xls', '.csv'];
      const hasValidExtension = allowedExtensions.some(ext => 
        file.originalname.toLowerCase().endsWith(ext)
      );
      
      if (allowedTypes.includes(file.mimetype) || hasValidExtension) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed. Only Excel (.xlsx, .xls) and CSV files are accepted.`));
      }
    }
  });

  app.post("/api/spreadsheet/upload", upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const currentUser = await storage.getCurrentUser();
      const filename = req.file.originalname;
      const fileBuffer = req.file.buffer;

      // Create upload log
      const uploadLog = await storage.createUploadLog({
        userId: currentUser.id,
        filename,
        status: "processing",
      });

      try {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        let assignmentsCreated = 0;
        const errors: string[] = [];

        
        // Process each row
        for (const row of data as any[]) {
          try {
            // Map spreadsheet columns to assignment fields (supports multiple column name variations)
            const title = row.Title || row.title || row.TITLE || row.Assignment || row.assignment || 
                         row.ASSIGNMENT || row.Task || row.task || row.TASK || row.Name || row.name || row.NAME;
            
            const subject = row.Subject || row.subject || row.SUBJECT || row.Course || row.course || 
                           row.COURSE || row.Class || row.class || row.CLASS;
            
            const dueDate = row['Due Date'] || row.DueDate || row['due date'] || row.dueDate || 
                           row.DUE_DATE || row['DUE Date'] || row['Due'] || row.due || row.DUE || 
                           row.Date || row.date || row.DATE || row.Deadline || row.deadline || row.DEADLINE;
            
            const description = row.Description || row.description || row.DESCRIPTION || 
                               row.Details || row.details || row.DETAILS || row.Notes || row.notes || 
                               row.NOTES || row.Instructions || row.instructions || row.INSTRUCTIONS || "";
            
            const priority = (row.Priority || row.priority || row.PRIORITY || row.Importance || 
                             row.importance || row.IMPORTANCE || "medium").toString().toLowerCase();
            
            const teacher = row.Teacher || row.teacher || row.TEACHER || row.Instructor || 
                           row.instructor || row.INSTRUCTOR || row.Professor || row.professor || 
                           row.PROFESSOR || "";

            // Additional fields for better assignment tracking
            const status = (row.Status || row.status || row.STATUS || "pending").toString().toLowerCase();
            const progress = parseInt(row.Progress || row.progress || row.PROGRESS || "0") || 0;

            if (!title || !subject || !dueDate) {
              errors.push(`Skipping row with missing required fields: Title="${title}", Subject="${subject}", DueDate="${dueDate}"`);
              continue;
            }

            // Enhanced date parsing
            let parsedDueDate: Date;
            if (typeof dueDate === 'number') {
              // Handle Excel serial date numbers (days since 1900-01-01)
              parsedDueDate = new Date((dueDate - 25569) * 86400 * 1000);
            } else if (typeof dueDate === 'string') {
              // Try multiple date formats
              const cleanDate = dueDate.trim();
              parsedDueDate = new Date(cleanDate);
              
              // If basic parsing fails, try common formats
              if (isNaN(parsedDueDate.getTime())) {
                const formats = [
                  // MM/DD/YYYY
                  /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                  // DD/MM/YYYY
                  /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                  // YYYY-MM-DD
                  /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
                ];
                
                for (const format of formats) {
                  const match = cleanDate.match(format);
                  if (match) {
                    if (cleanDate.includes('-')) {
                      // ISO format
                      parsedDueDate = new Date(cleanDate);
                    } else {
                      // Assume MM/DD/YYYY for slash format
                      const [, month, day, year] = match;
                      parsedDueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    }
                    break;
                  }
                }
              }
            } else if (typeof dueDate === 'number') {
              // Excel date serial number
              parsedDueDate = new Date((dueDate - 25569) * 86400 * 1000);
            } else {
              parsedDueDate = new Date(dueDate);
            }

            if (isNaN(parsedDueDate.getTime())) {
              errors.push(`Invalid date format for assignment "${title}": ${dueDate}`);
              continue;
            }

            // Validate and normalize priority
            const validPriorities = ['low', 'medium', 'high'];
            let finalPriority = 'medium';
            
            if (validPriorities.includes(priority)) {
              finalPriority = priority;
            } else if (priority.includes('high') || priority.includes('urgent') || priority === '3') {
              finalPriority = 'high';
            } else if (priority.includes('low') || priority === '1') {
              finalPriority = 'low';
            }

            // Validate and normalize status
            const validStatuses = ['pending', 'in-progress', 'completed'];
            let finalStatus = 'pending';
            
            if (validStatuses.includes(status)) {
              finalStatus = status;
            } else if (status.includes('complete') || status.includes('done') || status.includes('finished')) {
              finalStatus = 'completed';
            } else if (status.includes('progress') || status.includes('working') || status.includes('started')) {
              finalStatus = 'in-progress';
            }

            // Create assignment with all parsed data
            const assignmentData = {
              userId: currentUser.id,
              title: String(title).trim(),
              subject: String(subject).trim(),
              description: String(description).trim(),
              dueDate: parsedDueDate,
              priority: finalPriority as 'low' | 'medium' | 'high',
              status: finalStatus as 'pending' | 'in-progress' | 'completed',
              progress: Math.min(Math.max(progress, 0), 100), // Clamp between 0-100
              teacher: String(teacher).trim() || undefined,
            };

            // Check for duplicate assignments (same title, subject, and due date)
            const existingAssignments = await storage.getAssignments();
            const isDuplicate = existingAssignments.some((existing: any) => 
              existing.title === assignmentData.title &&
              existing.subject === assignmentData.subject &&
              new Date(existing.dueDate).toDateString() === assignmentData.dueDate.toDateString()
            );

            if (!isDuplicate) {
              await storage.createAssignment(assignmentData);
              assignmentsCreated++;
            } else {
              errors.push(`Skipping duplicate assignment: ${assignmentData.title} (${assignmentData.subject})`);
            }
          } catch (error: any) {
            errors.push(`Error processing assignment: ${error.message}`);
          }
        }

        // Update upload log
        await storage.updateUploadLog(uploadLog.id, {
          status: "completed",
          processedAt: new Date(),
          assignmentsCreated,
          errorMessage: errors.length > 0 ? errors.join('; ') : null,
        });

        res.json({
          assignmentsCreated,
          errors: errors.length > 0 ? errors : undefined,
          message: assignmentsCreated > 0 ? `Successfully imported ${assignmentsCreated} assignments` : 'No assignments were imported - check the errors below',
        });

      } catch (error: any) {
        // Update upload log with error
        await storage.updateUploadLog(uploadLog.id, {
          status: "failed",
          processedAt: new Date(),
          errorMessage: error.message,
        });

        throw error;
      }

    } catch (error: any) {
      console.error("Error processing spreadsheet:", error);
      res.status(500).json({ 
        message: "Failed to process spreadsheet", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
