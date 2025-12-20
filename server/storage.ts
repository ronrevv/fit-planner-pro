import { 
  type Client, type InsertClient,
  type WorkoutPlan, type InsertWorkoutPlan,
  type DietPlan, type InsertDietPlan,
  type User, type InsertUser,
  type InjuryLog, type InsertInjuryLog,
  type MeasurementLog, type InsertMeasurementLog,
  type ItemCompletion, type InsertItemCompletion,
  type Gym, type InsertGym,
  UserRole
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Gyms
  createGym(gym: InsertGym): Promise<Gym>;
  getGym(id: string): Promise<Gym | undefined>;
  getGymBySlug(slug: string): Promise<Gym | undefined>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByGym(gymId: string): Promise<User[]>;

  // Clients
  getAllClients(gymId?: string, trainerId?: string): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByToken(token: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

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

  // Injury Logs
  getInjuryLogsByClient(clientId: string): Promise<InjuryLog[]>;
  createInjuryLog(log: InsertInjuryLog): Promise<InjuryLog>;
  deleteInjuryLog(id: string): Promise<boolean>;

  // Measurement Logs
  getMeasurementLogsByClient(clientId: string): Promise<MeasurementLog[]>;
  createMeasurementLog(log: InsertMeasurementLog): Promise<MeasurementLog>;
  deleteMeasurementLog(id: string): Promise<boolean>;

  // Completions
  getItemCompletions(clientId: string, date: string): Promise<ItemCompletion[]>;
  toggleItemCompletion(completion: InsertItemCompletion): Promise<ItemCompletion>;

  // Session Store support
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private gyms: Map<string, Gym>;
  private users: Map<string, User>;
  private clients: Map<string, Client>;
  private workoutPlans: Map<string, WorkoutPlan>;
  private dietPlans: Map<string, DietPlan>;
  private injuryLogs: Map<string, InjuryLog>;
  private measurementLogs: Map<string, MeasurementLog>;
  private itemCompletions: Map<string, ItemCompletion>;
  public sessionStore: session.Store;

  // Defaults for migration
  private defaultGymId: string;
  private defaultTrainerId: string;

  constructor() {
    this.gyms = new Map();
    this.users = new Map();
    this.clients = new Map();
    this.workoutPlans = new Map();
    this.dietPlans = new Map();
    this.injuryLogs = new Map();
    this.measurementLogs = new Map();
    this.itemCompletions = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize default gym and trainer for backward compatibility/migration
    this.defaultGymId = randomUUID();
    this.defaultTrainerId = randomUUID();

    // Create default Gym
    this.gyms.set(this.defaultGymId, {
      id: this.defaultGymId,
      name: "Default Gym",
      slug: "default",
      createdAt: new Date().toISOString()
    });

    // Create default Trainer
    this.users.set(this.defaultTrainerId, {
      id: this.defaultTrainerId,
      username: "trainer",
      password: "password", // In real app this would be hashed
      fullName: "Default Trainer",
      role: UserRole.TRAINER,
      gymId: this.defaultGymId,
      createdAt: new Date().toISOString()
    });

    // Create default Super Admin
    const superAdminId = randomUUID();
    this.users.set(superAdminId, {
      id: superAdminId,
      username: "admin",
      password: "password",
      fullName: "Platform Admin",
      role: UserRole.SUPER_ADMIN,
      // Super admin doesn't necessarily need a gymId, but for simplicity we can leave it undefined or null
      createdAt: new Date().toISOString()
    });
  }

  // Gyms
  async createGym(insertGym: InsertGym): Promise<Gym> {
    const id = randomUUID();
    const gym: Gym = { ...insertGym, id, createdAt: new Date().toISOString() };
    this.gyms.set(id, gym);
    return gym;
  }

  async getGym(id: string): Promise<Gym | undefined> {
    return this.gyms.get(id);
  }

  async getGymBySlug(slug: string): Promise<Gym | undefined> {
    return Array.from(this.gyms.values()).find(g => g.slug === slug);
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
    const user: User = { ...insertUser, id, createdAt: new Date().toISOString() };
    this.users.set(id, user);
    return user;
  }

  async getUsersByGym(gymId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.gymId === gymId);
  }

  // Clients
  async getAllClients(gymId?: string, trainerId?: string): Promise<Client[]> {
    // Migration: Ensure all clients have token, gymId, and trainerId
    for (const client of this.clients.values()) {
      let modified = false;
      if (!client.token) {
        client.token = randomUUID();
        modified = true;
      }
      if (!client.gymId) {
        client.gymId = this.defaultGymId;
        modified = true;
      }
      if (!client.trainerId) {
        client.trainerId = this.defaultTrainerId;
        modified = true;
      }

      if (modified) {
        this.clients.set(client.id, client);
      }
    }

    let clients = Array.from(this.clients.values());

    if (gymId) {
      clients = clients.filter(c => c.gymId === gymId);
    }

    if (trainerId) {
      clients = clients.filter(c => c.trainerId === trainerId);
    }

    return clients;
  }

  async getClient(id: string): Promise<Client | undefined> {
    const client = this.clients.get(id);
    // Backward compatibility for existing clients without token/gym/trainer
    if (client) {
      let modified = false;
      if (!client.token) {
        client.token = randomUUID();
        modified = true;
      }
      if (!client.gymId) {
        client.gymId = this.defaultGymId;
        modified = true;
      }
      if (!client.trainerId) {
        client.trainerId = this.defaultTrainerId;
        modified = true;
      }

      if (modified) {
        this.clients.set(id, client);
      }
    }
    return client;
  }

  async getClientByToken(token: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(c => c.token === token);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const token = randomUUID();
    const client: Client = { ...insertClient, id, token };
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
    // Delete associated logs
    for (const [logId, log] of this.injuryLogs) {
      if (log.clientId === id) {
        this.injuryLogs.delete(logId);
      }
    }
    for (const [logId, log] of this.measurementLogs) {
      if (log.clientId === id) {
        this.measurementLogs.delete(logId);
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

  // Injury Logs
  async getInjuryLogsByClient(clientId: string): Promise<InjuryLog[]> {
    return Array.from(this.injuryLogs.values()).filter(
      (log) => log.clientId === clientId
    );
  }

  async createInjuryLog(insertLog: InsertInjuryLog): Promise<InjuryLog> {
    const id = randomUUID();
    const log: InjuryLog = { ...insertLog, id };
    this.injuryLogs.set(id, log);
    return log;
  }

  async deleteInjuryLog(id: string): Promise<boolean> {
    const existed = this.injuryLogs.has(id);
    this.injuryLogs.delete(id);
    return existed;
  }

  // Measurement Logs
  async getMeasurementLogsByClient(clientId: string): Promise<MeasurementLog[]> {
    return Array.from(this.measurementLogs.values()).filter(
      (log) => log.clientId === clientId
    );
  }

  async createMeasurementLog(insertLog: InsertMeasurementLog): Promise<MeasurementLog> {
    const id = randomUUID();
    const log: MeasurementLog = { ...insertLog, id };
    this.measurementLogs.set(id, log);
    return log;
  }

  async deleteMeasurementLog(id: string): Promise<boolean> {
    const existed = this.measurementLogs.has(id);
    this.measurementLogs.delete(id);
    return existed;
  }

  // Completions
  async getItemCompletions(clientId: string, date: string): Promise<ItemCompletion[]> {
    return Array.from(this.itemCompletions.values()).filter(
      (c) => c.clientId === clientId && c.date === date
    );
  }

  async toggleItemCompletion(insert: InsertItemCompletion): Promise<ItemCompletion> {
    const existing = Array.from(this.itemCompletions.values()).find(
      c => c.clientId === insert.clientId &&
           c.date === insert.date &&
           c.itemId === insert.itemId &&
           c.type === insert.type
    );

    if (existing) {
      const updated = { ...existing, completed: insert.completed };
      this.itemCompletions.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newCompletion = { ...insert, id };
      this.itemCompletions.set(id, newCompletion);
      return newCompletion;
    }
  }
}

export const storage = new MemStorage();
