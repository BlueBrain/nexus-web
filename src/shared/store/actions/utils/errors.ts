import { HTTP_STATUS_TYPE_KEYS, HTTP_STATUSES } from './statusCodes';

export class RequestError extends Error {
  readonly message: string;
  readonly type: string;
  readonly code: number;
  constructor(
    message: string,
    type: string = HTTP_STATUS_TYPE_KEYS.BAD_REQUEST
  ) {
    super(message);
    this.message = message;
    this.type = type;
    this.code = HTTP_STATUSES[type].code;
  }
}

export const formatError = (error: Error) => {
  const errorType = error.message.replace(/ /g, '_').toUpperCase();
  const httpErrorType = HTTP_STATUSES[errorType];
  if (httpErrorType) {
    return new RequestError(error.message, httpErrorType.type);
  }
  return new RequestError(error.message);
};
