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
  insertClientResourceSchema,
  insertTrainerProfileSchema,
  insertGymSchema,
  insertTrainerSchema,
  insertSessionSchema,
  insertPaymentSchema,
  insertLibraryItemSchema
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==================== GYMS ====================
  app.post("/api/gyms", async (req, res) => {
    try {
      const parseResult = insertGymSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid gym data", errors: parseResult.error.errors });
      }
      const gym = await storage.createGym(parseResult.data);
      res.status(201).json(gym);
    } catch (error) {
      res.status(500).json({ message: "Failed to create gym" });
    }
  });

  app.get("/api/gyms", async (req, res) => {
    try {
      const gyms = await storage.getAllGyms();
      res.json(gyms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gyms" });
    }
  });

  // ==================== TRAINERS ====================
  app.post("/api/trainers", async (req, res) => {
    try {
      const parseResult = insertTrainerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid trainer data", errors: parseResult.error.errors });
      }
      const trainer = await storage.createTrainer(parseResult.data);
      res.status(201).json(trainer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create trainer" });
    }
  });

  app.get("/api/trainers", async (req, res) => {
    try {
      const gymId = req.query.gymId as string;
      const trainers = gymId ? await storage.getTrainersByGym(gymId) : await storage.getAllTrainers();
      res.json(trainers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  // ==================== ADMIN DASHBOARD ====================
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const gyms = await storage.getAllGyms();
      const trainers = await storage.getAllTrainers();
      const clients = await storage.getAllClients();
      res.json({
        gymCount: gyms.length,
        trainerCount: trainers.length,
        clientCount: clients.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // ==================== SESSIONS ====================
  app.post("/api/sessions", async (req, res) => {
    try {
      const parseResult = insertSessionSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid session data", errors: parseResult.error.errors });
      }
      const session = await storage.createSession(parseResult.data);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const trainerId = req.query.trainerId as string;
      const clientId = req.query.clientId as string;
      if (trainerId) {
        const sessions = await storage.getSessionsByTrainer(trainerId);
        return res.json(sessions);
      }
      if (clientId) {
        const sessions = await storage.getSessionsByClient(clientId);
        return res.json(sessions);
      }
      res.status(400).json({ message: "trainerId or clientId required" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // ==================== PAYMENTS ====================
  app.post("/api/payments", async (req, res) => {
    try {
      const parseResult = insertPaymentSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid payment data", errors: parseResult.error.errors });
      }
      const payment = await storage.createPayment(parseResult.data);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.get("/api/payments", async (req, res) => {
    try {
      const trainerId = req.query.trainerId as string;
      const clientId = req.query.clientId as string;
      if (trainerId) {
        const payments = await storage.getPaymentsByTrainer(trainerId);
        return res.json(payments);
      }
      if (clientId) {
        const payments = await storage.getPaymentsByClient(clientId);
        return res.json(payments);
      }
      res.status(400).json({ message: "trainerId or clientId required" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // ==================== LIBRARY ====================
  app.post("/api/library", async (req, res) => {
    try {
      const parseResult = insertLibraryItemSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid library item data", errors: parseResult.error.errors });
      }
      const item = await storage.createLibraryItem(parseResult.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create library item" });
    }
  });

  app.get("/api/library", async (req, res) => {
    try {
      const gymId = req.query.gymId as string;
      if (!gymId) return res.status(400).json({ message: "gymId required" });
      const items = await storage.getLibraryItemsByGym(gymId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch library items" });
    }
  });

  // ==================== CLIENTS ====================
  
  app.get("/api/clients/me", async (req, res) => {
    // In a real app with auth, this would use req.user.
    // For this prototype, we return the first client as the "current" portal user.
    const clients = await storage.getAllClients();
    res.json(clients[0] || null);
  });

  // Get all clients (optionally filtered by trainer)
  app.get("/api/clients", async (req, res) => {
    try {
      const trainerId = req.query.trainerId as string;
      const clients = trainerId ? await storage.getClientsByTrainer(trainerId) : await storage.getAllClients();
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
      const resources = await storage.getClientResources(client.id);
      const trainerProfile = await storage.getTrainerProfile();

      // Sort logs
      measurementLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      injuryLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resources.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Get latest active plans
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
        measurementLogs,
        resources,
        trainerProfile
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

  // ==================== CLIENT RESOURCES ====================

  app.get("/api/clients/:id/resources", async (req, res) => {
    try {
      const resources = await storage.getClientResources(req.params.id);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client resources" });
    }
  });

  app.post("/api/clients/:id/resources", async (req, res) => {
    try {
      const data = { ...req.body, clientId: req.params.id };
      const parseResult = insertClientResourceSchema.safeParse(data);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid resource data",
          errors: parseResult.error.errors
        });
      }

      const resource = await storage.createClientResource(parseResult.data);
      res.status(201).json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  app.delete("/api/resources/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClientResource(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });

  // ==================== TRAINER PROFILE ====================

  app.get("/api/trainer/profile", async (req, res) => {
    try {
      const profile = await storage.getTrainerProfile();
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainer profile" });
    }
  });

  app.post("/api/trainer/profile", async (req, res) => {
    try {
      const parseResult = insertTrainerProfileSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid profile data",
          errors: parseResult.error.errors
        });
      }

      const profile = await storage.updateTrainerProfile(parseResult.data);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update trainer profile" });
    }
  });

  // ==================== CLONING & TEMPLATES ====================

  app.post("/api/workout-plans/:id/clone", async (req, res) => {
    try {
      const { targetClientId, name } = req.body;
      const original = await storage.getWorkoutPlan(req.params.id);
      if (!original) return res.status(404).json({ message: "Original plan not found" });

      const newPlan = await storage.createWorkoutPlan({
        ...original,
        clientId: targetClientId,
        name: name || `${original.name} (Clone)`,
      });
      res.status(201).json(newPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to clone workout plan" });
    }
  });

  app.post("/api/diet-plans/:id/clone", async (req, res) => {
    try {
      const { targetClientId, name } = req.body;
      const original = await storage.getDietPlan(req.params.id);
      if (!original) return res.status(404).json({ message: "Original plan not found" });

      const newPlan = await storage.createDietPlan({
        ...original,
        clientId: targetClientId,
        name: name || `${original.name} (Clone)`,
      });
      res.status(201).json(newPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to clone diet plan" });
    }
  });

  // ==================== SOCIAL & HUB ====================

  app.get("/api/social/profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllSocialProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social profiles" });
    }
  });

  app.get("/api/social/profiles/:clientId", async (req, res) => {
    try {
      const profile = await storage.getSocialProfile(req.params.clientId);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social profile" });
    }
  });

  app.post("/api/social/profiles/:clientId", async (req, res) => {
    try {
      const profile = await storage.updateSocialProfile(req.params.clientId, req.body);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update social profile" });
    }
  });

  app.get("/api/social/matches/:clientId", async (req, res) => {
    try {
      const matches = await storage.getMatchRequests(req.params.clientId);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post("/api/social/matches", async (req, res) => {
    try {
      const match = await storage.createMatchRequest(req.body);
      res.status(201).json(match);
    } catch (error) {
      res.status(500).json({ message: "Failed to create match request" });
    }
  });

  app.patch("/api/social/matches/:id", async (req, res) => {
    try {
      const match = await storage.updateMatchRequest(req.params.id, req.body.status);
      res.json(match);
    } catch (error) {
      res.status(500).json({ message: "Failed to update match status" });
    }
  });

  // ==================== CHAT ====================

  app.get("/api/chat/:userA/:userB", async (req, res) => {
    try {
      const messages = await storage.getChatHistory(req.params.userA, req.params.userB);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const message = await storage.createChatMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // ==================== LEADERBOARDS ====================

  app.get("/api/leaderboards", async (req, res) => {
    try {
      const scope = req.query.scope as string || "global"; // global, state, city
      const type = req.query.type as string || "attendance"; // attendance, weight_loss

      const logs = await storage.getAllAttendanceLogs();
      const clients = await storage.getAllClients();

      // Calculate attendance counts
      const counts: Record<string, number> = {};
      logs.forEach(log => {
        counts[log.clientId] = (counts[log.clientId] || 0) + 1;
      });

      const leaderboard = clients.map(c => ({
        id: c.id,
        name: c.name,
        city: (c as any).city,
        state: (c as any).state,
        score: counts[c.id] || 0
      }))
      .filter(c => {
        if (scope === "global") return true;
        if (scope === "state") return c.state === req.query.state;
        if (scope === "city") return c.city === req.query.city;
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const log = await storage.logAttendance(req.body);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to log attendance" });
    }
  });

  return httpServer;
}
