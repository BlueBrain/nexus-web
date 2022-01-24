import { Tooltip } from 'antd';
import * as React from 'react';
import * as moment from 'moment';
import { getDateString, getFriendlyTimeAgoString } from '../../utils';

const FriendlyTimeAgo: React.FC<{ date: Date | moment.Moment }> = ({
  date,
}) => {
  return (
    <Tooltip title={getDateString(date)}>
      {getFriendlyTimeAgoString(moment(date))}
    </Tooltip>
  );
};

export default FriendlyTimeAgo;
