import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Define TypeScript interfaces for our db wrapper
interface UserData {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatarUrl: string;
  themeMode: string;
  costFactor: number;
  batteryCap: number;
  phoneNumber?: string | null;
  notificationType?: string;
  messageStyle?: string;
  telegramChatId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OtpData {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

interface TransactionData {
  id: string;
  hash: string;
  amount: number;
  price: number;
  total: number;
  createdAt: Date;
  userId: string;
}

interface ApplianceScheduleData {
  id: string;
  deviceName: string;
  powerDraw: number;
  startTime: string; // HH:MM simulated time
  duration: number; // in hours
  status: string; // "pending" | "running" | "completed" | "cancelled"
  createdAt: Date;
  userId: string;
}

const MOCK_DB_PATH = path.join(process.cwd(), "mock-db.json");

// Helper to read mock db from JSON
function readMockDb(): { 
  users: UserData[]; 
  otps: OtpData[]; 
  transactions: TransactionData[];
  schedules: ApplianceScheduleData[];
} {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    return { users: [], otps: [], transactions: [], schedules: [] };
  }
  try {
    const content = fs.readFileSync(MOCK_DB_PATH, "utf-8");
    const data = JSON.parse(content);
    return {
      users: (data.users || []).map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      })),
      otps: (data.otps || []).map((o: any) => ({
        ...o,
        expiresAt: new Date(o.expiresAt),
        createdAt: new Date(o.createdAt),
      })),
      transactions: (data.transactions || []).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
      })),
      schedules: (data.schedules || []).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
      })),
    };
  } catch (e) {
    console.error("Failed to read mock db, returning empty default", e);
    return { users: [], otps: [], transactions: [], schedules: [] };
  }
}

// Helper to write mock db to JSON
function writeMockDb(data: { 
  users: UserData[]; 
  otps: OtpData[]; 
  transactions: TransactionData[];
  schedules: ApplianceScheduleData[];
}) {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write mock db", e);
  }
}


// Create a singleton Prisma client
let prismaInstance: PrismaClient | null = null;
const isDbConfigured = !!process.env.DATABASE_URL;

if (isDbConfigured) {
  try {
    prismaInstance = new PrismaClient();
  } catch (e) {
    console.error("Failed to initialize Prisma Client", e);
  }
}

