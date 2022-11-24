import * as React from 'react';
import { Statistics } from '@bbp/nexus-sdk';
declare type ViewStatisticsProgressProps = {
  processedEvents: number;
  totalEvents: number;
  lastIndexed: string;
  hasNewlyIndexedResources: boolean;
  onClickRefresh?: VoidFunction;
};
export declare const ViewStatisticsProgress: React.FunctionComponent<ViewStatisticsProgressProps>;
export declare type ViewStatisticsContainerProps = {
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
  onClickRefresh?: VoidFunction;
  statisticsOnMount?: Statistics;
  paused?: boolean;
};
export declare const ViewStatisticsContainer: React.FunctionComponent<ViewStatisticsContainerProps>;
export default ViewStatisticsContainer;
