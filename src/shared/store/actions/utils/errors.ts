import { HTTP_STATUS_TYPE_KEYS, HTTP_STATUSES } from './statusCodes';

export class RequestError extends Error {
  readonly message: string;
  readonly type: string;
  readonly code: number;
  constructor(message: string, type: string = HTTP_STATUS_TYPE_KEYS.BAD_REQUEST) {
    super(message);
    this.message = message;
    this.type = type;
    this.code = HTTP_STATUSES[type].code;
  }
}
