import { prisma } from '../prismaClient';
import {
    Notification,
    NotificationType,
    NotificationPriority,
    Prisma,
} from '@prisma/client';

// Input types
export interface CreateNotificationInput {
    threadId?: string;
    timelineId?: string;
    version?: number;
    title: string;
    message: string;
    priority?: NotificationPriority;
    type: NotificationType;
    actionUrl?: string;
    metadata?: Record<string, any>;
}

export interface UpdateNotificationInput {
    isRead?: boolean;
    metadata?: Record<string, any>;
}

class NotificationDao {
    /**
     * Find notification by ID
     */
    async findById(id: string): Promise<Notification | null> {
        return prisma.notification.findUnique({
            where: { id },
        });
    }

    /**
     * Find notifications by thread ID
     */
    async findByThreadId(
        threadId: string,
        includeRead: boolean = false
    ): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: {
                threadId,
                ...(includeRead ? {} : { isRead: false }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Find notifications by timeline ID
     */
    async findByTimelineId(
        timelineId: string,
        includeRead: boolean = false
    ): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: {
                timelineId,
                ...(includeRead ? {} : { isRead: false }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get all notifications with pagination
     */
    async findAll(
        page: number = 1,
        limit: number = 20,
        includeRead: boolean = false
    ): Promise<{ notifications: Notification[]; total: number }> {
        const skip = (page - 1) * limit;
        const where = includeRead ? {} : { isRead: false };

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notification.count({ where }),
        ]);

        return { notifications, total };
    }

    /**
     * Create a new notification
     */
    async create(data: CreateNotificationInput): Promise<Notification> {
        return prisma.notification.create({
            data: {
                threadId: data.threadId,
                timelineId: data.timelineId,
                version: data.version,
                title: data.title,
                message: data.message,
                priority: data.priority ?? 'medium',
                type: data.type,
                actionUrl: data.actionUrl,
                metadata: data.metadata as any,
            },
        });
    }

    /**
     * Create system notification
     */
    async createSystemNotification(
        title: string,
        message: string,
        priority: NotificationPriority = 'medium'
    ): Promise<Notification> {
        return this.create({
            title,
            message,
            priority,
            type: 'system',
        });
    }

    /**
     * Create travel update notification
     */
    async createTravelNotification(
        threadId: string,
        timelineId: string,
        title: string,
        message: string,
        priority: NotificationPriority = 'medium'
    ): Promise<Notification> {
        return this.create({
            threadId,
            timelineId,
            title,
            message,
            priority,
            type: 'travel_update',
        });
    }

    /**
     * Update notification by ID
     */
    async update(id: string, data: UpdateNotificationInput): Promise<Notification> {
        const updateData: Prisma.NotificationUpdateInput = {};

        if (data.isRead !== undefined) updateData.isRead = data.isRead;
        if (data.metadata !== undefined) {
            updateData.metadata = data.metadata as any;
        }

        return prisma.notification.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Mark notification as read
     */
    async markRead(id: string): Promise<Notification> {
        return this.update(id, { isRead: true });
    }

    /**
     * Mark all notifications for a thread as read
     */
    async markAllReadForThread(threadId: string): Promise<number> {
        const result = await prisma.notification.updateMany({
            where: { threadId, isRead: false },
            data: { isRead: true },
        });
        return result.count;
    }

    /**
     * Mark all notifications for a timeline as read
     */
    async markAllReadForTimeline(timelineId: string): Promise<number> {
        const result = await prisma.notification.updateMany({
            where: { timelineId, isRead: false },
            data: { isRead: true },
        });
        return result.count;
    }

    /**
     * Delete notification by ID
     */
    async delete(id: string): Promise<Notification> {
        return prisma.notification.delete({
            where: { id },
        });
    }

    /**
     * Delete all notifications for a thread
     */
    async deleteByThreadId(threadId: string): Promise<number> {
        const result = await prisma.notification.deleteMany({
            where: { threadId },
        });
        return result.count;
    }

    /**
     * Delete all read notifications older than given date
     */
    async deleteOldRead(olderThan: Date): Promise<number> {
        const result = await prisma.notification.deleteMany({
            where: {
                isRead: true,
                createdAt: { lt: olderThan },
            },
        });
        return result.count;
    }

    /**
     * Count unread notifications
     */
    async countUnread(): Promise<number> {
        return prisma.notification.count({
            where: { isRead: false },
        });
    }

    /**
     * Count unread notifications by thread
     */
    async countUnreadByThread(threadId: string): Promise<number> {
        return prisma.notification.count({
            where: { threadId, isRead: false },
        });
    }

    /**
     * Get notifications by priority
     */
    async findByPriority(
        priority: NotificationPriority,
        includeRead: boolean = false
    ): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: {
                priority,
                ...(includeRead ? {} : { isRead: false }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get urgent unread notifications
     */
    async findUrgent(): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: {
                priority: { in: ['high', 'urgent'] },
                isRead: false,
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }
}

export const notificationDao = new NotificationDao();
export default notificationDao;
