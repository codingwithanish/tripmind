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

// API response types (what the backend actually sends)
interface ApiPlaceholderOption {
  name: string;
  type: string;
  options: string[];
  required: boolean;
}

interface ApiSuggestionTemplate {
  id: string;
  priority: number;
  templateText: string;
  description: string;
  placeholderOptions: ApiPlaceholderOption[];
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

// Transform API response to UI format
const transformTemplate = (apiTemplate: ApiSuggestionTemplate): SuggestionTemplate => {
  const placeholders: Record<string, Placeholder> = {};

  for (const opt of apiTemplate.placeholderOptions) {
    placeholders[opt.name] = {
      type: opt.type,
      required: opt.required,
      options: opt.options.map(value => ({ value })),
    };
  }

  return {
    id: apiTemplate.id,
    order: apiTemplate.priority,
    template_text: apiTemplate.templateText,
    description: apiTemplate.description,
    placeholders,
  };
};

export const getSuggestionTemplates = async (params: SuggestionParams): Promise<SuggestionTemplate[]> => {
  const response = await api.get<ApiResponse<ApiSuggestionTemplate[]>>('/suggestions/templates', {
    params,
  });
  return response.data.data!.map(transformTemplate);
};

export default {
  getSuggestionTemplates,
};

