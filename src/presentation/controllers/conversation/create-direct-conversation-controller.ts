import { CreateDirectConversation } from '@domain/usecases/conversation/create-direct-conversation';
import { badRequest, created } from '@presentation/helpers/http/http-helper';
import { Controller, HttpRequest, HttpResponse } from '@presentation/protocols';
import { CreateConversationValidator } from '@validation/validators/conversation/create-conversation-validation';
import { handleError } from 'src/utils/error-handler';
import { ValidationErrorAdapter } from 'src/utils/zod-error-adapter';

export class CreateDirectConversationController implements Controller {
  constructor (
    private readonly createDirectConversation: CreateDirectConversation,
    private readonly validation: CreateConversationValidator,
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body);
      if (error && !error.success && error.error.issues) {
        return badRequest(ValidationErrorAdapter.convert(error.error.issues));
      }

      const body = httpRequest.body;
      const { accountId } = httpRequest;

      const account = await this.createDirectConversation.create(accountId!, body);

      return created(account);
    } catch (error) {
      return handleError(error as Error);
    }
  }
}
