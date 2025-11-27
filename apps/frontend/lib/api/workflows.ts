import { apiClient } from '../api-client';

export interface WorkflowState {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  position: { x: number; y: number };
  isInitial: boolean;
  isFinal: boolean;
}

export interface WorkflowAction {
  id: string;
  name: string;
  triggerType: 'MANUAL' | 'AUTO';
  fromStateId: string;
  toStateId: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  states: WorkflowState[];
  actions: WorkflowAction[];
}

export const workflowsApi = {
  async getAll(): Promise<Workflow[]> {
    const response = await apiClient.get('/workflows');
    return response.data;
  },

  async getOne(id: string): Promise<Workflow> {
    const response = await apiClient.get(`/workflows/${id}`);
    return response.data;
  },

  async create(data: {
    name: string;
    description: string;
    customProperties?: any;
  }): Promise<Workflow> {
    const response = await apiClient.post('/workflows', data);
    return response.data;
  },

  async update(id: string, data: Partial<Workflow>): Promise<Workflow> {
    const response = await apiClient.patch(`/workflows/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/workflows/${id}`);
  },
};
