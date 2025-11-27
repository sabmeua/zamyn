import { apiClient } from '../api-client';

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  user: {
    id: string;
    username: string;
    displayName: string;
  };
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  attachments?: Attachment[];
}

export const commentsApi = {
  async getAll(ticketId: string): Promise<Comment[]> {
    const response = await apiClient.get(`/tickets/${ticketId}/comments`);
    return response.data;
  },

  async create(ticketId: string, data: {
    content: string;
    isInternal?: boolean;
    parentCommentId?: string;
  }): Promise<Comment> {
    const response = await apiClient.post(`/tickets/${ticketId}/comments`, data);
    return response.data;
  },
};
