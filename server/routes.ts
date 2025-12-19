import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertWorkoutPlanSchema, 
  insertDietPlanSchema,
  insertInjuryLogSchema,
  insertMeasurementLogSchema,
  insertItemCompletionSchema
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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

  // ==================== INJURY LOGS ====================

  // Get injury logs for a client
  app.get("/api/clients/:id/injuries", async (req, res) => {
    try {
      const logs = await storage.getInjuryLogsByClient(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch injury logs" });
    }
  });

  // Create injury log
  app.post("/api/clients/:id/injuries", async (req, res) => {
    try {
      // Ensure clientId in body matches URL param
      const data = { ...req.body, clientId: req.params.id };
      const parseResult = insertInjuryLogSchema.safeParse(data);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid injury log data",
          errors: parseResult.error.errors
        });
      }

      // Verify client exists
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const log = await storage.createInjuryLog(parseResult.data);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to create injury log" });
    }
  });

  // Delete injury log
  app.delete("/api/injuries/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInjuryLog(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Injury log not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete injury log" });
    }
  });

  // ==================== MEASUREMENT LOGS ====================

  // Get measurement logs for a client
  app.get("/api/clients/:id/measurements", async (req, res) => {
    try {
      const logs = await storage.getMeasurementLogsByClient(req.params.id);
      // Sort logs by date descending
      logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch measurement logs" });
    }
  });

  // Create measurement log
  app.post("/api/clients/:id/measurements", async (req, res) => {
    try {
      // Ensure clientId in body matches URL param
      const data = { ...req.body, clientId: req.params.id };
      const parseResult = insertMeasurementLogSchema.safeParse(data);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid measurement log data",
          errors: parseResult.error.errors
        });
      }

      // Verify client exists
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const log = await storage.createMeasurementLog(parseResult.data);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to create measurement log" });
    }
  });

  // Delete measurement log
  app.delete("/api/measurements/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMeasurementLog(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Measurement log not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete measurement log" });
    }
  });

  // ==================== PUBLIC PORTAL ====================

  app.get("/api/portal/:token", async (req, res) => {
    try {
      const client = await storage.getClientByToken(req.params.token);
      if (!client) {
        return res.status(404).json({ message: "Invalid portal token" });
      }

      const workoutPlans = await storage.getWorkoutPlansByClient(client.id);
      const dietPlans = await storage.getDietPlansByClient(client.id);
      const injuryLogs = await storage.getInjuryLogsByClient(client.id);
      const measurementLogs = await storage.getMeasurementLogsByClient(client.id);

      // Sort logs
      measurementLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      injuryLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Get latest active plans
      // For simplicity, we'll take the most recently created ones
      // In a real app, we might check month/year or an "active" flag
      const currentWorkoutPlan = workoutPlans[workoutPlans.length - 1] || null;
      const currentDietPlan = dietPlans[dietPlans.length - 1] || null;

      res.json({
        client: {
          name: client.name,
          goal: client.goal,
          fitnessLevel: client.fitnessLevel,
          notes: client.notes
        },
        currentWorkoutPlan,
        currentDietPlan,
        injuryLogs,
        measurementLogs
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to load portal data" });
    }
  });

  // ==================== ITEM COMPLETIONS ====================

  app.get("/api/portal/:token/completions", async (req, res) => {
    try {
      const client = await storage.getClientByToken(req.params.token);
      if (!client) {
        return res.status(404).json({ message: "Invalid portal token" });
      }
      const date = req.query.date as string;
      if (!date) {
        return res.status(400).json({ message: "Date parameter required" });
      }

      const completions = await storage.getItemCompletions(client.id, date);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  app.post("/api/portal/:token/completions", async (req, res) => {
    try {
      const client = await storage.getClientByToken(req.params.token);
      if (!client) {
        return res.status(404).json({ message: "Invalid portal token" });
      }

      const data = { ...req.body, clientId: client.id };
      const parseResult = insertItemCompletionSchema.safeParse(data);
      if (!parseResult.success) {
         return res.status(400).json({ message: "Invalid data", errors: parseResult.error.errors });
      }

      const completion = await storage.toggleItemCompletion(parseResult.data);
      res.json(completion);
    } catch (error) {
      res.status(500).json({ message: "Failed to update completion" });
    }
  });

  return httpServer;
}
