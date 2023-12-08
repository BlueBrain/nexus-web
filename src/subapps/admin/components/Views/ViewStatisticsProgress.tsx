import { ReloadOutlined } from '@ant-design/icons';
import { Statistics } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { Button,Progress, Tooltip } from 'antd';
import moment from 'moment';
import * as React from 'react';

import FriendlyTimeAgo from '../../../../shared/components/FriendlyDate';

type ViewStatisticsProgressProps = {
  processedEvents: number;
  totalEvents: number;
  lastIndexed: string; // UTC Date
  hasNewlyIndexedResources: boolean;
  onClickRefresh?: VoidFunction;
};

export const ViewStatisticsProgress: React.FunctionComponent<ViewStatisticsProgressProps> = props => {
  const percent = Math.floor((props.processedEvents / props.totalEvents) * 100);
  const label =
    percent === 100 ? (
      <>
        last indexed: <FriendlyTimeAgo date={moment(props.lastIndexed)} />
      </>
    ) : (
      <>indexing...</>
    );

  return (
    <>
      {props.hasNewlyIndexedResources ? (
        <Button
          type="link"
          onClick={() => props.onClickRefresh && props.onClickRefresh()}
          icon={<ReloadOutlined spin={true} />}
        >
          Resources indexed. Click to reload
        </Button>
      ) : (
        <Tooltip title={label}>
          <Progress type="circle" size={25} percent={percent} />
        </Tooltip>
      )}
    </>
  );
};

export type ViewStatisticsContainerProps = {
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
  onClickRefresh?: VoidFunction;
  statisticsOnMount?: Statistics;
  paused?: boolean;
};

export const ViewStatisticsContainer: React.FunctionComponent<ViewStatisticsContainerProps> = props => {
  const nexus = useNexusContext();
  const [eventsAtMount, setEventsAtMount] = React.useState<number>();
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
    if (props.statisticsOnMount) {
      setEventsAtMount(props.statisticsOnMount.totalEvents);
      setState({
        error: null,
        data: props.statisticsOnMount,
        loading: false,
      });
      setHasNewlyIndexedResources(false);
    }
  }, [props.statisticsOnMount]);

  const onRefreshResources = () => {
    setHasNewlyIndexedResources(false);
    props.onClickRefresh && props.onClickRefresh();
  };

  const [
    hasNewlyIndexedResources,
    setHasNewlyIndexedResources,
  ] = React.useState(false);

  const indexCompleteNotification = () => {
    setHasNewlyIndexedResources(true);
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
    if (props.paused) return;

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
  }, [props.orgLabel, props.projectLabel, props.resourceId, props.paused]);

  if (!loading && !error && data && !props.paused) {
    return (
      <ViewStatisticsProgress
        totalEvents={data.totalEvents}
        processedEvents={data.processedEvents}
        lastIndexed={data.lastProcessedEventDateTime}
        hasNewlyIndexedResources={hasNewlyIndexedResources}
        onClickRefresh={onRefreshResources}
      />
    );
  }
  return null;
};

export default ViewStatisticsContainer;
