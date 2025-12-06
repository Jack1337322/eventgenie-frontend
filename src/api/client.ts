const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface EventCreateRequest {
  name: string;
  description?: string;
  eventType: string;
  eventDate: string;
  eventEndDate?: string;
  location: string;
  expectedGuests: number;
  budgetLimit: number;
  targetAudience?: string;
  format: string;
  clientCompany?: string;
  clientContact?: string;
  clientEmail?: string;
  clientPhone?: string;
}

export interface EventResponse {
  id: number;
  name: string;
  description?: string;
  eventType: string;
  eventDate: string;
  eventEndDate?: string;
  location: string;
  expectedGuests: number;
  budgetLimit: number;
  targetAudience?: string;
  format: string;
  clientCompany?: string;
  clientContact?: string;
  clientEmail?: string;
  clientPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventPlanResponse {
  id: number;
  eventId: number;
  timeline: Record<string, any>;
  tasks: Record<string, any>;
  createdAt: string;
}

export interface BudgetItemDto {
  id: number;
  category: string;
  plannedAmount: number;
  actualAmount: number;
  status: string;
  description?: string;
}

export interface BudgetResponse {
  id: number;
  eventId: number;
  totalAmount: number;
  items: BudgetItemDto[];
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Events API
  async createEvent(data: EventCreateRequest): Promise<EventResponse> {
    return this.request<EventResponse>('/api/v1/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEvent(id: number): Promise<EventResponse> {
    return this.request<EventResponse>(`/api/v1/events/${id}`);
  }

  async getAllEvents(): Promise<EventResponse[]> {
    return this.request<EventResponse[]>('/api/v1/events');
  }

  // Event Plan API
  async generateEventPlan(eventId: number): Promise<EventPlanResponse> {
    return this.request<EventPlanResponse>(`/api/v1/event-plans/generate/${eventId}`, {
      method: 'POST',
    });
  }

  async getEventPlan(eventId: number): Promise<EventPlanResponse> {
    return this.request<EventPlanResponse>(`/api/v1/event-plans/event/${eventId}`);
  }

  // Budget API
  async calculateBudget(eventId: number): Promise<BudgetResponse> {
    return this.request<BudgetResponse>(`/api/v1/budgets/calculate/${eventId}`, {
      method: 'POST',
    });
  }

  async getBudgetByEventId(eventId: number): Promise<BudgetResponse> {
    return this.request<BudgetResponse>(`/api/v1/budgets/event/${eventId}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

