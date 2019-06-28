import * as React from 'react';
import { Progress } from 'antd';
import { howLongAgo } from '../../utils';

function getLastUpdatedLabel(lastIndexed: string): string {
  const daysSinceUpdate = howLongAgo(lastIndexed);
  return daysSinceUpdate === 1 ? 'Today' : `${daysSinceUpdate} days ago`;
}

type ViewStatisticsProgressProps = {
  processedEvents: number;
  totalEvents: number;
  lastIndexed: string; // UTC Date
};

const ViewStatisticsProgress: React.FunctionComponent<
  ViewStatisticsProgressProps
> = props => {
  const percent = Math.floor((props.processedEvents / props.totalEvents) * 100);
  const label =
    percent === 100
      ? `last indexed: ${getLastUpdatedLabel(props.lastIndexed)}`
      : 'indexing...';

  return (
    <>
      <Progress type="dashboard" percent={percent} />
      <p>{label}</p>
    </>
  );
};

const ViewStatisticsProgressBar: React.FunctionComponent<
  ViewStatisticsProgressProps
> = props => {
  const percent = Math.floor((props.processedEvents / props.totalEvents) * 100);

  return (
    <>
      <Progress type="line" percent={percent} />
    </>
  );
};

export { ViewStatisticsProgress, ViewStatisticsProgressBar };
