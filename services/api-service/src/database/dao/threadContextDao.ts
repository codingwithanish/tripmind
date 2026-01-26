import { prisma } from '../prismaClient';
import { ThreadContext, Prisma } from '@prisma/client';

// JSONB type definitions
export interface TravellerDetail {
    member_id: string;
    name: string;
    travel_history_context?: string;
    special_notes?: string;
}

// Input types
export interface CreateThreadContextInput {
    threadId: string;
    budget?: number;
    currency?: string;
    startDate?: Date;
    endDate?: Date;
    planSummary?: string;
    travellersDetails?: TravellerDetail[];
    journeyContext?: string;
    generalInstructions?: string[];
    userActions?: string[];
}

export interface UpdateThreadContextInput {
    budget?: number;
    currency?: string;
    startDate?: Date;
    endDate?: Date;
    planSummary?: string;
    travellersDetails?: TravellerDetail[];
    journeyContext?: string;
    generalInstructions?: string[];
    userActions?: string[];
}

class ThreadContextDao {
    /**
     * Find context by ID
     */
    async findById(id: string): Promise<ThreadContext | null> {
        return prisma.threadContext.findUnique({
            where: { id },
        });
    }

    /**
     * Find context by thread ID
     */
    async findByThreadId(threadId: string): Promise<ThreadContext | null> {
        return prisma.threadContext.findUnique({
            where: { threadId },
        });
    }

    /**
     * Create a new thread context
     */
    async create(data: CreateThreadContextInput): Promise<ThreadContext> {
        return prisma.threadContext.create({
            data: {
                threadId: data.threadId,
                budget: data.budget ? new Prisma.Decimal(data.budget) : null,
                currency: data.currency ?? 'USD',
                startDate: data.startDate,
                endDate: data.endDate,
                planSummary: data.planSummary,
                travellersDetails: data.travellersDetails as any,
                journeyContext: data.journeyContext,
                generalInstructions: data.generalInstructions as any,
                userActions: data.userActions as any,
            },
        });
    }

    /**
     * Update context by thread ID
     */
    async updateByThreadId(
        threadId: string,
        data: UpdateThreadContextInput
    ): Promise<ThreadContext> {
        const updateData: Prisma.ThreadContextUpdateInput = {};

        if (data.budget !== undefined) {
            updateData.budget = data.budget ? new Prisma.Decimal(data.budget) : null;
        }
        if (data.currency !== undefined) updateData.currency = data.currency;
        if (data.startDate !== undefined) updateData.startDate = data.startDate;
        if (data.endDate !== undefined) updateData.endDate = data.endDate;
        if (data.planSummary !== undefined) updateData.planSummary = data.planSummary;
        if (data.travellersDetails !== undefined) {
            updateData.travellersDetails = data.travellersDetails as any;
        }
        if (data.journeyContext !== undefined) {
            updateData.journeyContext = data.journeyContext;
        }
        if (data.generalInstructions !== undefined) {
            updateData.generalInstructions = data.generalInstructions as any;
        }
        if (data.userActions !== undefined) {
            updateData.userActions = data.userActions as any;
        }

        return prisma.threadContext.update({
            where: { threadId },
            data: updateData,
        });
    }

    /**
     * Upsert context (create or update)
     */
    async upsert(
        threadId: string,
        data: UpdateThreadContextInput
    ): Promise<ThreadContext> {
        return prisma.threadContext.upsert({
            where: { threadId },
            create: {
                threadId,
                budget: data.budget ? new Prisma.Decimal(data.budget) : null,
                currency: data.currency ?? 'USD',
                startDate: data.startDate,
                endDate: data.endDate,
                planSummary: data.planSummary,
                travellersDetails: data.travellersDetails as any,
                journeyContext: data.journeyContext,
                generalInstructions: data.generalInstructions as any,
                userActions: data.userActions as any,
            },
            update: {
                budget: data.budget ? new Prisma.Decimal(data.budget) : undefined,
                currency: data.currency,
                startDate: data.startDate,
                endDate: data.endDate,
                planSummary: data.planSummary,
                travellersDetails: data.travellersDetails as any,
                journeyContext: data.journeyContext,
                generalInstructions: data.generalInstructions as any,
                userActions: data.userActions as any,
            },
        });
    }

    /**
     * Delete context by thread ID
     */
    async deleteByThreadId(threadId: string): Promise<ThreadContext> {
        return prisma.threadContext.delete({
            where: { threadId },
        });
    }

    /**
     * Add traveller to context
     */
    async addTraveller(
        threadId: string,
        traveller: TravellerDetail
    ): Promise<ThreadContext> {
        const context = await this.findByThreadId(threadId);

        if (!context) {
            return this.create({
                threadId,
                travellersDetails: [traveller],
            });
        }

        const existingTravellers = (context.travellersDetails as unknown as TravellerDetail[]) || [];
        const updatedTravellers = [...existingTravellers, traveller];

        return this.updateByThreadId(threadId, {
            travellersDetails: updatedTravellers,
        });
    }

    /**
     * Remove traveller from context
     */
    async removeTraveller(
        threadId: string,
        memberId: string
    ): Promise<ThreadContext> {
        const context = await this.findByThreadId(threadId);

        if (!context) {
            throw new Error('Thread context not found');
        }

        const existingTravellers = (context.travellersDetails as unknown as TravellerDetail[]) || [];
        const updatedTravellers = existingTravellers.filter(
            (t) => t.member_id !== memberId
        );

        return this.updateByThreadId(threadId, {
            travellersDetails: updatedTravellers,
        });
    }

    /**
     * Add instruction to context
     */
    async addInstruction(threadId: string, instruction: string): Promise<ThreadContext> {
        const context = await this.findByThreadId(threadId);

        if (!context) {
            return this.create({
                threadId,
                generalInstructions: [instruction],
            });
        }

        const existing = (context.generalInstructions as string[]) || [];
        if (!existing.includes(instruction)) {
            existing.push(instruction);
        }

        return this.updateByThreadId(threadId, {
            generalInstructions: existing,
        });
    }

    /**
     * Add user action to context
     */
    async addUserAction(threadId: string, action: string): Promise<ThreadContext> {
        const context = await this.findByThreadId(threadId);

        if (!context) {
            return this.create({
                threadId,
                userActions: [action],
            });
        }

        const existing = (context.userActions as string[]) || [];
        if (!existing.includes(action)) {
            existing.push(action);
        }

        return this.updateByThreadId(threadId, {
            userActions: existing,
        });
    }
}

export const threadContextDao = new ThreadContextDao();
export default threadContextDao;
