import * as React from 'react';

import StatusIcon, { Status } from '../StatusIcon';

import './SubActivityItem.less';

const SubActivityItem: React.FC<{
  title: string;
  activitiesNumber?: number;
  status: Status;
}> = ({ title, activitiesNumber, status }) => {
  return (
    <div className="sub-activity">
      <StatusIcon status={status} mini={true} />
      <div className="sub-activity__content">
        <h3 className="sub-activity__title">{title}</h3>
        {/* <p className="sub-activity__total">
          {activitiesNumber || 0} activities
        </p> */}
      </div>
    </div>
  );
};

export default SubActivityItem;
