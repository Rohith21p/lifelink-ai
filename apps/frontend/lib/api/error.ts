import axios from 'axios';

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;

    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message.join(', ');
    }

    if (typeof data?.message === 'string' && data.message.trim().length > 0) {
      return data.message;
    }

    if (typeof data?.error === 'string' && data.error.trim().length > 0) {
      return data.error;
    }

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}
