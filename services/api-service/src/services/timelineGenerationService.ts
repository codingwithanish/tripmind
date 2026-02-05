import env from '../config/env';
import { timelineDao } from '../database/dao/timelineDao';
import { threadContextDao } from '../database/dao/threadContextDao';
import { threadDao } from '../database/dao/threadDao';
import { NodeType } from '@prisma/client';

// Types matching the AI agent output
export interface PriceInfo {
    type: 'confirmed' | 'range' | 'constant';
    unit: string;
    confirmed_price?: number;
    min?: number;
    max?: number;
    value?: number;
}

export interface TaskOutput {
    priority: number;
    title: string;
    title_image?: string;
    description?: string;
    price?: PriceInfo;
}

export interface RecommendationOutput {
    type: 'restaurant' | 'place' | 'activity' | 'hotel' | 'flight';
    priority: number;
    title: string;
    title_image?: string;
    description?: string;
    price_included: boolean;
    price_info?: PriceInfo;
}

export interface RepresentationOutput {
    title: string;
    description?: string;
    icon?: string;
}

export interface DisplayDate {
    type: 'date' | 'date_range' | 'time' | 'time_range';
    label: string;
    start: string;
    end?: string;
}

export interface TimelineNodeOutput {
    order: number;
    type: 'start' | 'end' | 'action' | 'representation';
    subtype?: string | null;
    display_date?: DisplayDate | null;
    tasks?: TaskOutput[];
    recommendations?: RecommendationOutput[];
    representation?: RepresentationOutput;
}

export interface TimelineGenerationResponse {
    style: string;
    configs: {
        display_price_unit: string;
        timezone: string;
    };
    nodes: TimelineNodeOutput[];
}

export interface PlanSummary {
    travel_summary: string;
    user_variables: Array<{
        field_name: string;
        value: string;
        type: 'mandatory' | 'optional';
    }>;
}

class TimelineGenerationService {
    private readonly AI_SERVICE_URL = env.AI_SERVICE_URL;

