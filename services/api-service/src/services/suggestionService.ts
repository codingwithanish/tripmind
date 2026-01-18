interface PlaceholderOption {
    value: string;
}

interface Placeholder {
    type: string;
    required: boolean;
    options: PlaceholderOption[];
}

interface SuggestionTemplate {
    id: string;
    order: number;
    template_text: string;
    description: string;
    placeholders: Record<string, Placeholder>;
}

// Hardcoded suggestion templates data
const suggestionTemplates: SuggestionTemplate[] = [
    {
        id: '1',
        order: 1,
        template_text: 'I want to do a {{trip_type}} trip to {{place}}',
        description: "Template to capture user's travel intent",
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

class SuggestionService {
    /**
     * Get all suggestion templates
     */
    async getSuggestionTemplates(): Promise<SuggestionTemplate[]> {
        return suggestionTemplates;
    }
}

export default new SuggestionService();
