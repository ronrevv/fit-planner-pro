import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertWorkoutPlanSchema, 
  insertDietPlanSchema 
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

  return httpServer;
}
