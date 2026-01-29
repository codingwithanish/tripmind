import env from '../config/env';

// Types matching the AI agent schemas
export interface UserVariable {
    field_name: string;
    value: string;
    type: 'mandatory' | 'optional';
}

export interface PlanSummary {
    travel_summary: string;
    user_variables: UserVariable[];
}

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface TravelPlanningRequest {
    conversationHistory: ConversationMessage[];
    currentPlanSummary: PlanSummary | null;
    latestUserMessage: string;
}

export interface TravelPlanningResponse {
    planUpdated: boolean;
    planSummary: PlanSummary;
    planReady: boolean;
    nextQuestion: string;
    responseMessage: string;
    isIrrelevantInput: boolean;
}

class TravelPlanningService {
    private readonly AI_SERVICE_URL = env.AI_SERVICE_URL;

    /**
     * Process a user message through the travel planning agent
     */
    async processMessage(request: TravelPlanningRequest): Promise<TravelPlanningResponse> {
        const response = await fetch(`${this.AI_SERVICE_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_name: 'travel_planning_agent',
                input_payload: {
                    conversation_history: request.conversationHistory.map(msg => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                    current_plan_summary: request.currentPlanSummary ? {
                        travel_summary: request.currentPlanSummary.travel_summary,
                        user_variables: request.currentPlanSummary.user_variables,
                    } : null,
                    latest_user_message: request.latestUserMessage,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`AI Service error: ${response.statusText}`);
        }

        const result = await response.json() as any;

        if (result.status === 'success' && result.output) {
            const output = result.output;
            return {
                planUpdated: output.plan_updated,
                planSummary: {
                    travel_summary: output.plan_summary.travel_summary,
                    user_variables: output.plan_summary.user_variables,
                },
                planReady: output.plan_ready,
                nextQuestion: output.next_question,
                responseMessage: output.response_message,
                isIrrelevantInput: output.is_irrelevant_input || false,
            };
        }

        // If agent failed, return a default error response
        throw new Error(result.reason || 'Unknown error from AI Service');
    }

    /**
     * Check if all mandatory fields are filled in a plan summary
     */
    isPlanComplete(planSummary: PlanSummary | null): boolean {
        if (!planSummary) return false;

        const mandatoryFields = planSummary.user_variables.filter(
            v => v.type === 'mandatory'
        );

        return mandatoryFields.every(
            v => v.value && v.value !== 'NOT_AVAILABLE'
        );
    }

    /**
     * Get the next unfilled mandatory field
     */
    getNextUnfilledField(planSummary: PlanSummary | null): UserVariable | null {
        if (!planSummary) return null;

        return planSummary.user_variables.find(
            v => v.type === 'mandatory' && (!v.value || v.value === 'NOT_AVAILABLE')
        ) || null;
    }
}

export const travelPlanningService = new TravelPlanningService();
export default travelPlanningService;
