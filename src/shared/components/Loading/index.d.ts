import * as React from 'react';
import './loading.less';
export declare enum SIZE {
  big = 'big',
  small = 'small',
}
declare const Loading: React.FC<{
  size?: string;
  loading?: boolean;
  loadingMessage?: React.ReactNode;
}>;
export default Loading;