    /**
     * Generate a timeline from a plan summary using the AI agent
     */
    async generateTimeline(planSummary: PlanSummary): Promise<TimelineGenerationResponse> {
        const response = await fetch(`${this.AI_SERVICE_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_name: 'timeline_generation_agent',
                input_payload: {
                    plan_summary: {
                        travel_summary: planSummary.travel_summary,
                        user_variables: planSummary.user_variables,
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`AI Service error: ${response.statusText}`);
        }

        const result = await response.json() as any;

        if (result.status === 'success' && result.output) {
            return result.output as TimelineGenerationResponse;
        }

        throw new Error(result.reason || 'Unknown error from AI Service');
    }

    /**
     * Generate timeline and save to database for a thread
     */
    async generateAndSaveTimeline(threadId: string): Promise<{
        timelineId: string;
        timeline: TimelineGenerationResponse;
    }> {
        // 1. Check if thread already has a timeline
        const thread = await threadDao.findById(threadId);
        if (!thread) {
            throw new Error(`Thread not found: ${threadId}`);
        }

        if (thread.timelineId) {
            // Timeline already exists - return existing
            const existingTimeline = await timelineDao.findByIdWithNodesAndElements(thread.timelineId);
            if (existingTimeline) {
                // Convert to response format
                return {
                    timelineId: thread.timelineId,
                    timeline: this.convertDbTimelineToResponse(existingTimeline)
                };
            }
        }

        // 2. Get plan summary from thread context
        const threadContext = await threadContextDao.findByThreadId(threadId);
        if (!threadContext || !threadContext.planSummary) {
            throw new Error('No plan summary found for thread. Complete the travel planning first.');
        }

        const planSummary = threadContext.planSummary as unknown as PlanSummary;

        // 3. Generate timeline via AI agent
        const generatedTimeline = await this.generateTimeline(planSummary);

        // 4. Save timeline to database
        const timeline = await timelineDao.create({
            renderingStyle: generatedTimeline.style,
            status: 'draft',
        });

        // 5. Save nodes and elements
        for (const node of generatedTimeline.nodes) {
            const nodeType = this.mapNodeType(node.type);

            const createdNode = await timelineDao.createNode({
                timelineId: timeline.id,
                order: node.order,
                type: nodeType,
                subtype: node.subtype || undefined,
                displayDateType: node.display_date?.type as any,
                displayDateLabel: node.display_date?.label,
                displayDateStart: node.display_date?.start ? new Date(node.display_date.start) : undefined,
                displayDateEnd: node.display_date?.end ? new Date(node.display_date.end) : undefined,
                displayTitle: node.representation?.title,
                displaySubtitle: node.representation?.description,
                displayIcon: node.representation?.icon ? { provider: 'mdi', name: node.representation.icon } : undefined,
            });

            // Save tasks as elements
            if (node.tasks) {
                for (let i = 0; i < node.tasks.length; i++) {
                    const task = node.tasks[i];
                    await timelineDao.createElement({
                        timelineNodeId: createdNode.id,
                        timelineId: timeline.id,
                        elementType: 'task',
                        elementCategory: 'task',
                        title: task.title,
                        description: task.description,
                        elementIcon: task.title_image ? { provider: 'mdi', name: task.title_image } : undefined,
                        priceRange: task.price ? {
                            type: task.price.type,
                            currency: task.price.unit,
                            min: task.price.min,
                            max: task.price.max,
                            confirmed: task.price.confirmed_price,
                        } : undefined,
                        priority: task.priority,
                        order: i,
                        status: 'pending',
                    });
                }
            }

            // Save recommendations as elements
            if (node.recommendations) {
                for (let i = 0; i < node.recommendations.length; i++) {
                    const rec = node.recommendations[i];
                    await timelineDao.createElement({
                        timelineNodeId: createdNode.id,
                        timelineId: timeline.id,
                        elementType: 'recommendation',
                        elementCategory: rec.type,
                        title: rec.title,
                        description: rec.description,
                        elementIcon: rec.title_image ? { provider: 'mdi', name: rec.title_image } : undefined,
                        priceRange: rec.price_info ? {
                            type: rec.price_info.type,
                            currency: rec.price_info.unit,
                            min: rec.price_info.min,
                            max: rec.price_info.max,
                            confirmed: rec.price_info.confirmed_price,
                        } : undefined,
                        priority: rec.priority,
                        order: i,
                        status: 'pending',
                    });
                }
            }
        }

        // 6. Update thread with timeline ID
        await threadDao.update(threadId, { timelineId: timeline.id });

        return {
            timelineId: timeline.id,
            timeline: generatedTimeline
        };
    }

    /**
     * Map AI output node type to database NodeType enum
     */
    private mapNodeType(type: string): NodeType {
        switch (type) {
            case 'start': return 'start';
            case 'end': return 'end';
            case 'action': return 'action';
            case 'representation': return 'representation';
            default: return 'action';
        }
    }

    /**
     * Convert database timeline to API response format
     */
    private convertDbTimelineToResponse(dbTimeline: any): TimelineGenerationResponse {
        return {
            style: dbTimeline.renderingStyle || 'default',
            configs: {
                display_price_unit: 'USD',
                timezone: 'UTC',
            },
            nodes: dbTimeline.nodes.map((node: any) => ({
                order: node.order,
                type: node.type,
                subtype: node.subtype,
                display_date: node.displayDateType ? {
                    type: node.displayDateType,
                    label: node.displayDateLabel || '',
                    start: node.displayDateStart?.toISOString() || '',
                    end: node.displayDateEnd?.toISOString(),
                } : null,
                tasks: node.elements
                    ?.filter((e: any) => e.elementType === 'task')
                    .map((e: any) => ({
                        priority: e.priority,
                        title: e.title,
                        title_image: e.elementIcon?.name,
                        description: e.description,
                        price: e.priceRange,
                    })),
                recommendations: node.elements
                    ?.filter((e: any) => e.elementType === 'recommendation')
                    .map((e: any) => ({
                        type: e.elementCategory,
                        priority: e.priority,
                        title: e.title,
                        title_image: e.elementIcon?.name,
                        description: e.description,
                        price_included: !!e.priceRange,
                        price_info: e.priceRange,
                    })),
                representation: node.type === 'representation' ? {
                    title: node.displayTitle || '',
                    description: node.displaySubtitle,
                    icon: node.displayIcon?.name,
                } : undefined,
            }))
        };
    }
}

export const timelineGenerationService = new TimelineGenerationService();
export default timelineGenerationService;
