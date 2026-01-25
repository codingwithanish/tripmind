import { prisma } from '../prismaClient';
import {
    Timeline,
    TimelineNode,
    TimelineNodeElement,
    TimelineStatus,
    BudgetType,
    NodeType,
    NodeStatus,
    ElementType,
    ElementStatus,
    Prisma,
} from '@prisma/client';

// JSONB type definitions
export interface DisplayIcon {
    provider: string;
    name: string;
}

export interface NodeSummary {
    summary: string;
    elements_summary?: string[];
    keywords?: string[];
}

export interface PriceRange {
    type: 'range' | 'constant' | 'confirmed';
    currency: string;
    min?: number;
    max?: number;
    confirmed?: number;
}

// Input types
export interface CreateTimelineInput {
    renderingStyle?: string;
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    budgetType?: BudgetType;
    adultsCount?: number;
    childrenCount?: number;
    timelineContext?: string;
    status?: TimelineStatus;
}

export interface UpdateTimelineInput {
    renderingStyle?: string;
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    budgetType?: BudgetType;
    adultsCount?: number;
    childrenCount?: number;
    timelineContext?: string;
    status?: TimelineStatus;
}

export interface CreateTimelineNodeInput {
    timelineId: string;
    order: number;
    type: NodeType;
    subtype?: string;
    displayTitle?: string;
    displaySubtitle?: string;
    displayIcon?: DisplayIcon;
    nodeSummary?: NodeSummary;
    displayDateType?: 'date' | 'date_range' | 'time' | 'time_range';
    displayDateLabel?: string;
    displayDateStart?: Date;
    displayDateEnd?: Date;
}

export interface CreateTimelineNodeElementInput {
    timelineNodeId: string;
    timelineId: string;
    elementType: ElementType;
    elementCategory: string;
    elementIcon?: DisplayIcon;
    title: string;
    description?: string;
    priceRange?: PriceRange;
    status?: ElementStatus;
    priority?: number;
    order?: number;
    metadata?: Record<string, any>;
}

// Timeline with relations
export type TimelineWithNodes = Timeline & {
    nodes: TimelineNode[];
};

export type TimelineWithNodesAndElements = Timeline & {
    nodes: (TimelineNode & {
        elements: TimelineNodeElement[];
    })[];
};

class TimelineDao {
    // ========================================
    // Timeline Operations
    // ========================================

    /**
     * Find timeline by ID
     */
    async findById(id: string): Promise<Timeline | null> {
        return prisma.timeline.findUnique({
            where: { id },
        });
    }

    /**
     * Find timeline with nodes
     */
    async findByIdWithNodes(id: string): Promise<TimelineWithNodes | null> {
        return prisma.timeline.findUnique({
            where: { id },
            include: {
                nodes: {
                    orderBy: { order: 'asc' },
                },
            },
        });
    }

