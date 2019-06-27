import * as React from 'react';
import { Progress } from 'antd';

type ViewStatisticsProgressProps = {
  processedEvents: number;
  totalEvents: number;
  lastIndexed: string; // timestamp
};

const ViewStatisticsProgress: React.FunctionComponent<
  ViewStatisticsProgressProps
> = props => {
  const percent = Math.floor((props.processedEvents / props.totalEvents) * 100);
  const label =
    percent === 100 ? `last indexed: ${props.lastIndexed}` : 'indexing...';

  return (
    <>
      <Progress type="dashboard" percent={percent} />
      <p>{label}</p>
    </>
  );
};

export default ViewStatisticsProgress;
