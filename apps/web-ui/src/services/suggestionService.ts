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

export interface SuggestionParams {
  lat: number;
  lng: number;
  screenType: 'mobile' | 'desktop';
}

export const getSuggestionTemplates = async (params: SuggestionParams): Promise<SuggestionTemplate[]> => {
  const response = await api.get<ApiResponse<SuggestionTemplate[]>>('/suggestions/templates', {
    params,
  });
  return response.data.data!;
};

export default {
  getSuggestionTemplates,
};