// Wrapper database proxy that uses Prisma if configured, or falls back to JSON file
export const db = {
  isMock: !isDbConfigured || !prismaInstance,

  user: {
    findUnique: async (args: { 
      where: { email?: string; id?: string }; 
      include?: { transactions: any }
    }): Promise<(UserData & { transactions?: TransactionData[] }) | null> => {
      if (prismaInstance) {
        try {
          const prismaPromise = prismaInstance.user.findUnique(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          return await Promise.race([prismaPromise, timeoutPromise]) as any;
        } catch (e) {
          console.warn("Prisma query failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      const user = data.users.find(u => {
        if (args.where.id && u.id === args.where.id) return true;
        if (args.where.email && u.email.toLowerCase() === args.where.email.toLowerCase()) return true;
        return false;
      });
      if (!user) return null;

      const transactions = args.include?.transactions 
        ? data.transactions.filter(t => t.userId === user.id)
        : undefined;

      if (transactions) {
        transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      return {
        ...user,
        transactions
      };
    },

    create: async (args: { data: Partial<UserData> & { email: string } }): Promise<UserData> => {
      if (prismaInstance) {
        try {
          const prismaPromise = prismaInstance.user.create(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          return await Promise.race([prismaPromise, timeoutPromise]) as UserData;
        } catch (e) {
          console.warn("Prisma user creation failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      const newUser: UserData = {
        id: Math.random().toString(36).substr(2, 9),
        email: args.data.email,
        name: args.data.name || "Nexus Explorer",
        bio: args.data.bio || "",
        avatarUrl: args.data.avatarUrl || "/avatars/nexus-default.png",
        themeMode: args.data.themeMode || "system",
        costFactor: args.data.costFactor ?? 8.0,
        batteryCap: args.data.batteryCap ?? 13.5,
        phoneNumber: args.data.phoneNumber || null,
        notificationType: args.data.notificationType || "none",
        messageStyle: args.data.messageStyle || "random",
        telegramChatId: args.data.telegramChatId || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      data.users.push(newUser);
      writeMockDb({ ...data, users: data.users });
      return newUser;
    },

    update: async (args: { where: { id: string } | { email: string }; data: Partial<UserData> }): Promise<UserData> => {
      if (prismaInstance) {
        try {
          const prismaPromise = prismaInstance.user.update(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          return await Promise.race([prismaPromise, timeoutPromise]) as UserData;
        } catch (e) {
          console.warn("Prisma user update failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      let index = -1;
      if ("id" in args.where) {
        const whereId = args.where as { id: string };
        index = data.users.findIndex(u => u.id === whereId.id);
      } else if ("email" in args.where) {
        const whereEmail = args.where as { email: string };
        index = data.users.findIndex(u => u.email.toLowerCase() === whereEmail.email.toLowerCase());
      }

      if (index === -1) {
        throw new Error("User not found");
      }

      const updatedUser: UserData = {
        ...data.users[index],
        ...args.data,
        updatedAt: new Date(),
      };
      data.users[index] = updatedUser;
      writeMockDb({ ...data, users: data.users });
      return updatedUser;
    }
  },

  otpVerification: {
    create: async (args: { data: { email: string; code: string; expiresAt: Date } }): Promise<OtpData> => {
      if (prismaInstance) {
        try {
          const prismaPromise = prismaInstance.otpVerification.create(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          return await Promise.race([prismaPromise, timeoutPromise]) as OtpData;
        } catch (e) {
          console.warn("Prisma OTP creation failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      const newOtp: OtpData = {
        id: Math.random().toString(36).substr(2, 9),
        email: args.data.email,
        code: args.data.code,
        expiresAt: args.data.expiresAt,
        createdAt: new Date(),
      };
      data.otps.push(newOtp);
      writeMockDb({ ...data, otps: data.otps });
      return newOtp;
    },

    findFirst: async (args: { where: { email: string; code: string } }): Promise<OtpData | null> => {
      if (prismaInstance) {
        try {
          const prismaPromise = prismaInstance.otpVerification.findFirst(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          return await Promise.race([prismaPromise, timeoutPromise]) as OtpData | null;
        } catch (e) {
          console.warn("Prisma OTP lookup failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      const now = new Date();
      const otp = data.otps.find(o => 
        o.email.toLowerCase() === args.where.email.toLowerCase() && 
        o.code === args.where.code &&
        o.expiresAt > now
      );
      return otp || null;
    },

    deleteMany: async (args: { where: { email: string } }): Promise<{ count: number }> => {
      if (prismaInstance) {
        try {
          const prismaPromise = prismaInstance.otpVerification.deleteMany(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          return await Promise.race([prismaPromise, timeoutPromise]) as { count: number };
        } catch (e) {
          console.warn("Prisma OTP deletion failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      const initialCount = data.otps.length;
      data.otps = data.otps.filter(o => o.email.toLowerCase() !== args.where.email.toLowerCase());
      writeMockDb({ ...data, otps: data.otps });
      return { count: initialCount - data.otps.length };
    }
  },

  transaction: {
    create: async (args: { 
      data: { hash: string; amount: number; price: number; total: number; userId: string } 
    }): Promise<TransactionData> => {
      if (prismaInstance) {
        try {
          const prismaPromise = prismaInstance.transaction.create(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          return await Promise.race([prismaPromise, timeoutPromise]) as TransactionData;
        } catch (e) {
          console.warn("Prisma transaction creation failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      const newTx: TransactionData = {
        id: Math.random().toString(36).substr(2, 9),
        hash: args.data.hash,
        amount: args.data.amount,
        price: args.data.price,
        total: args.data.total,
        createdAt: new Date(),
        userId: args.data.userId,
      };
      data.transactions.push(newTx);
      writeMockDb({ ...data, transactions: data.transactions });
      return newTx;
    }
  },

  applianceSchedule: {
    findMany: async (args: { where: { userId: string } }): Promise<ApplianceScheduleData[]> => {
      if (prismaInstance) {
        try {
          const prismaPromise = (prismaInstance as any).applianceSchedule.findMany(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          return await Promise.race([prismaPromise, timeoutPromise]) as ApplianceScheduleData[];
        } catch (e) {
          console.warn("Prisma schedule lookup failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      return data.schedules.filter(s => s.userId === args.where.userId);
    },

    create: async (args: { 
      data: { deviceName: string; powerDraw: number; startTime: string; duration: number; userId: string } 
    }): Promise<ApplianceScheduleData> => {
      if (prismaInstance) {
        try {
          const prismaPromise = (prismaInstance as any).applianceSchedule.create(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          return await Promise.race([prismaPromise, timeoutPromise]) as ApplianceScheduleData;
        } catch (e) {
          console.warn("Prisma schedule creation failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      const newSchedule: ApplianceScheduleData = {
        id: Math.random().toString(36).substr(2, 9),
        deviceName: args.data.deviceName,
        powerDraw: args.data.powerDraw,
        startTime: args.data.startTime,
        duration: args.data.duration,
        status: "pending",
        createdAt: new Date(),
        userId: args.data.userId
      };
      data.schedules.push(newSchedule);
      writeMockDb({ ...data, schedules: data.schedules });
      return newSchedule;
    },

    update: async (args: { 
      where: { id: string }; 
      data: Partial<ApplianceScheduleData> 
    }): Promise<ApplianceScheduleData> => {
      if (prismaInstance) {
        try {
          const prismaPromise = (prismaInstance as any).applianceSchedule.update(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          return await Promise.race([prismaPromise, timeoutPromise]) as ApplianceScheduleData;
        } catch (e) {
          console.warn("Prisma schedule update failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      const idx = data.schedules.findIndex(s => s.id === args.where.id);
      if (idx === -1) {
        throw new Error("Schedule not found");
      }
      const updated: ApplianceScheduleData = {
        ...data.schedules[idx],
        ...args.data
      };
      data.schedules[idx] = updated;
      writeMockDb({ ...data, schedules: data.schedules });
      return updated;
    },

    delete: async (args: { where: { id: string } }): Promise<{ id: string }> => {
      if (prismaInstance) {
        try {
          const prismaPromise = (prismaInstance as any).applianceSchedule.delete(args as any);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Prisma timeout")), 5000)
          );
          await Promise.race([prismaPromise, timeoutPromise]);
          return { id: args.where.id };
        } catch (e) {
          console.warn("Prisma schedule deletion failed or timed out, falling back to mock database", e);
        }
      }
      const data = readMockDb();
      data.schedules = data.schedules.filter(s => s.id !== args.where.id);
      writeMockDb({ ...data, schedules: data.schedules });
      return { id: args.where.id };
    }
  }
};

