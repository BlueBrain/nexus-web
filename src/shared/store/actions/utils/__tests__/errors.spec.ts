import { RequestError, formatError } from '../errors';
import { HTTP_STATUSES, HTTP_STATUS_TYPE_KEYS } from '../statusCodes';

describe('RequestError', () => {
  it('creates an error with a default code property equal to a BadRequest', () => {
    expect(new RequestError('message')).toHaveProperty(
      'code',
      HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.BAD_REQUEST].code
    );
    expect(new RequestError('message')).toHaveProperty('message', 'message');
    expect(new RequestError('message')).toHaveProperty(
      'type',
      HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.BAD_REQUEST].type
    );
  });

  it('creates an error with the appropriate type and code', () => {
    const forbiddenError = new RequestError(
      'message',
      HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.FORBIDDEN].type
    );
    expect(forbiddenError).toHaveProperty(
      'code',
      HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.FORBIDDEN].code
    );
    expect(forbiddenError).toHaveProperty('message', 'message');
    expect(forbiddenError).toHaveProperty(
      'type',
      HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.FORBIDDEN].type
    );
  });
});

describe('formatError', () => {
  it('should take a common error response and format it into the correct RequestError', () => {
    const sdkError = new Error('Not Found');
    expect(formatError(sdkError)).toBeInstanceOf(RequestError);
    expect(formatError(sdkError)).toHaveProperty(
      'code',
      HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.NOT_FOUND].code
    );
    expect(formatError(sdkError)).toHaveProperty(
      'type',
      HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.NOT_FOUND].type
    );
  });

  it('should default to BAD_REQUEST error type if the error messages doesnt match anything', () => {
    const sdkError = new Error('I Am A Teapot');
    expect(formatError(sdkError)).toBeInstanceOf(RequestError);
    expect(formatError(sdkError)).toHaveProperty(
      'code',
      HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.BAD_REQUEST].code
    );
    expect(formatError(sdkError)).toHaveProperty(
      'type',
      HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.BAD_REQUEST].type
    );
  });
});
