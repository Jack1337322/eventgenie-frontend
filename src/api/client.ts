const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Auth interfaces
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  expiresIn: number;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  role?: string;
  enabled?: boolean;
}

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
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

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
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          this.setToken(null);
          // Dispatch custom event for auth context to handle
          window.dispatchEvent(new CustomEvent('auth:logout'));
          throw new Error('Unauthorized: Please login again');
        }
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth API
  async register(data: AuthRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: AuthRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Automatically set token after successful login
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('/api/v1/auth/me');
  }

  // Admin API
  async getAllUsers(): Promise<UserResponse[]> {
    return this.request<UserResponse[]>('/api/v1/admin/users');
  }

  async getUserById(id: number): Promise<UserResponse> {
    return this.request<UserResponse>(`/api/v1/admin/users/${id}`);
  }

  async createUser(data: UserCreateRequest): Promise<UserResponse> {
    return this.request<UserResponse>('/api/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: number, data: UserUpdateRequest): Promise<UserResponse> {
    return this.request<UserResponse>(`/api/v1/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/api/v1/admin/users/${id}`, {
      method: 'DELETE',
    });
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

