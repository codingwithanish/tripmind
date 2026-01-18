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

// Hardcoded suggestion templates data (using Markdown formatting)
const suggestionTemplates: SuggestionTemplate[] = [
    {
        id: '1',
        order: 1,
        template_text:
            "I'm planning a {{trip_type}} getaway over the next **long weekend**, focusing on *unwinding*, quality time, and a calm break from routine.",
        description: 'Time-based relaxed travel intent',
        placeholders: {
            trip_type: {
                type: 'string',
                required: true,
                options: [
                    { value: 'family travel' },
                    { value: 'solo travel' }
                ],
            },
        },
    },

    {
        id: '2',
        order: 2,
        template_text:
            'I want to plan a short trip with a budget of {{budget}}, keeping things *simple and comfortable* while making the most of a limited spend.',
        description: 'Budget-priority travel intent',
        placeholders: {
            budget: {
                type: 'string',
                required: true,
                options: [
                    { value: '$500' },
                    { value: '$700' }
                ],
            },
        },
    },

    {
        id: '3',
        order: 3,
        template_text:
            'We are thinking of a {{group_type}} trip during a **long weekend**, preferring easy travel, relaxed plans, and memorable shared moments.',
        description: 'Group-based travel intent',
        placeholders: {
            group_type: {
                type: 'string',
                required: true,
                options: [
                    { value: 'family' },
                    { value: 'friends' }
                ],
            },
        },
    },

    {
        id: '4',
        order: 4,
        template_text:
            "I'm looking for a {{duration}}-day escape that feels *refreshing and stress-free*, without rushing through too many activities.",
        description: 'Duration-first travel intent',
        placeholders: {
            duration: {
                type: 'string',
                required: true,
                options: [
                    { value: '2' },
                    { value: '3' }
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
