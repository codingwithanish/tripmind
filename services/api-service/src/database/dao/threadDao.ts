import { prisma } from '../prismaClient';
import { Thread, ThreadStatus, ThreadSubStatus, Prisma } from '@prisma/client';

// Version details JSONB structure
export interface VersionInfo {
    version_id: string;
    timeline_id: string;
    status: 'active' | 'archived' | 'draft';
}

export interface VersionDetails {
    versions: VersionInfo[];
    current_version: string;
}

// Input types
export interface CreateThreadInput {
    userEmail?: string;
    status?: ThreadStatus;
    view?: string;
}

export interface UpdateThreadInput {
    timelineId?: string;
    timelineReadyProgress?: number;
    status?: ThreadStatus;
    subStatus?: ThreadSubStatus | null;
    summary?: string;
    versionDetails?: VersionDetails;
    isConfirmed?: boolean;
    view?: string;
}

// Thread with relations type
export type ThreadWithContext = Thread & {
    threadContext: any | null;
};

export type ThreadWithMessages = Thread & {
    messages: any[];
};

class ThreadDao {
    /**
     * Find thread by ID
     */
    async findById(id: string): Promise<Thread | null> {
        return prisma.thread.findUnique({
            where: { id },
        });
    }

    /**
     * Find thread by ID with context
     */
    async findByIdWithContext(id: string): Promise<ThreadWithContext | null> {
        return prisma.thread.findUnique({
            where: { id },
            include: { threadContext: true },
        });
    }

    /**
     * Find thread by ID with messages
     */
    async findByIdWithMessages(id: string): Promise<ThreadWithMessages | null> {
        return prisma.thread.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    /**
     * Find all threads for a user
     */
    async findByUserEmail(
        userEmail: string,
        page: number = 1,
        limit: number = 10,
        status?: ThreadStatus
    ): Promise<{ threads: Thread[]; total: number }> {
        const skip = (page - 1) * limit;
        const where: Prisma.ThreadWhereInput = {
            userEmail,
            ...(status && { status }),
        };

        const [threads, total] = await Promise.all([
            prisma.thread.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
            }),
            prisma.thread.count({ where }),
        ]);

        return { threads, total };
    }

    /**
     * Create a new thread
     */
    async create(data: CreateThreadInput = {}): Promise<Thread> {
        return prisma.thread.create({
            data: {
                userEmail: data.userEmail,
                status: data.status ?? 'draft',
                view: data.view ?? 'init-chat',
            },
        });
    }

    /**
     * Update thread by ID
     */
    async update(id: string, data: UpdateThreadInput): Promise<Thread> {
        const updateData: Prisma.ThreadUpdateInput = {};

        if (data.timelineId !== undefined) {
            updateData.timeline = data.timelineId
                ? { connect: { id: data.timelineId } }
                : { disconnect: true };
        }
        if (data.timelineReadyProgress !== undefined) {
            updateData.timelineReadyProgress = data.timelineReadyProgress;
        }
        if (data.status !== undefined) updateData.status = data.status;
        if (data.subStatus !== undefined) updateData.subStatus = data.subStatus;
        if (data.summary !== undefined) updateData.summary = data.summary;
        if (data.versionDetails !== undefined) {
            updateData.versionDetails = data.versionDetails as any;
        }
        if (data.isConfirmed !== undefined) updateData.isConfirmed = data.isConfirmed;
        if (data.view !== undefined) updateData.view = data.view;

        return prisma.thread.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Update thread progress
     */
    async updateProgress(id: string, progress: number): Promise<Thread> {
        return this.update(id, { timelineReadyProgress: progress });
    }

    /**
     * Update thread status
     */
    async updateStatus(
        id: string,
        status: ThreadStatus,
        subStatus?: ThreadSubStatus
    ): Promise<Thread> {
        return this.update(id, { status, subStatus });
    }

    /**
     * Link timeline to thread
     */
    async linkTimeline(id: string, timelineId: string): Promise<Thread> {
        return this.update(id, { timelineId });
    }

    /**
     * Confirm thread
     */
    async confirm(id: string): Promise<Thread> {
        return this.update(id, {
            status: 'confirmed',
            subStatus: 'timeline_finalized',
            isConfirmed: true,
        });
    }

    /**
     * Delete thread by ID
     */
    async delete(id: string): Promise<Thread> {
        return prisma.thread.delete({
            where: { id },
        });
    }

    /**
     * Delete all threads for a user
     */
    async deleteByUserEmail(userEmail: string): Promise<number> {
        const result = await prisma.thread.deleteMany({
            where: { userEmail },
        });
        return result.count;
    }

    /**
     * Check if thread belongs to user
     */
    async belongsToUser(id: string, userEmail: string): Promise<boolean> {
        const thread = await prisma.thread.findFirst({
            where: { id, userEmail },
        });
        return thread !== null;
    }

    /**
     * Get threads ready for timeline creation (progress >= threshold)
     */
    async findReadyForTimeline(threshold: number = 80): Promise<Thread[]> {
        return prisma.thread.findMany({
            where: {
                timelineReadyProgress: { gte: threshold },
                timelineId: null,
                status: { in: ['draft', 'planning'] },
            },
            orderBy: { timelineReadyProgress: 'desc' },
        });
    }

    /**
     * Count user threads by status
     */
    async countByStatus(
        userEmail: string
    ): Promise<Record<ThreadStatus, number>> {
        const counts = await prisma.thread.groupBy({
            by: ['status'],
            where: { userEmail },
            _count: { id: true },
        });

        const result: Record<string, number> = {
            draft: 0,
            planning: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            dropped: 0,
        };

        counts.forEach((c) => {
            result[c.status] = c._count.id;
        });

        return result as Record<ThreadStatus, number>;
    }
}

export const threadDao = new ThreadDao();
export default threadDao;
