import * as React from 'react';
import './History.less';
declare const HistoryComponent: React.FunctionComponent<{
  revisions: {
    changes: object;
    hasChanges: boolean;
    userName: string;
    updatedAt: string;
    createdAt: string;
  }[];
  link?: (rev: number) => React.ReactNode;
}>;
export default HistoryComponent;
