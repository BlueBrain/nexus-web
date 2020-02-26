import * as React from 'react';
import { Progress, Tooltip, notification, Button } from 'antd';
import * as moment from 'moment';
import { Statistics, PaginatedList } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

type ViewStatisticsProgressProps = {
  processedEvents: number;
  totalEvents: number;
  lastIndexed: string; // UTC Date
};

export const ViewStatisticsProgress: React.FunctionComponent<ViewStatisticsProgressProps> = props => {
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
  onClickRefresh?: VoidFunction;
};

export const ViewStatisticsContainer: React.FunctionComponent<ViewStatisticsContainerProps> = props => {
  const nexus = useNexusContext();
  const [eventsAtMount, setEventsAtMount] = React.useState();
  const [{ loading, error, data }, setState] = React.useState<{
    error: Error | null;
    data: Statistics | null;
    loading: boolean;
  }>({
    error: null,
    data: null,
    loading: false,
  });

  const indexCompleteNotification = () => {
    const key = 'IndexComplete';
    const time = Date.now();
    const btn = props.onClickRefresh ? (
      <Button
        type="primary"
        size="small"
        onClick={() => {
          notification.close(key);
          props.onClickRefresh && props.onClickRefresh();
        }}
      >
        Refresh
      </Button>
    ) : (
      <Button
        type="primary"
        size="small"
        onClick={() => {
          notification.close(key);
        }}
      >
        Got it
      </Button>
    );
    notification.open({
      btn,
      key,
      message: 'This project has finished indexing new Resources ',
      description: (
        <div>
          Last updated{' '}
          <span className="flash" key={time}>
            {moment(time).format('h:mm:ss a')}
          </span>
        </div>
      ),
      duration: null, // don't auto-close
      onClose: close,
    });
  };

  React.useEffect(() => {
    if (data && eventsAtMount !== data.totalEvents) {
      indexCompleteNotification();
    }
  }, [eventsAtMount, data]);

  React.useEffect(() => {
    setState({
      loading: true,
      error: null,
      data: null,
    });
    const poll = nexus.View.pollStatistics(
      props.orgLabel,
      props.projectLabel,
      props.resourceId,
      { pollIntervalMs: 3000 }
    ).subscribe(
      (statistics: Statistics) => {
        if (!eventsAtMount) {
          setEventsAtMount(statistics.totalEvents);
        }
        setState({
          data: statistics,
          loading: false,
          error: null,
        });
      },
      (error: Error) => {
        setState({
          error,
          data: null,
          loading: false,
        });
      }
    );
    return () => {
      poll.unsubscribe();
    };
  }, [props.orgLabel, props.projectLabel, props.resourceId]);

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
