import { prisma } from '../prismaClient';
import {
    SuggestionTemplate,
    DisplayType,
    SuggestionCategory,
    Prisma,
} from '@prisma/client';

// JSONB type definitions
export interface PlaceholderOption {
    type: 'select' | 'text' | 'number';
    options?: string[];
    default?: string;
}

export interface PlaceholderOptions {
    [key: string]: PlaceholderOption;
}

// Input types
export interface CreateSuggestionTemplateInput {
    priority: number;
    templateText: string;
    description?: string;
    displayType?: DisplayType;
    category: SuggestionCategory;
    localityLat?: number;
    localityLng?: number;
    localityRadiusKm?: number;
    placeholderOptions?: PlaceholderOptions;
    isActive?: boolean;
}

export interface UpdateSuggestionTemplateInput {
    priority?: number;
    templateText?: string;
    description?: string;
    displayType?: DisplayType;
    category?: SuggestionCategory;
    localityLat?: number;
    localityLng?: number;
    localityRadiusKm?: number;
    placeholderOptions?: PlaceholderOptions;
    isActive?: boolean;
}

class SuggestionTemplateDao {
    /**
     * Find template by ID
     */
    async findById(id: string): Promise<SuggestionTemplate | null> {
        return prisma.suggestionTemplate.findUnique({
            where: { id },
        });
    }

    /**
     * Find all active templates
     */
    async findAllActive(): Promise<SuggestionTemplate[]> {
        return prisma.suggestionTemplate.findMany({
            where: { isActive: true },
            orderBy: { priority: 'asc' },
        });
    }

    /**
     * Find templates by category
     */
    async findByCategory(category: SuggestionCategory): Promise<SuggestionTemplate[]> {
        return prisma.suggestionTemplate.findMany({
            where: {
                category,
                isActive: true,
            },
            orderBy: { priority: 'asc' },
        });
    }

    /**
     * Find templates by display type
     */
    async findByDisplayType(displayType: DisplayType): Promise<SuggestionTemplate[]> {
        return prisma.suggestionTemplate.findMany({
            where: {
                displayType: { in: [displayType, 'all'] },
                isActive: true,
            },
            orderBy: { priority: 'asc' },
        });
    }

    /**
     * Find templates near a location
     * Uses Haversine formula approximation for distance calculation
     */
    async findByLocality(
        lat: number,
        lng: number,
        maxDistanceKm: number = 100
    ): Promise<SuggestionTemplate[]> {
        // Use raw SQL for geospatial query
        // This uses the Haversine formula to calculate distance
        // Note: Raw queries return snake_case column names, so we alias them to camelCase
        const templates = await prisma.$queryRaw<SuggestionTemplate[]>`
      SELECT *
      FROM suggestion_templates
      WHERE is_active = true
        AND locality_lat IS NOT NULL
        AND locality_lng IS NOT NULL
        AND (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(locality_lat)) *
            cos(radians(locality_lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(locality_lat))
          )
        ) <= LEAST(locality_radius_km, ${maxDistanceKm})
      ORDER BY priority ASC
    `;

        return templates;
    }

    /**
     * Find templates for mobile display
     */
    async findForMobile(): Promise<SuggestionTemplate[]> {
        return this.findByDisplayType('mobile');
    }

    /**
     * Find templates for desktop display
     */
    async findForDesktop(): Promise<SuggestionTemplate[]> {
        return this.findByDisplayType('desktop');
    }

    /**
     * Create a new template
     */
    async create(data: CreateSuggestionTemplateInput): Promise<SuggestionTemplate> {
        return prisma.suggestionTemplate.create({
            data: {
                priority: data.priority,
                templateText: data.templateText,
                description: data.description,
                displayType: data.displayType ?? 'all',
                category: data.category,
                localityLat: data.localityLat,
                localityLng: data.localityLng,
                localityRadiusKm: data.localityRadiusKm ?? 50,
                placeholderOptions: data.placeholderOptions as any,
                isActive: data.isActive ?? true,
            },
        });
    }

    /**
     * Update template by ID
     */
    async update(
        id: string,
        data: UpdateSuggestionTemplateInput
    ): Promise<SuggestionTemplate> {
        const updateData: Prisma.SuggestionTemplateUpdateInput = {};

        if (data.priority !== undefined) updateData.priority = data.priority;
        if (data.templateText !== undefined) updateData.templateText = data.templateText;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.displayType !== undefined) updateData.displayType = data.displayType;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.localityLat !== undefined) updateData.localityLat = data.localityLat;
        if (data.localityLng !== undefined) updateData.localityLng = data.localityLng;
        if (data.localityRadiusKm !== undefined) {
            updateData.localityRadiusKm = data.localityRadiusKm;
        }
        if (data.placeholderOptions !== undefined) {
            updateData.placeholderOptions = data.placeholderOptions as any;
        }
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        return prisma.suggestionTemplate.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Activate template
     */
    async activate(id: string): Promise<SuggestionTemplate> {
        return this.update(id, { isActive: true });
    }

    /**
     * Deactivate template
     */
    async deactivate(id: string): Promise<SuggestionTemplate> {
        return this.update(id, { isActive: false });
    }

    /**
     * Delete template by ID
     */
    async delete(id: string): Promise<SuggestionTemplate> {
        return prisma.suggestionTemplate.delete({
            where: { id },
        });
    }

    /**
     * Reorder templates
     */
    async reorder(templateIds: string[]): Promise<void> {
        const updates = templateIds.map((id, index) =>
            prisma.suggestionTemplate.update({
                where: { id },
                data: { priority: index + 1 },
            })
        );

        await prisma.$transaction(updates);
    }

    /**
     * Count active templates
     */
    async countActive(): Promise<number> {
        return prisma.suggestionTemplate.count({
            where: { isActive: true },
        });
    }

    /**
     * Count templates by category
     */
    async countByCategory(): Promise<Record<SuggestionCategory, number>> {
        const counts = await prisma.suggestionTemplate.groupBy({
            by: ['category'],
            where: { isActive: true },
            _count: { id: true },
        });

        const result: Record<string, number> = {
            long_time_plan: 0,
            short_time_plan: 0,
            weekend_plan: 0,
            quick_trip: 0,
        };

        counts.forEach((c) => {
            result[c.category] = c._count.id;
        });

        return result as Record<SuggestionCategory, number>;
    }
}

export const suggestionTemplateDao = new SuggestionTemplateDao();
export default suggestionTemplateDao;
