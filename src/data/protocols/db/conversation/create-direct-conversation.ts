import { Conversation } from '@domain/models/conversation/conversation';
import { ICreateConversation } from '@domain/models/conversation/create-conversation';

export interface CreateDirectConversationRepository {
  create (userId: string, conversationData: ICreateConversation): Promise<Conversation>
}
