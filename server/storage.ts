import { 
  type Client, type InsertClient,
  type WorkoutPlan, type InsertWorkoutPlan,
  type DietPlan, type InsertDietPlan,
  type User, type InsertUser,
  type Progress, type InsertProgress,
  type DailyLog, type InsertDailyLog
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clients
  getAllClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByPortalKey(key: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Progress
  getProgressByClient(clientId: string): Promise<Progress[]>;
  addProgress(progress: InsertProgress): Promise<Progress>;

  // Daily Logs
  getDailyLogsByClient(clientId: string): Promise<DailyLog[]>;
  getDailyLog(clientId: string, date: number): Promise<DailyLog | undefined>;
  createOrUpdateDailyLog(log: InsertDailyLog): Promise<DailyLog>;

  // Workout Plans
  getAllWorkoutPlans(): Promise<WorkoutPlan[]>;
  getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined>;
  getWorkoutPlansByClient(clientId: string): Promise<WorkoutPlan[]>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  updateWorkoutPlan(id: string, plan: Partial<InsertWorkoutPlan>): Promise<WorkoutPlan | undefined>;
  deleteWorkoutPlan(id: string): Promise<boolean>;

  // Diet Plans
  getAllDietPlans(): Promise<DietPlan[]>;
  getDietPlan(id: string): Promise<DietPlan | undefined>;
  getDietPlansByClient(clientId: string): Promise<DietPlan[]>;
  createDietPlan(plan: InsertDietPlan): Promise<DietPlan>;
  updateDietPlan(id: string, plan: Partial<InsertDietPlan>): Promise<DietPlan | undefined>;
  deleteDietPlan(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clients: Map<string, Client>;
  private workoutPlans: Map<string, WorkoutPlan>;
  private dietPlans: Map<string, DietPlan>;
  private progress: Map<string, Progress>;
  private dailyLogs: Map<string, DailyLog>;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.workoutPlans = new Map();
    this.dietPlans = new Map();
    this.progress = new Map();
    this.dailyLogs = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Clients
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (client && !client.portalKey) {
      // Lazy migration: add portalKey if missing
      client.portalKey = randomUUID().split('-')[0];
      this.clients.set(id, client);
    }
    return client;
  }

  async getClientByPortalKey(key: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(c => c.portalKey === key);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    // Generate a simple portal key if not provided (normally server-side generation logic)
    const portalKey = randomUUID().split('-')[0];
    const client: Client = { ...insertClient, id, portalKey };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient: Client = { ...client, ...updates };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  // Progress
  async getProgressByClient(clientId: string): Promise<Progress[]> {
    return Array.from(this.progress.values())
      .filter(p => p.clientId === clientId)
      .sort((a, b) => b.date - a.date);
  }

  async addProgress(insertProgress: InsertProgress): Promise<Progress> {
    const id = randomUUID();
    const progress: Progress = { ...insertProgress, id };
    this.progress.set(id, progress);
    return progress;
  }

  // Daily Logs
  async getDailyLogsByClient(clientId: string): Promise<DailyLog[]> {
    return Array.from(this.dailyLogs.values())
      .filter(l => l.clientId === clientId)
      .sort((a, b) => b.date - a.date);
  }

  async getDailyLog(clientId: string, date: number): Promise<DailyLog | undefined> {
    // Basic date matching (start of day) logic would be better in real app
    return Array.from(this.dailyLogs.values()).find(
      l => l.clientId === clientId && l.date === date
    );
  }

  async createOrUpdateDailyLog(insertLog: InsertDailyLog): Promise<DailyLog> {
    // Check if log exists for this client/date
    const existing = Array.from(this.dailyLogs.values()).find(
      l => l.clientId === insertLog.clientId && l.date === insertLog.date
    );

    if (existing) {
      const updated = { ...existing, ...insertLog };
      this.dailyLogs.set(existing.id, updated);
      return updated;
    }

    const id = randomUUID();
    const log: DailyLog = { ...insertLog, id };
    this.dailyLogs.set(id, log);
    return log;
  }

  async deleteClient(id: string): Promise<boolean> {
    const existed = this.clients.has(id);
    this.clients.delete(id);
    
    // Also delete associated plans
    for (const [planId, plan] of this.workoutPlans) {
      if (plan.clientId === id) {
        this.workoutPlans.delete(planId);
      }
    }
    for (const [planId, plan] of this.dietPlans) {
      if (plan.clientId === id) {
        this.dietPlans.delete(planId);
      }
    }
    
    return existed;
  }

  // Workout Plans
  async getAllWorkoutPlans(): Promise<WorkoutPlan[]> {
    return Array.from(this.workoutPlans.values());
  }

  async getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined> {
    return this.workoutPlans.get(id);
  }

  async getWorkoutPlansByClient(clientId: string): Promise<WorkoutPlan[]> {
    return Array.from(this.workoutPlans.values()).filter(
      (plan) => plan.clientId === clientId
    );
  }

  async createWorkoutPlan(insertPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const id = randomUUID();
    const plan: WorkoutPlan = { ...insertPlan, id };
    this.workoutPlans.set(id, plan);
    return plan;
  }

  async updateWorkoutPlan(id: string, updates: Partial<InsertWorkoutPlan>): Promise<WorkoutPlan | undefined> {
    const plan = this.workoutPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan: WorkoutPlan = { ...plan, ...updates };
    this.workoutPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteWorkoutPlan(id: string): Promise<boolean> {
    const existed = this.workoutPlans.has(id);
    this.workoutPlans.delete(id);
    return existed;
  }

  // Diet Plans
  async getAllDietPlans(): Promise<DietPlan[]> {
    return Array.from(this.dietPlans.values());
  }

  async getDietPlan(id: string): Promise<DietPlan | undefined> {
    return this.dietPlans.get(id);
  }

  async getDietPlansByClient(clientId: string): Promise<DietPlan[]> {
    return Array.from(this.dietPlans.values()).filter(
      (plan) => plan.clientId === clientId
    );
  }

  async createDietPlan(insertPlan: InsertDietPlan): Promise<DietPlan> {
    const id = randomUUID();
    const plan: DietPlan = { ...insertPlan, id };
    this.dietPlans.set(id, plan);
    return plan;
  }

  async updateDietPlan(id: string, updates: Partial<InsertDietPlan>): Promise<DietPlan | undefined> {
    const plan = this.dietPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan: DietPlan = { ...plan, ...updates };
    this.dietPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteDietPlan(id: string): Promise<boolean> {
    const existed = this.dietPlans.has(id);
    this.dietPlans.delete(id);
    return existed;
  }
}

export const storage = new MemStorage();
