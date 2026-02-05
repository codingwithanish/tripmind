import suggestionTemplateDao, { CreateSuggestionTemplateInput } from '../database/dao/suggestionTemplateDao';
import { SuggestionTemplate, DisplayType, SuggestionCategory } from '@prisma/client';
import env from '../config/env';

interface SuggestionRequest {
    lat: number;
    lng: number;
    screenType: 'mobile' | 'desktop';
}

class SuggestionService {
    private readonly AI_SERVICE_URL = env.AI_SERVICE_URL;

    /**
     * Get data from OpenStreetMap Nominatim for reverse geocoding
     */
    private async getPlaceNameFromLocation(lat: number, lng: number): Promise<string> {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'TripMind/1.0'
                }
            });
            if (!response.ok) {
                return `${lat}, ${lng}`;
            }
            const data = await response.json() as any;
            // Try to get city, town, or village, fall back to display_name
            const address = data.address || {};
            return data.display_name || address.city || address.town || address.village || address.state;
        } catch (error) {
            console.error('Error fetching place name:', error);
            return `${lat}, ${lng}`;
        }
    }

    /**
     * Call AI service to generate suggestions
     */
    private async fetchSuggestionsFromAI(location: string, screenType: string): Promise<any[]> {
        const response = await fetch(`${this.AI_SERVICE_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_name: 'suggestion_agent',
                input_payload: {
                    location: location,
                    screen_type: screenType,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`AI Service error: ${response.statusText}`);
        }

        const result = await response.json() as any;
        if (result.status === 'success' && result.output && result.output.suggestions) {
            return result.output.suggestions;
        }
        throw new Error('Invalid response from AI Service');
    }

    /**
     * Get suggestion templates with caching logic
     */
    async getSuggestionTemplates(req: SuggestionRequest): Promise<SuggestionTemplate[]> {
        const { lat, lng, screenType } = req;
        const radiusKm = 1000; // Configurable radius

        // 1. Check database for existing templates near location
        const existingTemplates = await suggestionTemplateDao.findByLocality(lat, lng, radiusKm);

        if (existingTemplates.length > 0) {
            // Filter by display type if needed, though usually we want to return all relevant ones?
            // User requirement says: "Screen type define the suggestion length".
            // If we have cached templates, we should check if they match the screen type or if we should just return what we have?
            // The requirement says "Next time ... check ... if there is any already a processed entry ... then take that".
            // It suggests reusing the cached location-based suggestions.
            // However, if the cached ones are for 'mobile' and now we need 'desktop', usage might be tricky.
            // But usually API returns a set of templates, maybe for both?
            // The agent generates 4 suggestions. The agent input takes screenType.
            // So the cached templates will be specific to that screenType OR the templates table should handle both?
            // Implementation detail: The DB `SuggestionTemplate` has `displayType`.
            // So we should filter cached results by screenType (or 'all').
            const validTemplates = existingTemplates.filter(t =>
                t.displayType === 'all' || t.displayType === (screenType as DisplayType)
            );

            if (validTemplates.length > 0) {
                return validTemplates;
            }
        }

        // 2. If no valid cached templates, call AI service
        const placeName = await this.getPlaceNameFromLocation(lat, lng);
        const aiSuggestions = await this.fetchSuggestionsFromAI(placeName, screenType);

        // 3. Save new templates to database
        const newTemplates: SuggestionTemplate[] = [];

        // We clear old templates for this specific location + displayType if we want to refresh?
        // or just append? The requirement implies "processed entry ... take that".
        // Since we didn't find any (or enough), we create new ones.

        for (const suggestion of aiSuggestions) {
            const input: CreateSuggestionTemplateInput = {
                priority: suggestion.order,
                templateText: suggestion.template_text,
                description: suggestion.description || 'AI Generated Suggestion',
                displayType: screenType as DisplayType,
                category: suggestion.category as SuggestionCategory, // Ensure mapping handles this
                localityLat: lat,
                localityLng: lng,
                localityRadiusKm: radiusKm,
                placeholderOptions: suggestion.placeholders,
                isActive: true
            };

            const created = await suggestionTemplateDao.create(input);
            newTemplates.push(created);
        }

        return newTemplates;
    }
}

export default new SuggestionService();
