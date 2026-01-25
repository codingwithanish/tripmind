// DAO Layer Exports
// Re-export all DAOs for easy importing

export { userDao, type SafeUser, type CreateUserInput, type UpdateUserInput } from './userDao';

export {
    memberDao,
    type CreateMemberInput,
    type UpdateMemberInput,
    type InterestProfile,
    type LocationDetails,
    type TravelProfile,
    type TravelInstructions,
} from './memberDao';

export {
    threadDao,
    type CreateThreadInput,
    type UpdateThreadInput,
    type VersionDetails,
    type ThreadWithContext,
    type ThreadWithMessages,
} from './threadDao';

export {
    threadContextDao,
    type CreateThreadContextInput,
    type UpdateThreadContextInput,
    type TravellerDetail,
} from './threadContextDao';

export {
    messageDao,
    type CreateMessageInput,
    type UpdateMessageInput,
    type DecodedMessage,
} from './messageDao';

export {
    timelineDao,
    type CreateTimelineInput,
    type UpdateTimelineInput,
    type CreateTimelineNodeInput,
    type CreateTimelineNodeElementInput,
    type DisplayIcon,
    type NodeSummary,
    type PriceRange,
    type TimelineWithNodes,
    type TimelineWithNodesAndElements,
} from './timelineDao';

export {
    notificationDao,
    type CreateNotificationInput,
    type UpdateNotificationInput,
} from './notificationDao';

export {
    suggestionTemplateDao,
    type CreateSuggestionTemplateInput,
    type UpdateSuggestionTemplateInput,
    type PlaceholderOptions,
} from './suggestionTemplateDao';
