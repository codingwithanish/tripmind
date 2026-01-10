// import api from './api';

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

// Dummy data for development
const dummySuggestions: SuggestionTemplate[] = [
  {
    id: '1',
    order: 1,
    template_text: 'I want to do a {{trip_type}} trip to {{place}}',
    description: 'Template to capture user\'s travel intent',
    placeholders: {
      trip_type: {
        type: 'string',
        required: true,
        options: [
          { value: 'solo' },
          { value: 'family' },
          { value: 'friends' },
          { value: 'couple' },
        ],
      },
      place: {
        type: 'string',
        required: true,
        options: [
          { value: 'Sydney' },
          { value: 'Toronto' },
          { value: 'Paris' },
          { value: 'Tokyo' },
        ],
      },
    },
  },
  {
    id: '2',
    order: 2,
    template_text: 'Planning for a {{duration}} day travel to {{destination}}',
    description: 'Template for duration-based travel planning',
    placeholders: {
      duration: {
        type: 'string',
        required: true,
        options: [
          { value: '2' },
          { value: '5' },
          { value: '7' },
          { value: '10' },
        ],
      },
      destination: {
        type: 'string',
        required: true,
        options: [
          { value: 'Munnar' },
          { value: 'Goa' },
          { value: 'Bali' },
          { value: 'Maldives' },
        ],
      },
    },
  },
  {
    id: '3',
    order: 3,
    template_text: 'I need a {{budget}} budget trip for {{travelers}} people',
    description: 'Template for budget-conscious travelers',
    placeholders: {
      budget: {
        type: 'string',
        required: true,
        options: [
          { value: '$500' },
          { value: '$1000' },
          { value: '$2000' },
          { value: '$5000' },
        ],
      },
      travelers: {
        type: 'string',
        required: true,
        options: [
          { value: '2' },
          { value: '4' },
          { value: '6' },
          { value: '8' },
        ],
      },
    },
  },
];

export const getSuggestionTemplates = async (): Promise<SuggestionTemplate[]> => {
  // TODO: Replace with actual API call when backend is ready
  // const response = await api.get<ApiResponse<SuggestionTemplate[]>>('/suggestions/templates');
  // return response.data.data!;

  // Return dummy data for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummySuggestions);
    }, 300);
  });
};

export default {
  getSuggestionTemplates,
};
