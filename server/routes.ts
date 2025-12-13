import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertWorkoutPlanSchema, 
  insertDietPlanSchema,
  insertProgressSchema,
  insertDailyLogSchema,
  insertInjurySchema,
  insertTrainerNoteSchema
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==================== PORTAL ====================

  // Get client by portal key
  app.get("/api/portal/:key", async (req, res) => {
    try {
      const client = await storage.getClientByPortalKey(req.params.key);
      if (!client) {
        return res.status(404).json({ message: "Invalid portal key" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to load portal" });
    }
  });

  // ==================== PROGRESS & LOGS ====================

  // Get progress for a client
  app.get("/api/clients/:id/progress", async (req, res) => {
    try {
      const progress = await storage.getProgressByClient(req.params.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Add progress entry
  app.post("/api/clients/:id/progress", async (req, res) => {
    try {
      const parseResult = insertProgressSchema.safeParse({
        ...req.body,
        clientId: req.params.id
      });

      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid progress data",
          errors: parseResult.error.errors
        });
      }

      const progress = await storage.addProgress(parseResult.data);
      res.status(201).json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to add progress" });
    }
  });

  // Get daily logs for a client
  app.get("/api/clients/:id/logs", async (req, res) => {
    try {
      const logs = await storage.getDailyLogsByClient(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Create/Update daily log
  app.post("/api/clients/:id/logs", async (req, res) => {
    try {
      const parseResult = insertDailyLogSchema.safeParse({
        ...req.body,
        clientId: req.params.id
      });

      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid log data",
          errors: parseResult.error.errors
        });
      }

      const log = await storage.createOrUpdateDailyLog(parseResult.data);
      res.json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to update daily log" });
    }
  });

  // ==================== INJURIES ====================

  app.get("/api/clients/:id/injuries", async (req, res) => {
    try {
      const injuries = await storage.getInjuriesByClient(req.params.id);
      res.json(injuries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch injuries" });
    }
  });

  app.post("/api/clients/:id/injuries", async (req, res) => {
    try {
      console.log(`[API] POST /api/clients/${req.params.id}/injuries`, req.body);
      const parseResult = insertInjurySchema.safeParse({
        ...req.body,
        clientId: req.params.id
      });

      if (!parseResult.success) {
        console.error("[API] Invalid injury data:", parseResult.error);
        return res.status(400).json({ message: "Invalid injury data" });
      }

      const injury = await storage.addInjury(parseResult.data);
      res.status(201).json(injury);
    } catch (error) {
      console.error("[API] Failed to add injury:", error);
      res.status(500).json({ message: "Failed to add injury" });
    }
  });

  app.patch("/api/injuries/:id", async (req, res) => {
    try {
      const injury = await storage.updateInjury(req.params.id, req.body);
      res.json(injury);
    } catch (error) {
      res.status(500).json({ message: "Failed to update injury" });
    }
  });

  // ==================== TRAINER NOTES ====================

  app.get("/api/clients/:id/notes", async (req, res) => {
    try {
      const notes = await storage.getTrainerNotesByClient(req.params.id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/clients/:id/notes", async (req, res) => {
    try {
      console.log(`[API] POST /api/clients/${req.params.id}/notes`, req.body);
      const parseResult = insertTrainerNoteSchema.safeParse({
        ...req.body,
        clientId: req.params.id
      });

      if (!parseResult.success) {
        console.error("[API] Invalid note data:", parseResult.error);
        return res.status(400).json({ message: "Invalid note data" });
      }

      const note = await storage.addTrainerNote(parseResult.data);
      res.status(201).json(note);
    } catch (error) {
      console.error("[API] Failed to add note:", error);
      res.status(500).json({ message: "Failed to add note" });
    }
  });

  // ==================== CLIENTS ====================
  
  // Get all clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Get single client
  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  // Create client
  app.post("/api/clients", async (req, res) => {
    try {
      const parseResult = insertClientSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid client data", 
          errors: parseResult.error.errors 
        });
      }
      
      const client = await storage.createClient(parseResult.data);
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  // Update client
  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const parseResult = insertClientSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid client data", 
          errors: parseResult.error.errors 
        });
      }
      
      const client = await storage.updateClient(req.params.id, parseResult.data);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  // Delete client
  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // ==================== WORKOUT PLANS ====================

  // Get all workout plans (optionally filtered by clientId)
  app.get("/api/workout-plans", async (req, res) => {
    try {
      const clientId = req.query.clientId as string | undefined;
      let plans;
      
      if (clientId) {
        plans = await storage.getWorkoutPlansByClient(clientId);
      } else {
        plans = await storage.getAllWorkoutPlans();
      }
      
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  // Get single workout plan
  app.get("/api/workout-plans/:id", async (req, res) => {
    try {
      const plan = await storage.getWorkoutPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plan" });
    }
  });

  // Create workout plan
  app.post("/api/workout-plans", async (req, res) => {
    try {
      const parseResult = insertWorkoutPlanSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid workout plan data", 
          errors: parseResult.error.errors 
        });
      }

      // Verify client exists
      const client = await storage.getClient(parseResult.data.clientId);
      if (!client) {
        return res.status(400).json({ message: "Client not found" });
      }
      
      const plan = await storage.createWorkoutPlan(parseResult.data);
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  // Update workout plan
  app.patch("/api/workout-plans/:id", async (req, res) => {
    try {
      const parseResult = insertWorkoutPlanSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid workout plan data", 
          errors: parseResult.error.errors 
        });
      }
      
      const plan = await storage.updateWorkoutPlan(req.params.id, parseResult.data);
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workout plan" });
    }
  });

  // Delete workout plan
  app.delete("/api/workout-plans/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWorkoutPlan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workout plan" });
    }
  });

  // ==================== DIET PLANS ====================

  // Get all diet plans (optionally filtered by clientId)
  app.get("/api/diet-plans", async (req, res) => {
    try {
      const clientId = req.query.clientId as string | undefined;
      let plans;
      
      if (clientId) {
        plans = await storage.getDietPlansByClient(clientId);
      } else {
        plans = await storage.getAllDietPlans();
      }
      
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch diet plans" });
    }
  });

  // Get single diet plan
  app.get("/api/diet-plans/:id", async (req, res) => {
    try {
      const plan = await storage.getDietPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Diet plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch diet plan" });
    }
  });

  // Create diet plan
  app.post("/api/diet-plans", async (req, res) => {
    try {
      const parseResult = insertDietPlanSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid diet plan data", 
          errors: parseResult.error.errors 
        });
      }

      // Verify client exists
      const client = await storage.getClient(parseResult.data.clientId);
      if (!client) {
        return res.status(400).json({ message: "Client not found" });
      }
      
      const plan = await storage.createDietPlan(parseResult.data);
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create diet plan" });
    }
  });

  // Update diet plan
  app.patch("/api/diet-plans/:id", async (req, res) => {
    try {
      const parseResult = insertDietPlanSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid diet plan data", 
          errors: parseResult.error.errors 
        });
      }
      
      const plan = await storage.updateDietPlan(req.params.id, parseResult.data);
      if (!plan) {
        return res.status(404).json({ message: "Diet plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update diet plan" });
    }
  });

  // Delete diet plan
  app.delete("/api/diet-plans/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDietPlan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Diet plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete diet plan" });
    }
  });

  return httpServer;
}
