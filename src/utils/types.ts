type TError = {
  message: string;
  reason: any;
};

type TErrorWithType = Error & {
  message: string;
  reason: any;
  '@type': any;
};

interface TUpdateResourceFunctionError extends TErrorWithType {
  action?: 'update' | 'view';
  rejections?: { reason: string }[];
  wasUpdated?: boolean;
}

export { TError, TErrorWithType, TUpdateResourceFunctionError };
