import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertWorkoutPlanSchema, 
  insertDietPlanSchema,
  insertInjuryLogSchema,
  insertMeasurementLogSchema,
  insertItemCompletionSchema,
  insertGymSchema,
  insertUserSchema,
  UserRole,
  type User
} from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is Super Admin
const isSuperAdmin = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Super Admin access required" });
};

// Middleware to check if user is Gym Admin or Super Admin
const isGymAdmin = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() &&
      (req.user.role === UserRole.GYM_ADMIN || req.user.role === UserRole.SUPER_ADMIN)) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Gym Admin access required" });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==================== GYMS & USERS (ADMIN) ====================

  // Create Gym (Super Admin only)
  app.post("/api/gyms", isSuperAdmin, async (req, res) => {
    try {
      const parseResult = insertGymSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid gym data",
          errors: parseResult.error.errors
        });
      }

      // Check for slug uniqueness
      const existingGym = await storage.getGymBySlug(parseResult.data.slug);
      if (existingGym) {
        return res.status(409).json({ message: "Gym with this slug already exists" });
      }

      const gym = await storage.createGym(parseResult.data);
      res.status(201).json(gym);
    } catch (error) {
      res.status(500).json({ message: "Failed to create gym" });
    }
  });

  // Create User (Admin/Gym Admin)
  app.post("/api/users", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const parseResult = insertUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: parseResult.error.errors
        });
      }

      const data = parseResult.data;

      if (user.role !== UserRole.SUPER_ADMIN) {
        // If not super admin, must be gym admin creating a trainer for THEIR gym
        if (user.role !== UserRole.GYM_ADMIN) {
           return res.status(403).json({ message: "Forbidden" });
        }
        if (data.role !== UserRole.TRAINER) {
           return res.status(403).json({ message: "Gym Admins can only create Trainers" });
        }
        if (data.gymId !== user.gymId) {
           return res.status(403).json({ message: "Cannot create user for another gym" });
        }
      }

      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const newUser = await storage.createUser(data);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get Users by Gym (Gym Admin/Super Admin)
  app.get("/api/gyms/:id/users", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const gymId = req.params.id;

      // Access control
      if (user.role !== UserRole.SUPER_ADMIN) {
        if (user.role !== UserRole.GYM_ADMIN || user.gymId !== gymId) {
           return res.status(403).json({ message: "Forbidden" });
        }
      }

      const users = await storage.getUsersByGym(gymId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // ==================== CLIENTS ====================
  
  // Get all clients
  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      // Context Awareness: Filter by Gym/Trainer
      let gymId = undefined;
      let trainerId = undefined;

      if (user.role === UserRole.GYM_ADMIN) {
        gymId = user.gymId;
      } else if (user.role === UserRole.TRAINER) {
        gymId = user.gymId;
        trainerId = user.id;
      } else if (user.role === UserRole.SUPER_ADMIN) {
        // Super Admin sees all
      }

      const clients = await storage.getAllClients(gymId, trainerId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Get single client
  app.get("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Security check: Ensure client belongs to user's gym/scope
      if (user.role !== UserRole.SUPER_ADMIN) {
         if (user.gymId !== client.gymId) {
            return res.status(403).json({ message: "Access denied" });
         }
         if (user.role === UserRole.TRAINER && client.trainerId !== user.id) {
            return res.status(403).json({ message: "Access denied" });
         }
      }

      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  // Create client
  app.post("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;

      // Construct the data object merging body with auth context
      const data = { ...req.body };

      if (user.role !== UserRole.SUPER_ADMIN) {
         if (!user.gymId) {
             return res.status(400).json({ message: "User not associated with a gym" });
         }
         data.gymId = user.gymId;

         if (user.role === UserRole.TRAINER) {
            data.trainerId = user.id;
         }
         // If Gym Admin, they can provide trainerId in body, or we error during validation if missing
      }

      const parseResult = insertClientSchema.safeParse(data);
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
  app.patch("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const existing = await storage.getClient(req.params.id);
      if (!existing) return res.status(404).json({ message: "Client not found" });

      if (user.role !== UserRole.SUPER_ADMIN) {
        if (existing.gymId !== user.gymId) return res.status(403).json({ message: "Access denied" });
        if (user.role === UserRole.TRAINER && existing.trainerId !== user.id) {
           return res.status(403).json({ message: "Access denied" });
        }
      }

      const parseResult = insertClientSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid client data", 
          errors: parseResult.error.errors 
        });
      }
      
      const client = await storage.updateClient(req.params.id, parseResult.data);
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  // Delete client
  app.delete("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const existing = await storage.getClient(req.params.id);
      if (!existing) return res.status(404).json({ message: "Client not found" });

      if (user.role !== UserRole.SUPER_ADMIN) {
        if (existing.gymId !== user.gymId) return res.status(403).json({ message: "Access denied" });
        if (user.role === UserRole.TRAINER && existing.trainerId !== user.id) {
           return res.status(403).json({ message: "Access denied" });
        }
      }

      await storage.deleteClient(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // ==================== WORKOUT PLANS ====================

  // Get all workout plans (optionally filtered by clientId)
  app.get("/api/workout-plans", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const clientId = req.query.clientId as string | undefined;
      let plans;
      
      if (clientId) {
        // Check access to client
        const client = await storage.getClient(clientId);
        if (client) {
            if (user.role !== UserRole.SUPER_ADMIN) {
                if (client.gymId !== user.gymId) return res.status(403).json({ message: "Access denied" });
                if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Access denied" });
            }
        }
        plans = await storage.getWorkoutPlansByClient(clientId);
      } else {
        const allPlans = await storage.getAllWorkoutPlans();
        const accessiblePlans = [];

        for (const plan of allPlans) {
            const client = await storage.getClient(plan.clientId);
            if (client) {
                if (user.role === UserRole.SUPER_ADMIN) {
                    accessiblePlans.push(plan);
                } else if (client.gymId === user.gymId) {
                    if (user.role === UserRole.TRAINER && client.trainerId !== user.id) continue;
                    accessiblePlans.push(plan);
                }
            }
        }
        plans = accessiblePlans;
      }
      
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  // Get single workout plan
  app.get("/api/workout-plans/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const plan = await storage.getWorkoutPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }

      const client = await storage.getClient(plan.clientId);
      if (client) {
         if (user.role !== UserRole.SUPER_ADMIN) {
             if (client.gymId !== user.gymId) return res.status(403).json({ message: "Access denied" });
             if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Access denied" });
         }
      }

      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plan" });
    }
  });

  // Create workout plan
  app.post("/api/workout-plans", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const parseResult = insertWorkoutPlanSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid workout plan data", 
          errors: parseResult.error.errors 
        });
      }

      // Verify client exists and access
      const client = await storage.getClient(parseResult.data.clientId);
      if (!client) {
        return res.status(400).json({ message: "Client not found" });
      }

      if (user.role !== UserRole.SUPER_ADMIN) {
          if (client.gymId !== user.gymId) return res.status(403).json({ message: "Access denied" });
          if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Access denied" });
      }
      
      const plan = await storage.createWorkoutPlan(parseResult.data);
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  // Update workout plan
  app.patch("/api/workout-plans/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const parseResult = insertWorkoutPlanSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid workout plan data", 
          errors: parseResult.error.errors 
        });
      }
      
      const plan = await storage.getWorkoutPlan(req.params.id);
      if (!plan) return res.status(404).json({ message: "Not found" });

      const client = await storage.getClient(plan.clientId);
      if (client && user.role !== UserRole.SUPER_ADMIN) {
         if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
         if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
      }

      const updatedPlan = await storage.updateWorkoutPlan(req.params.id, parseResult.data);
      res.json(updatedPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workout plan" });
    }
  });

  // Delete workout plan
  app.delete("/api/workout-plans/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const plan = await storage.getWorkoutPlan(req.params.id);
      if (!plan) return res.status(404).json({ message: "Not found" });

      const client = await storage.getClient(plan.clientId);
      if (client && user.role !== UserRole.SUPER_ADMIN) {
         if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
         if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
      }

      await storage.deleteWorkoutPlan(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workout plan" });
    }
  });

  // ==================== DIET PLANS ====================

  app.get("/api/diet-plans", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const clientId = req.query.clientId as string | undefined;
      let plans;
      if (clientId) {
        const client = await storage.getClient(clientId);
        if (client && user.role !== UserRole.SUPER_ADMIN) {
            if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
            if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
        }
        plans = await storage.getDietPlansByClient(clientId);
      } else {
        const all = await storage.getAllDietPlans();
        const accessible = [];
        for (const p of all) {
            const c = await storage.getClient(p.clientId);
            if (c) {
                if (user.role === UserRole.SUPER_ADMIN) { accessible.push(p); }
                else if (c.gymId === user.gymId) {
                    if (user.role === UserRole.TRAINER && c.trainerId !== user.id) continue;
                    accessible.push(p);
                }
            }
        }
        plans = accessible;
      }
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch diet plans" });
    }
  });

  app.get("/api/diet-plans/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const plan = await storage.getDietPlan(req.params.id);
      if (!plan) return res.status(404).json({ message: "Diet plan not found" });

      const client = await storage.getClient(plan.clientId);
      if (client && user.role !== UserRole.SUPER_ADMIN) {
          if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
          if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch diet plan" });
    }
  });

  app.post("/api/diet-plans", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const parseResult = insertDietPlanSchema.safeParse(req.body);
      if (!parseResult.success) return res.status(400).json({ message: "Invalid", errors: parseResult.error.errors });

      const client = await storage.getClient(parseResult.data.clientId);
      if (!client) return res.status(400).json({ message: "Client not found" });

      if (user.role !== UserRole.SUPER_ADMIN) {
          if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
          if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
      }
      
      const plan = await storage.createDietPlan(parseResult.data);
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create diet plan" });
    }
  });

  app.patch("/api/diet-plans/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const plan = await storage.getDietPlan(req.params.id);
      if (!plan) return res.status(404).json({ message: "Not found" });
      const client = await storage.getClient(plan.clientId);
      if (client && user.role !== UserRole.SUPER_ADMIN) {
          if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
          if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
      }

      const parseResult = insertDietPlanSchema.partial().safeParse(req.body);
      if (!parseResult.success) return res.status(400).json({ message: "Invalid", errors: parseResult.error.errors });
      
      const updated = await storage.updateDietPlan(req.params.id, parseResult.data);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update diet plan" });
    }
  });

  app.delete("/api/diet-plans/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const plan = await storage.getDietPlan(req.params.id);
      if (!plan) return res.status(404).json({ message: "Not found" });
      const client = await storage.getClient(plan.clientId);
      if (client && user.role !== UserRole.SUPER_ADMIN) {
          if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
          if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
      }
      await storage.deleteDietPlan(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete diet plan" });
    }
  });

  // ==================== INJURY/MEASUREMENT LOGS ====================

  app.get("/api/clients/:id/injuries", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const client = await storage.getClient(req.params.id);
      if (!client) return res.status(404).json({ message: "Not found" });
      if (user.role !== UserRole.SUPER_ADMIN) {
         if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
         if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
      }
      const logs = await storage.getInjuryLogsByClient(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch injury logs" });
    }
  });

  app.post("/api/clients/:id/injuries", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const client = await storage.getClient(req.params.id);
      if (!client) return res.status(404).json({ message: "Client not found" });
      if (user.role !== UserRole.SUPER_ADMIN) {
         if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
         if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
      }

      const data = { ...req.body, clientId: req.params.id };
      const parseResult = insertInjuryLogSchema.safeParse(data);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid injury log data",
          errors: parseResult.error.errors
        });
      }

      const log = await storage.createInjuryLog(parseResult.data);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to create injury log" });
    }
  });

  // Same for Measurements...
  app.get("/api/clients/:id/measurements", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const client = await storage.getClient(req.params.id);
      if (!client) return res.status(404).json({ message: "Not found" });
      if (user.role !== UserRole.SUPER_ADMIN) {
         if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
         if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
      }
      const logs = await storage.getMeasurementLogsByClient(req.params.id);
      logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch measurement logs" });
    }
  });

  app.post("/api/clients/:id/measurements", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user as User;
      const client = await storage.getClient(req.params.id);
      if (!client) return res.status(404).json({ message: "Client not found" });
      if (user.role !== UserRole.SUPER_ADMIN) {
         if (client.gymId !== user.gymId) return res.status(403).json({ message: "Denied" });
         if (user.role === UserRole.TRAINER && client.trainerId !== user.id) return res.status(403).json({ message: "Denied" });
      }

      const data = { ...req.body, clientId: req.params.id };
      const parseResult = insertMeasurementLogSchema.safeParse(data);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid measurement log data",
          errors: parseResult.error.errors
        });
      }

      const log = await storage.createMeasurementLog(parseResult.data);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to create measurement log" });
    }
  });

  // ==================== PUBLIC PORTAL (Unprotected) ====================

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

      measurementLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      injuryLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
