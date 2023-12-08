import { Tooltip } from 'antd';
import moment from 'moment';
import * as React from 'react';

import { getDateString, getFriendlyTimeAgoString } from '../../utils';

const FriendlyTimeAgo: React.FC<{
  date: Date | moment.Moment;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
}> = ({ date, getPopupContainer }) => {
  return (
    <Tooltip title={getDateString(date)} getPopupContainer={getPopupContainer}>
      {getFriendlyTimeAgoString(moment(date))}
    </Tooltip>
  );
};

export default FriendlyTimeAgo;
