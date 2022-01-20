import { Tooltip } from 'antd';
import * as React from 'react';
import * as moment from 'moment';
import { getFriendlyTimeAgoString } from '../../utils';

const FriendlyTimeAgo: React.FC<{ date: Date | moment.Moment }> = ({
  date,
}) => {
  return (
    <Tooltip title={moment(date).format()}>
      {getFriendlyTimeAgoString(moment(date))}
    </Tooltip>
  );
};

export default FriendlyTimeAgo;
