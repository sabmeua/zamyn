import { apiClient } from '../api-client';

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  workflow: {
    id: string;
    name: string;
  };
  currentState: {
    id: string;
    name: string;
    displayName: string;
    color: string;
  };
  creator: {
    id: string;
    username: string;
    displayName: string;
  };
  assignee?: {
    id: string;
    username: string;
    displayName: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const ticketsApi = {
  async getAll(filters?: {
    workflowId?: string;
    currentStateId?: string;
    assigneeId?: string;
    priority?: string;
  }): Promise<Ticket[]> {
    const response = await apiClient.get('/tickets', { params: filters });
    return response.data;
  },

  async getOne(id: string): Promise<Ticket> {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  async create(data: {
    workflowId: string;
    currentStateId: string;
    title: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assigneeId?: string;
    tags?: string[];
  }): Promise<Ticket> {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    const response = await apiClient.patch(`/tickets/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tickets/${id}`);
  },

  async search(params: {
    query?: string;
    tags?: string[];
    priority?: string;
    currentStateId?: string;
    assigneeId?: string;
    createdAfter?: string;
    createdBefore?: string;
  }): Promise<Ticket[]> {
    const response = await apiClient.get('/tickets/search', { params });
    return response.data;
  },
};
