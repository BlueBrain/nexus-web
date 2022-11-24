export declare class RequestError extends Error {
  readonly message: string;
  readonly type: string;
  readonly code: number;
  constructor(message: string, type?: string);
}
