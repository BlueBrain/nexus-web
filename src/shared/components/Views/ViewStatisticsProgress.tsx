import * as React from 'react';
import { Progress, Tooltip } from 'antd';
import * as moment from 'moment';
import { Statistics, NexusClient } from '@bbp/nexus-sdk';
import { useNexus } from '@bbp/react-nexus';

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
      ? `last indexed: ${moment(props.lastIndexed)
          .startOf()
          .fromNow()}`
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
      { pollIntervalMs: 3000 }
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
