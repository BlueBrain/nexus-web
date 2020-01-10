import * as React from 'react';
import { Progress, Tooltip } from 'antd';
import * as moment from 'moment';
import { Statistics, PaginatedList } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

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
  const nexus = useNexusContext();
  const [{ loading, error, data }, setState] = React.useState<{
    error: Error | null;
    data: Statistics | null;
    loading: boolean;
  }>({
    error: null,
    data: null,
    loading: false,
  });

  React.useEffect(() => {
    setState({
      loading: true,
      error: null,
      data: null,
    });
    nexus.View.pollStatistics(
      props.orgLabel,
      props.projectLabel,
      props.resourceId,
      { pollIntervalMs: 3000 }
    ).subscribe(
      ({ _results }) => {
        setState({
          data: _results[0],
          loading: false,
          error: null,
        });
      },
      error => {
        setState({
          error,
          data: null,
          loading: false,
        });
      }
    );
  }, [props.resourceId]);

  if (!loading && !error && data) {
    return (
      <ViewStatisticsProgress
        totalEvents={data.totalEvents}
        processedEvents={data.processedEvents}
        lastIndexed={data.lastProcessedEventDateTime}
      />
    );
  }
  return null;
};

export default ViewStatisticsContainer;
