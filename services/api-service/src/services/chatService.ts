import env from '../config/env';
import threadDao from '../database/dao/threadDao';
import messageDao from '../database/dao/messageDao';
import threadContextDao, { PlanSummary, TravellerDetail } from '../database/dao/threadContextDao';
import memberDao from '../database/dao/memberDao';
import userDao from '../database/dao/userDao';

// Types for AI agent input/output
export interface MemberMeta {
    id: string;
    name: string;
    relation?: string;
    travel_interests?: string[];
    special_requirements?: string[];
}

export interface UserProfile {
    email: string;
    name: string;
    location?: string;
}

export interface ExistingContext {
    thread_id: string;
    journey_context?: string;
    destination?: string;
    budget?: number;
    travellers_count?: number;
}

export interface ContextInitializationInput {
    initial_message: string;
    user_profile?: UserProfile;
    members: MemberMeta[];
    existing_contexts: ExistingContext[];
}

export interface ContextInitializationOutput {
    budget?: number;
    currency: string;
    start_date?: string;
    end_date?: string;
    plan_summary: PlanSummary;
    travellers_details: TravellerDetail[];
    journey_context: string;
    general_instructions: string[];
    user_actions: string[];
    followup_question: string;
    response_message: string;
    reused_context_from?: string;
}

export interface NewChatResult {
    threadId: string;
    userId: string;
    initialMessage: {
        id: string;
        content: string;
        type: string;
    };
}

class ChatService {
    private readonly AI_SERVICE_URL = env.AI_SERVICE_URL;

    /**
     * Create a new thread in the database
     */
    async createThread(userEmail?: string): Promise<string> {
        const thread = await threadDao.create({
            userEmail,
            status: 'draft',
            view: 'init-chat',
        });
        return thread.id;
    }

    /**
     * Store a message in the database
     */
    async storeUserMessage(
        threadId: string,
        senderId: string,
        content: string,
        type: 'text' | 'markdown' = 'markdown'
    ) {
        return messageDao.createUserMessage(threadId, senderId, content, type);
    }

    /**
     * Store an assistant message in the database
     */
    async storeAssistantMessage(
        threadId: string,
        content: string,
        type: 'text' | 'markdown' = 'markdown',
        metadata?: Record<string, any>
    ) {
        return messageDao.createAssistantMessage(threadId, content, type, metadata);
    }

    /**
     * Get recent thread contexts for potential reuse
     */
    async getRecentContexts(userEmail: string, limit: number = 5): Promise<ExistingContext[]> {
        try {
            const { threads } = await threadDao.findByUserEmail(userEmail, 1, limit);
            const contexts: ExistingContext[] = [];

            for (const thread of threads) {
                const context = await threadContextDao.findByThreadId(thread.id);
                if (context) {
                    const planSummary = context.planSummary as PlanSummary | null;
                    const destination = planSummary?.user_variables?.find(
                        v => v.field_name === 'destination'
                    )?.value;

                    contexts.push({
                        thread_id: thread.id,
                        journey_context: context.journeyContext || undefined,
                        destination: destination !== 'NOT_AVAILABLE' ? destination : undefined,
                        budget: context.budget ? Number(context.budget) : undefined,
                        travellers_count: (context.travellersDetails as unknown as TravellerDetail[] | null)?.length,
                    });
                }
            }

            return contexts;
        } catch (error) {
            console.error('Error fetching recent contexts:', error);
            return [];
        }
    }

    /**
     * Get user profile and members for context
     */
    async getUserProfileAndMembers(userEmail: string): Promise<{
        profile: UserProfile | null;
        members: MemberMeta[];
    }> {
        try {
            const user = await userDao.findByEmail(userEmail);
            const members = await memberDao.findByUserEmail(userEmail);

            const profile: UserProfile | null = user ? {
                email: user.email,
                name: user.name,
                location: undefined, // Could be extracted from primary member's location
            } : null;

            const memberMetas: MemberMeta[] = members.map(m => ({
                id: m.id,
                name: m.name,
                relation: m.relation || undefined,
                travel_interests: (m.interestProfile as any)?.travel_interest,
                special_requirements: (m.travelInstructions as any)?.special_requirements,
            }));

            return { profile, members: memberMetas };
        } catch (error) {
            console.error('Error fetching user profile and members:', error);
            return { profile: null, members: [] };
        }
    }

    /**
     * Call the context initialization agent
     */
    async callContextInitializationAgent(
        input: ContextInitializationInput
    ): Promise<ContextInitializationOutput> {
        const response = await fetch(`${this.AI_SERVICE_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_name: 'context_initialization_agent',
                input_payload: input,
            }),
        });

        if (!response.ok) {
            throw new Error(`AI Service error: ${response.statusText}`);
        }

        const result = await response.json() as any;

        if (result.status === 'success' && result.output) {
            return result.output as ContextInitializationOutput;
        }

        throw new Error(result.reason || 'Unknown error from AI Service');
    }

    /**
     * Save agent output to thread context
     */
    async saveThreadContext(
        threadId: string,
        agentOutput: ContextInitializationOutput
    ): Promise<void> {
        await threadContextDao.upsert(threadId, {
            budget: agentOutput.budget,
            currency: agentOutput.currency,
            startDate: agentOutput.start_date ? new Date(agentOutput.start_date) : undefined,
            endDate: agentOutput.end_date ? new Date(agentOutput.end_date) : undefined,
            planSummary: agentOutput.plan_summary,
            travellersDetails: agentOutput.travellers_details,
            journeyContext: agentOutput.journey_context,
            generalInstructions: agentOutput.general_instructions,
            userActions: agentOutput.user_actions,
        });
    }

    /**
     * Initialize a new chat with full flow:
     * 1. Create thread in DB
     * 2. Store initial message
     * 3. Fetch user context (if logged in)
     * 4. Call AI agent
     * 5. Save thread context
     * 6. Store AI response message
     */
    async initializeNewChat(
        message: string,
        userEmail?: string
    ): Promise<NewChatResult> {
        // 1. Create thread
        const threadId = await this.createThread(userEmail);
        const userId = userEmail || 'anonymous';

        // 2. Store initial user message
        await this.storeUserMessage(threadId, userId, message, 'markdown');

        // 3. Prepare AI agent input
        let userProfile: UserProfile | undefined;
        let members: MemberMeta[] = [];
        let existingContexts: ExistingContext[] = [];

        if (userEmail) {
            const userData = await this.getUserProfileAndMembers(userEmail);
            userProfile = userData.profile || undefined;
            members = userData.members;
            existingContexts = await this.getRecentContexts(userEmail);
        }

        // 4. Call AI agent
        const agentInput: ContextInitializationInput = {
            initial_message: message,
            user_profile: userProfile,
            members,
            existing_contexts: existingContexts,
        };

        const agentOutput = await this.callContextInitializationAgent(agentInput);

        // 5. Save thread context
        await this.saveThreadContext(threadId, agentOutput);

        // 6. Store AI response message
        const aiMessage = await this.storeAssistantMessage(
            threadId,
            agentOutput.response_message,
            'markdown',
            {
                followup_question: agentOutput.followup_question,
                reused_context_from: agentOutput.reused_context_from,
            }
        );

        return {
            threadId,
            userId,
            initialMessage: {
                id: aiMessage.id,
                content: agentOutput.response_message,
                type: 'markdown',
            },
        };
    }
}

export const chatService = new ChatService();
export default chatService;
