export class Forbidden extends Error {
  readonly code: number = 403;
}
export class NotFound extends Error {
  readonly code: number = 404;
}
export class ServiceUnavailable extends Error {
  readonly code: number = 503;
}
export class BadRequest extends Error {
  readonly code: number = 400;
}

export type RequestErrors =
  | BadRequest
  | Forbidden
  | NotFound
  | ServiceUnavailable;

export const requestErrorTypes: { [errorName: string]: any } = {
  BadRequest,
  Forbidden,
  NotFound,
  ServiceUnavailable,
};

export const formatError = (error: Error) => {
  const errorType = error.message.replace(/ /g, '');
  if (requestErrorTypes[errorType]) {
    return new requestErrorTypes[errorType](error.message);
  }
  return new BadRequest(error.message);
};
