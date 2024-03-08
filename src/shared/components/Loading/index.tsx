import * as React from 'react';

import './loading.scss';

const classPrefix = 'loading';

export enum SIZE {
  big = 'big',
  small = 'small',
}

const Loading: React.FC<{
  size?: string;
  loading?: boolean;
  loadingMessage?: React.ReactNode;
}> = ({ size = SIZE.small, loading = true, loadingMessage, children }) => {
  return (
    <div className={`${classPrefix} ${size} ${loading ? 'in-progress' : ''}`}>
      {loadingMessage && <div className="message">{loadingMessage}</div>}
      <div className="body">{children}</div>
    </div>
  );
};

export default Loading;
