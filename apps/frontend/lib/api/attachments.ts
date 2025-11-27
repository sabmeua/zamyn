import { apiClient } from '../api-client';

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  uploadedBy: {
    id: string;
    displayName: string;
  };
  createdAt: string;
}

export const attachmentsApi = {
  async getAll(ticketId: string): Promise<Attachment[]> {
    const response = await apiClient.get(`/tickets/${ticketId}/attachments`);
    return response.data;
  },

  async upload(ticketId: string, file: File, commentId?: string): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const url = commentId 
      ? `/tickets/${ticketId}/attachments?commentId=${commentId}`
      : `/tickets/${ticketId}/attachments`;

    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async delete(ticketId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
  },

  getDownloadUrl(filename: string): string {
    return `${apiClient.defaults.baseURL}/files/${filename}`;
  },
};