    /**
     * Find timeline with nodes and elements
     */
    async findByIdWithNodesAndElements(
        id: string
    ): Promise<TimelineWithNodesAndElements | null> {
        return prisma.timeline.findUnique({
            where: { id },
            include: {
                nodes: {
                    orderBy: { order: 'asc' },
                    include: {
                        elements: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
    }

    /**
     * Create a new timeline
     */
    async create(data: CreateTimelineInput = {}): Promise<Timeline> {
        return prisma.timeline.create({
            data: {
                renderingStyle: data.renderingStyle ?? 'default',
                startDate: data.startDate,
                endDate: data.endDate,
                budget: data.budget ? new Prisma.Decimal(data.budget) : new Prisma.Decimal(0),
                budgetType: data.budgetType ?? 'approx',
                adultsCount: data.adultsCount ?? 1,
                childrenCount: data.childrenCount ?? 0,
                timelineContext: data.timelineContext,
                status: data.status ?? 'draft',
            },
        });
    }

    /**
     * Update timeline by ID
     */
    async update(id: string, data: UpdateTimelineInput): Promise<Timeline> {
        const updateData: Prisma.TimelineUpdateInput = {};

        if (data.renderingStyle !== undefined) updateData.renderingStyle = data.renderingStyle;
        if (data.startDate !== undefined) updateData.startDate = data.startDate;
        if (data.endDate !== undefined) updateData.endDate = data.endDate;
        if (data.budget !== undefined) updateData.budget = new Prisma.Decimal(data.budget);
        if (data.budgetType !== undefined) updateData.budgetType = data.budgetType;
        if (data.adultsCount !== undefined) updateData.adultsCount = data.adultsCount;
        if (data.childrenCount !== undefined) updateData.childrenCount = data.childrenCount;
        if (data.timelineContext !== undefined) updateData.timelineContext = data.timelineContext;
        if (data.status !== undefined) updateData.status = data.status;

        return prisma.timeline.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Update timeline status
     */
    async updateStatus(id: string, status: TimelineStatus): Promise<Timeline> {
        return this.update(id, { status });
    }

    /**
     * Delete timeline by ID
     */
    async delete(id: string): Promise<Timeline> {
        return prisma.timeline.delete({
            where: { id },
        });
    }

    // ========================================
    // Timeline Node Operations
    // ========================================

    /**
     * Find node by ID
     */
    async findNodeById(id: string): Promise<TimelineNode | null> {
        return prisma.timelineNode.findUnique({
            where: { id },
        });
    }

    /**
     * Find nodes by timeline ID
     */
    async findNodesByTimelineId(timelineId: string): Promise<TimelineNode[]> {
        return prisma.timelineNode.findMany({
            where: { timelineId },
            orderBy: { order: 'asc' },
        });
    }

    /**
     * Create a new timeline node
     */
    async createNode(data: CreateTimelineNodeInput): Promise<TimelineNode> {
        return prisma.timelineNode.create({
            data: {
                timelineId: data.timelineId,
                order: data.order,
                type: data.type,
                subtype: data.subtype,
                displayTitle: data.displayTitle,
                displaySubtitle: data.displaySubtitle,
                displayIcon: data.displayIcon as any,
                nodeSummary: data.nodeSummary as any,
                displayDateType: data.displayDateType,
                displayDateLabel: data.displayDateLabel,
                displayDateStart: data.displayDateStart,
                displayDateEnd: data.displayDateEnd,
            },
        });
    }

    /**
     * Create multiple nodes at once
     */
    async createManyNodes(
        nodes: CreateTimelineNodeInput[]
    ): Promise<{ count: number }> {
        return prisma.timelineNode.createMany({
            data: nodes.map((data) => ({
                timelineId: data.timelineId,
                order: data.order,
                type: data.type,
                subtype: data.subtype,
                displayTitle: data.displayTitle,
                displaySubtitle: data.displaySubtitle,
                displayIcon: data.displayIcon as any,
                nodeSummary: data.nodeSummary as any,
                displayDateType: data.displayDateType,
                displayDateLabel: data.displayDateLabel,
                displayDateStart: data.displayDateStart,
                displayDateEnd: data.displayDateEnd,
            })),
        });
    }

    /**
     * Update node status
     */
    async updateNodeStatus(id: string, status: NodeStatus): Promise<TimelineNode> {
        return prisma.timelineNode.update({
            where: { id },
            data: { status },
        });
    }

    /**
     * Delete node by ID
     */
    async deleteNode(id: string): Promise<TimelineNode> {
        return prisma.timelineNode.delete({
            where: { id },
        });
    }

    /**
     * Delete all nodes for a timeline
     */
    async deleteNodesByTimelineId(timelineId: string): Promise<number> {
        const result = await prisma.timelineNode.deleteMany({
            where: { timelineId },
        });
        return result.count;
    }

    // ========================================
    // Timeline Node Element Operations
    // ========================================

    /**
     * Find element by ID
     */
    async findElementById(id: string): Promise<TimelineNodeElement | null> {
        return prisma.timelineNodeElement.findUnique({
            where: { id },
        });
    }

    /**
     * Find elements by node ID
     */
    async findElementsByNodeId(nodeId: string): Promise<TimelineNodeElement[]> {
        return prisma.timelineNodeElement.findMany({
            where: { timelineNodeId: nodeId },
            orderBy: { order: 'asc' },
        });
    }

    /**
     * Find elements by timeline ID
     */
    async findElementsByTimelineId(
        timelineId: string
    ): Promise<TimelineNodeElement[]> {
        return prisma.timelineNodeElement.findMany({
            where: { timelineId },
            orderBy: { order: 'asc' },
        });
    }

    /**
     * Create a new element
     */
    async createElement(data: CreateTimelineNodeElementInput): Promise<TimelineNodeElement> {
        return prisma.timelineNodeElement.create({
            data: {
                timelineNodeId: data.timelineNodeId,
                timelineId: data.timelineId,
                elementType: data.elementType,
                elementCategory: data.elementCategory,
                elementIcon: data.elementIcon as any,
                title: data.title,
                description: data.description,
                priceRange: data.priceRange as any,
                status: data.status ?? 'pending',
                priority: data.priority ?? 1,
                order: data.order ?? 0,
                metadata: data.metadata as any,
            },
        });
    }

    /**
     * Create multiple elements at once
     */
    async createManyElements(
        elements: CreateTimelineNodeElementInput[]
    ): Promise<{ count: number }> {
        return prisma.timelineNodeElement.createMany({
            data: elements.map((data) => ({
                timelineNodeId: data.timelineNodeId,
                timelineId: data.timelineId,
                elementType: data.elementType,
                elementCategory: data.elementCategory,
                elementIcon: data.elementIcon as any,
                title: data.title,
                description: data.description,
                priceRange: data.priceRange as any,
                status: data.status ?? 'pending',
                priority: data.priority ?? 1,
                order: data.order ?? 0,
                metadata: data.metadata as any,
            })),
        });
    }

    /**
     * Update element status
     */
    async updateElementStatus(
        id: string,
        status: ElementStatus
    ): Promise<TimelineNodeElement> {
        return prisma.timelineNodeElement.update({
            where: { id },
            data: { status },
        });
    }

    /**
     * Delete element by ID
     */
    async deleteElement(id: string): Promise<TimelineNodeElement> {
        return prisma.timelineNodeElement.delete({
            where: { id },
        });
    }

    /**
     * Get element counts by status for a timeline
     */
    async getElementStatusCounts(
        timelineId: string
    ): Promise<Record<ElementStatus, number>> {
        const counts = await prisma.timelineNodeElement.groupBy({
            by: ['status'],
            where: { timelineId },
            _count: { id: true },
        });

        const result: Record<string, number> = {
            confirmed: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
        };

        counts.forEach((c) => {
            result[c.status] = c._count.id;
        });

        return result as Record<ElementStatus, number>;
    }
}

export const timelineDao = new TimelineDao();
export default timelineDao;
