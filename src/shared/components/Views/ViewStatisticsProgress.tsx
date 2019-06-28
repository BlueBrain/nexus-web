import * as React from 'react';
import { Progress, Tooltip } from 'antd';
import { howLongAgo, displayTimeFromDate } from '../../utils';
import { Statistics, NexusClient } from '@bbp/nexus-sdk';
import { useNexus } from '@bbp/react-nexus';

function getLastUpdatedLabel(lastIndexed: string): string {
  const daysSinceUpdate = howLongAgo(lastIndexed);
  switch (daysSinceUpdate) {
    case 0:
      return `today at ${displayTimeFromDate(lastIndexed)}`;
    case 1:
      return `${daysSinceUpdate} day ago`;
    default:
      return `${daysSinceUpdate} days ago`;
  }
}

type ViewStatisticsProgressProps = {
  processedEvents: number;
  totalEvents: number;
  lastIndexed: string; // UTC Date
};

export const ViewStatisticsProgress: React.FunctionComponent<
  ViewStatisticsProgressProps
> = props => {
  const percent = Math.floor((props.processedEvents / props.totalEvents) * 100);
  const label =
    percent === 100
      ? `last indexed: ${getLastUpdatedLabel(props.lastIndexed)}`
      : 'indexing...';

  return (
    <Tooltip title={label}>
      <Progress type="circle" width={25} percent={percent} />
    </Tooltip>
  );
};

export type ViewStatisticsContainerProps = {
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
};

export const ViewStatisticsContainer: React.FunctionComponent<
  ViewStatisticsContainerProps
> = props => {
  const state = useNexus<Statistics>((nexus: NexusClient) =>
    nexus.View.pollStatistics(
      props.orgLabel,
      props.projectLabel,
      props.resourceId,
      { pollTime: 3000 }
    )
  );

  if (!state.loading && !state.error) {
    return (
      <ViewStatisticsProgress
        totalEvents={state.data.totalEvents}
        processedEvents={state.data.processedEvents}
        lastIndexed={state.data.lastProcessedEventDateTime}
      />
    );
  }
  return null;
};

export default ViewStatisticsContainer;
