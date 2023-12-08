import { RequestError } from '../errors';
import { HTTP_STATUS_TYPE_KEYS, HTTP_STATUSES } from '../statusCodes';

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
