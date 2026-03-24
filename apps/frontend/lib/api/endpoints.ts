import { apiClient } from './client';
import {
  ActivityItem,
  BloodBank,
  BloodInventoryItem,
  BloodRequest,
  CreateDonorPayload,
  CreateMatchPayload,
  CreateMatchReviewPayload,
  CreateNotificationPayload,
  CreatePatientPayload,
  DashboardSummary,
  Donor,
  Match,
  MatchScoreBreakdown,
  Notification,
  NotificationLog,
  NotificationTemplate,
  Patient,
  ReportFile,
  UpdateMatchPayload,
  UpdateMatchStatusPayload,
  UploadReportPayload,
  UpsertBloodStockPayload,
} from '../types/api';

export const patientsApi = {
  getAll: async () => {
    const response = await apiClient.get<Patient[]>('/patients');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
  },
  create: async (payload: CreatePatientPayload) => {
    const response = await apiClient.post<Patient>('/patients', payload);
    return response.data;
  },
  update: async (id: string, payload: Partial<Patient>) => {
    const response = await apiClient.patch<Patient>(`/patients/${id}`, payload);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/patients/${id}`);
    return response.data;
  },
};

export const donorsApi = {
  getAll: async () => {
    const response = await apiClient.get<Donor[]>('/donors');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get<Donor>(`/donors/${id}`);
    return response.data;
  },
  create: async (payload: CreateDonorPayload) => {
    const response = await apiClient.post<Donor>('/donors', payload);
    return response.data;
  },
  update: async (id: string, payload: Partial<Donor>) => {
    const response = await apiClient.patch<Donor>(`/donors/${id}`, payload);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/donors/${id}`);
    return response.data;
  },
};

export const dashboardApi = {
  getSummary: async () => {
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },
  getRecentActivities: async () => {
    const response = await apiClient.get<ActivityItem[]>('/dashboard/recent-activities');
    return response.data;
  },
  getRecentMatchActivity: async () => {
    const response = await apiClient.get<Match[]>('/dashboard/recent-match-activity');
    return response.data;
  },
  getLowStockAlerts: async () => {
    const response = await apiClient.get<BloodInventoryItem[]>('/dashboard/low-stock-alerts');
    return response.data;
  },
  getRecentNotifications: async () => {
    const response = await apiClient.get<Notification[]>('/dashboard/recent-notifications');
    return response.data;
  },
};

export const matchesApi = {
  getAll: async (status?: string) => {
    const response = await apiClient.get<Match[]>('/matches', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get<Match>(`/matches/${id}`);
    return response.data;
  },
  create: async (payload: CreateMatchPayload) => {
    const response = await apiClient.post<Match>('/matches', payload);
    return response.data;
  },
  update: async (id: string, payload: UpdateMatchPayload) => {
    const response = await apiClient.patch<Match>(`/matches/${id}`, payload);
    return response.data;
  },
  updateStatus: async (id: string, payload: UpdateMatchStatusPayload) => {
    const response = await apiClient.patch<Match>(`/matches/${id}/status`, payload);
    return response.data;
  },
  addReview: async (id: string, payload: CreateMatchReviewPayload) => {
    const response = await apiClient.post<Match>(`/matches/${id}/reviews`, payload);
    return response.data;
  },
  getScoreBreakdown: async (id: string) => {
    const response = await apiClient.get<MatchScoreBreakdown>(`/matches/${id}/score-breakdown`);
    return response.data;
  },
};

export const notificationsApi = {
  getAll: async (params?: { unread?: boolean; limit?: number }) => {
    const response = await apiClient.get<Notification[]>('/notifications', {
      params: {
        unread: params?.unread,
        limit: params?.limit,
      },
    });
    return response.data;
  },
  create: async (payload: CreateNotificationPayload) => {
    const response = await apiClient.post<Notification>('/notifications', payload);
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },
  getLogs: async (limit?: number) => {
    const response = await apiClient.get<NotificationLog[]>('/notifications/logs', {
      params: { limit },
    });
    return response.data;
  },
  getTemplates: async () => {
    const response = await apiClient.get<NotificationTemplate[]>('/notifications/templates');
    return response.data;
  },
};

export const reportsApi = {
  uploadMetadata: async (payload: UploadReportPayload) => {
    const response = await apiClient.post<ReportFile>('/reports', payload);
    return response.data;
  },
  getAll: async (patientId?: string) => {
    const response = await apiClient.get<ReportFile[]>('/reports', {
      params: { patientId },
    });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get<ReportFile>(`/reports/${id}`);
    return response.data;
  },
  getExtractionSummary: async (id: string) => {
    const response = await apiClient.get<{
      reportId: string;
      extractionStatus: string;
      extractedSummary?: string | null;
      extraction?: unknown;
    }>(`/reports/${id}/extraction`);
    return response.data;
  },
  triggerMockExtraction: async (id: string) => {
    const response = await apiClient.post<ReportFile>(`/reports/${id}/extract`);
    return response.data;
  },
};

export const bloodBanksApi = {
  getAll: async () => {
    const response = await apiClient.get<BloodBank[]>('/blood-banks');
    return response.data;
  },
  getInventory: async (bloodBankId?: string) => {
    const response = await apiClient.get<BloodInventoryItem[]>('/blood-banks/inventory', {
      params: { bloodBankId },
    });
    return response.data;
  },
  upsertStock: async (payload: UpsertBloodStockPayload) => {
    const response = await apiClient.post<BloodInventoryItem>('/blood-banks/inventory', payload);
    return response.data;
  },
  getRequests: async (params?: { bloodBankId?: string; status?: string }) => {
    const response = await apiClient.get<BloodRequest[]>('/blood-banks/requests', {
      params,
    });
    return response.data;
  },
  getLowStockAlerts: async () => {
    const response = await apiClient.get<BloodInventoryItem[]>('/blood-banks/low-stock-alerts');
    return response.data;
  },
  getRecentStockActivity: async () => {
    const response = await apiClient.get<BloodInventoryItem[]>('/blood-banks/recent-stock-activity');
    return response.data;
  },
};
