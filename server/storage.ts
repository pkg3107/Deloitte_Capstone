import { users, type User, type InsertUser, InsertADR, ADRReport, adrReports, chatMessages, InsertChatMessage, ChatMessage, calendarEvents, InsertCalendarEvent, CalendarEvent } from "@shared/schema";

// Update the storage interface with new methods
export interface IStorage {
  // User methods (kept from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // ADR Report methods
  createADRReport(report: InsertADR): Promise<ADRReport>;
  getADRReport(id: number): Promise<ADRReport | undefined>;
  getAllADRReports(): Promise<ADRReport[]>;

  // Chat methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(): Promise<ChatMessage[]>;
  
  // Calendar methods
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  getCalendarEvent(id: number): Promise<CalendarEvent | undefined>;
  getAllCalendarEvents(): Promise<CalendarEvent[]>;
  getUpcomingCalendarEvents(limit?: number): Promise<CalendarEvent[]>;
  deleteCalendarEvent(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private adrReports: Map<number, ADRReport>;
  private chatMessages: Map<number, ChatMessage>;
  private calendarEvents: Map<number, CalendarEvent>;
  
  userCurrentId: number;
  reportCurrentId: number;
  chatCurrentId: number;
  calendarEventCurrentId: number;

  constructor() {
    this.users = new Map();
    this.adrReports = new Map();
    this.chatMessages = new Map();
    this.calendarEvents = new Map();
    
    this.userCurrentId = 1;
    this.reportCurrentId = 1;
    this.chatCurrentId = 1;
    this.calendarEventCurrentId = 1;
    
    // Add some initial calendar events
    this.initializeCalendarEvents();
  }
  
  // Initialize some default calendar events
  private initializeCalendarEvents() {
    const today = new Date();
    
    // Create quarterly ADR report deadline
    const quarterMonth = Math.floor(today.getMonth() / 3) * 3 + 3;
    const quarterlyDue = new Date(today.getFullYear(), quarterMonth, 15);
    if (quarterlyDue < today) {
      // If the date is in the past, move to next quarter
      quarterlyDue.setMonth(quarterlyDue.getMonth() + 3);
    }
    
    // Create PSUR submission deadline
    const psurDue = new Date(today.getFullYear(), today.getMonth() + 1, 10);
    
    // Create PvPI Training Webinar
    const webinarDate = new Date(today.getFullYear(), today.getMonth(), 25);
    if (webinarDate < today) {
      // If the date is in the past, move to next month
      webinarDate.setMonth(webinarDate.getMonth() + 1);
    }
    
    // Add the events
    this.createCalendarEvent({
      title: "Quarterly ADR Reports Due",
      eventDate: quarterlyDue,
      eventType: "accent",
      description: "Submit quarterly adverse drug reaction reports to the regulatory authority."
    });
    
    this.createCalendarEvent({
      title: "PSUR Submission Deadline",
      eventDate: psurDue,
      eventType: "muted",
      description: "Submit Periodic Safety Update Reports for all registered products."
    });
    
    this.createCalendarEvent({
      title: "PvPI Training Webinar",
      eventDate: webinarDate,
      eventType: "secondary",
      description: "Mandatory training webinar on latest pharmacovigilance practices."
    });
  }

  // User methods (kept from original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // ADR Report methods
  async createADRReport(insertReport: InsertADR): Promise<ADRReport> {
    const id = this.reportCurrentId++;
    const createdAt = new Date();
    const report: ADRReport = { ...insertReport, id, createdAt };
    this.adrReports.set(id, report);
    return report;
  }

  async getADRReport(id: number): Promise<ADRReport | undefined> {
    return this.adrReports.get(id);
  }

  async getAllADRReports(): Promise<ADRReport[]> {
    return Array.from(this.adrReports.values());
  }

  // Chat methods
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatCurrentId++;
    const createdAt = new Date();
    const message: ChatMessage = { ...insertMessage, id, createdAt };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values());
  }
  
  // Calendar event methods
  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = this.calendarEventCurrentId++;
    const createdAt = new Date();
    const event: CalendarEvent = { ...insertEvent, id, createdAt };
    this.calendarEvents.set(id, event);
    return event;
  }
  
  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    return this.calendarEvents.get(id);
  }
  
  async getAllCalendarEvents(): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values());
  }
  
  async getUpcomingCalendarEvents(limit: number = 10): Promise<CalendarEvent[]> {
    const today = new Date();
    
    // Filter events that are upcoming (today or later) and sort by date
    return Array.from(this.calendarEvents.values())
      .filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, limit);
  }
  
  async deleteCalendarEvent(id: number): Promise<boolean> {
    return this.calendarEvents.delete(id);
  }
}

export const storage = new MemStorage();
