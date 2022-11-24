import * as React from 'react';
declare const HistoryContainer: React.FunctionComponent<{
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
  latestRev: number;
  link?: (rev: number) => React.ReactNode;
}>;
export default HistoryContainer;
