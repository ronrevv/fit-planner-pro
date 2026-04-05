import { 
  type Client, type InsertClient,
  type WorkoutPlan, type InsertWorkoutPlan,
  type DietPlan, type InsertDietPlan,
  type User, type InsertUser,
  type InjuryLog, type InsertInjuryLog,
  type MeasurementLog, type InsertMeasurementLog,
  type ItemCompletion, type InsertItemCompletion,
  type Gym, type InsertGym,
  type Trainer, type InsertTrainer,
  type Session, type InsertSession,
  type Payment, type InsertPayment,
  type LibraryItem, type InsertLibraryItem
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Gyms
  createGym(gym: InsertGym): Promise<Gym>;
  getGym(id: string): Promise<Gym | undefined>;
  getAllGyms(): Promise<Gym[]>;

  // Trainers
  createTrainer(trainer: InsertTrainer): Promise<Trainer>;
  getTrainer(id: string): Promise<Trainer | undefined>;
  getTrainersByGym(gymId: string): Promise<Trainer[]>;
  getAllTrainers(): Promise<Trainer[]>;

  // Clients
  getAllClients(): Promise<Client[]>;
  getClientsByTrainer(trainerId: string): Promise<Client[]>;
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

  // Client Resources
  getClientResources(clientId: string): Promise<import("@shared/schema").ClientResource[]>;
  createClientResource(resource: import("@shared/schema").InsertClientResource): Promise<import("@shared/schema").ClientResource>;
  deleteClientResource(id: string): Promise<boolean>;

  // Trainer Profile
  getTrainerProfile(): Promise<import("@shared/schema").TrainerProfile | undefined>;
  updateTrainerProfile(profile: import("@shared/schema").InsertTrainerProfile): Promise<import("@shared/schema").TrainerProfile>;

  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSessionsByTrainer(trainerId: string): Promise<Session[]>;
  getSessionsByClient(clientId: string): Promise<Session[]>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByTrainer(trainerId: string): Promise<Payment[]>;
  getPaymentsByClient(clientId: string): Promise<Payment[]>;

  // Library
  createLibraryItem(item: InsertLibraryItem): Promise<LibraryItem>;
  getLibraryItemsByGym(gymId: string): Promise<LibraryItem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clients: Map<string, Client>;
  private workoutPlans: Map<string, WorkoutPlan>;
  private dietPlans: Map<string, DietPlan>;
  private injuryLogs: Map<string, InjuryLog>;
  private measurementLogs: Map<string, MeasurementLog>;
  private itemCompletions: Map<string, ItemCompletion>;
  private clientResources: Map<string, import("@shared/schema").ClientResource>;
  private trainerProfile: import("@shared/schema").TrainerProfile | undefined;

  private gyms: Map<string, Gym>;
  private trainers: Map<string, Trainer>;
  private sessions: Map<string, Session>;
  private payments: Map<string, Payment>;
  private libraryItems: Map<string, LibraryItem>;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.workoutPlans = new Map();
    this.dietPlans = new Map();
    this.injuryLogs = new Map();
    this.measurementLogs = new Map();
    this.itemCompletions = new Map();
    this.clientResources = new Map();

    this.gyms = new Map();
    this.trainers = new Map();
    this.sessions = new Map();
    this.payments = new Map();
    this.libraryItems = new Map();
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

  async getAllGyms(): Promise<Gym[]> {
    return Array.from(this.gyms.values());
  }

  // Trainers
  async createTrainer(insertTrainer: InsertTrainer): Promise<Trainer> {
    const id = randomUUID();
    const trainer: Trainer = { ...insertTrainer, id };
    this.trainers.set(id, trainer);
    return trainer;
  }

  async getTrainer(id: string): Promise<Trainer | undefined> {
    return this.trainers.get(id);
  }

  async getTrainersByGym(gymId: string): Promise<Trainer[]> {
    return Array.from(this.trainers.values()).filter(t => t.gymId === gymId);
  }

  async getAllTrainers(): Promise<Trainer[]> {
    return Array.from(this.trainers.values());
  }

  // Clients
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClientsByTrainer(trainerId: string): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(c => c.trainerId === trainerId);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (client && !client.token) {
      client.token = randomUUID();
      this.clients.set(id, client);
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

    // CLEANUP logic restored
    for (const [planId, plan] of this.workoutPlans) {
      if (plan.clientId === id) this.workoutPlans.delete(planId);
    }
    for (const [planId, plan] of this.dietPlans) {
      if (plan.clientId === id) this.dietPlans.delete(planId);
    }
    for (const [logId, log] of this.injuryLogs) {
      if (log.clientId === id) this.injuryLogs.delete(logId);
    }
    for (const [logId, log] of this.measurementLogs) {
      if (log.clientId === id) this.measurementLogs.delete(logId);
    }
    for (const [resourceId, resource] of this.clientResources) {
      if (resource.clientId === id) this.clientResources.delete(resourceId);
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

  // Client Resources
  async getClientResources(clientId: string): Promise<import("@shared/schema").ClientResource[]> {
    return Array.from(this.clientResources.values()).filter(
      (r) => r.clientId === clientId
    );
  }

  async createClientResource(insertResource: import("@shared/schema").InsertClientResource): Promise<import("@shared/schema").ClientResource> {
    const id = randomUUID();
    const resource = {
      ...insertResource,
      id,
      createdAt: new Date().toISOString()
    };
    this.clientResources.set(id, resource);
    return resource;
  }

  async deleteClientResource(id: string): Promise<boolean> {
    const existed = this.clientResources.has(id);
    this.clientResources.delete(id);
    return existed;
  }

  // Trainer Profile
  async getTrainerProfile(): Promise<import("@shared/schema").TrainerProfile | undefined> {
    return this.trainerProfile;
  }

  async updateTrainerProfile(profile: import("@shared/schema").InsertTrainerProfile): Promise<import("@shared/schema").TrainerProfile> {
    const id = this.trainerProfile?.id || randomUUID();
    const updatedProfile = { ...profile, id };
    this.trainerProfile = updatedProfile;
    return updatedProfile;
  }

  // Sessions
  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = { ...insertSession, id };
    this.sessions.set(id, session);
    return session;
  }

  async getSessionsByTrainer(trainerId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(s => s.trainerId === trainerId);
  }

  async getSessionsByClient(clientId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(s => s.clientId === clientId);
  }

  // Payments
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { ...insertPayment, id };
    this.payments.set(id, payment);
    return payment;
  }

  async getPaymentsByTrainer(trainerId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.trainerId === trainerId);
  }

  async getPaymentsByClient(clientId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.clientId === clientId);
  }

  // Library
  async createLibraryItem(insertItem: InsertLibraryItem): Promise<LibraryItem> {
    const id = randomUUID();
    const item: LibraryItem = { ...insertItem, id, createdAt: new Date().toISOString() };
    this.libraryItems.set(id, item);
    return item;
  }

  async getLibraryItemsByGym(gymId: string): Promise<LibraryItem[]> {
    return Array.from(this.libraryItems.values()).filter(i => i.gymId === gymId);
  }
}

export const storage = new MemStorage();
