import { prisma } from '../prismaClient';
import { Message, MessageRole, MessageType, MessageStatus, Prisma } from '@prisma/client';

// Input types
export interface CreateMessageInput {
    threadId: string;
    senderId: string;
    role: MessageRole;
    type: MessageType;
    content: string | Buffer;
    status?: MessageStatus;
    metadata?: Record<string, any>;
}

export interface UpdateMessageInput {
    status?: MessageStatus;
    metadata?: Record<string, any>;
}

// Message with decoded content for easier use
export interface DecodedMessage extends Omit<Message, 'content'> {
    content: string;
}

class MessageDao {
    /**
     * Convert string to Buffer for storage
     */
    private encodeContent(content: string | Buffer): Buffer {
        if (Buffer.isBuffer(content)) {
            return content;
        }
        return Buffer.from(content, 'utf-8');
    }

    /**
     * Convert Buffer to string for reading
     */
    private decodeContent(content: Buffer): string {
        return content.toString('utf-8');
    }

    /**
     * Transform message with decoded content
     */
    private transformMessage(message: Message): DecodedMessage {
        return {
            ...message,
            content: this.decodeContent(message.content),
        };
    }

    /**
     * Find message by ID
     */
    async findById(id: string): Promise<DecodedMessage | null> {
        const message = await prisma.message.findUnique({
            where: { id },
        });

        return message ? this.transformMessage(message) : null;
    }

    /**
     * Find all messages for a thread
     */
    async findByThreadId(
        threadId: string,
        page: number = 1,
        limit: number = 50
    ): Promise<{ messages: DecodedMessage[]; total: number }> {
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where: { threadId },
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' },
            }),
            prisma.message.count({ where: { threadId } }),
        ]);

        return {
            messages: messages.map((m) => this.transformMessage(m)),
            total,
        };
    }

    /**
     * Get latest messages in a thread
     */
    async findLatest(threadId: string, count: number = 10): Promise<DecodedMessage[]> {
        const messages = await prisma.message.findMany({
            where: { threadId },
            take: count,
            orderBy: { createdAt: 'desc' },
        });

        // Reverse to get chronological order
        return messages.reverse().map((m) => this.transformMessage(m));
    }

    /**
     * Create a new message
     */
    async create(data: CreateMessageInput): Promise<DecodedMessage> {
        const message = await prisma.message.create({
            data: {
                threadId: data.threadId,
                senderId: data.senderId,
                role: data.role,
                type: data.type,
                content: this.encodeContent(data.content),
                status: data.status ?? 'sent',
                metadata: data.metadata as any,
            },
        });

        return this.transformMessage(message);
    }

    /**
     * Create user message
     */
    async createUserMessage(
        threadId: string,
        senderId: string,
        content: string,
        type: MessageType = 'text'
    ): Promise<DecodedMessage> {
        return this.create({
            threadId,
            senderId,
            role: 'user',
            type,
            content,
        });
    }

    /**
     * Create assistant message
     */
    async createAssistantMessage(
        threadId: string,
        content: string,
        type: MessageType = 'markdown',
        metadata?: Record<string, any>
    ): Promise<DecodedMessage> {
        return this.create({
            threadId,
            senderId: 'ai_system',
            role: 'assistant',
            type,
            content,
            metadata,
        });
    }

    /**
     * Update message by ID
     */
    async update(id: string, data: UpdateMessageInput): Promise<DecodedMessage> {
        const updateData: Prisma.MessageUpdateInput = {};

        if (data.status !== undefined) updateData.status = data.status;
        if (data.metadata !== undefined) {
            updateData.metadata = data.metadata as any;
        }

        const message = await prisma.message.update({
            where: { id },
            data: updateData,
        });

        return this.transformMessage(message);
    }

    /**
     * Update message status
     */
    async updateStatus(id: string, status: MessageStatus): Promise<DecodedMessage> {
        return this.update(id, { status });
    }

    /**
     * Mark message as delivered
     */
    async markDelivered(id: string): Promise<DecodedMessage> {
        return this.updateStatus(id, 'delivered');
    }

    /**
     * Mark message as read
     */
    async markRead(id: string): Promise<DecodedMessage> {
        return this.updateStatus(id, 'read');
    }

    /**
     * Mark all messages in thread as read
     */
    async markAllRead(threadId: string): Promise<number> {
        const result = await prisma.message.updateMany({
            where: {
                threadId,
                status: { in: ['sent', 'delivered'] },
            },
            data: { status: 'read' },
        });
        return result.count;
    }

    /**
     * Delete message by ID
     */
    async delete(id: string): Promise<DecodedMessage> {
        const message = await prisma.message.delete({
            where: { id },
        });
        return this.transformMessage(message);
    }

    /**
     * Delete all messages in a thread
     */
    async deleteByThreadId(threadId: string): Promise<number> {
        const result = await prisma.message.deleteMany({
            where: { threadId },
        });
        return result.count;
    }

    /**
     * Count messages in a thread
     */
    async countByThreadId(threadId: string): Promise<number> {
        return prisma.message.count({
            where: { threadId },
        });
    }

    /**
     * Count unread messages in a thread
     */
    async countUnread(threadId: string): Promise<number> {
        return prisma.message.count({
            where: {
                threadId,
                status: { in: ['sent', 'delivered'] },
            },
        });
    }

    /**
     * Get messages by type
     */
    async findByType(
        threadId: string,
        type: MessageType
    ): Promise<DecodedMessage[]> {
        const messages = await prisma.message.findMany({
            where: { threadId, type },
            orderBy: { createdAt: 'asc' },
        });

        return messages.map((m) => this.transformMessage(m));
    }
}

export const messageDao = new MessageDao();
export default messageDao;
