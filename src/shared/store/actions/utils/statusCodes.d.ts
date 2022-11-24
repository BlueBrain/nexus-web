export declare enum HTTP_STATUS_TYPE_KEYS {
  OK = 'OK',
  BAD_REQUEST = 'BAD_REQUEST',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
export declare const HTTP_STATUSES: {
  [key: string]: {
    type: string;
    code: number;
  };
};
