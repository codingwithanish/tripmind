import api from './api';

export interface PlaceholderOption {
  value: string;
}

export interface Placeholder {
  type: string;
  required: boolean;
  options: PlaceholderOption[];
}

export interface SuggestionTemplate {
  id: string;
  order: number;
  template_text: string;
  description: string;
  placeholders: Record<string, Placeholder>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getSuggestionTemplates = async (): Promise<SuggestionTemplate[]> => {
  const response = await api.get<ApiResponse<SuggestionTemplate[]>>('/suggestions/templates');
  return response.data.data!;
};

export default {
  getSuggestionTemplates,
};

