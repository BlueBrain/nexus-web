import * as React from 'react';
import StatusIcon, { Status } from '../components/StatusIcon';
import SubActivityItem from './SubActivityItem';

import './ActivityCard.less';

const editIcon = require('../../../shared/images/pencil.svg');
const codeIcon = require('../../../shared/images/codeIcon.svg');
const dataIcon = require('../../../shared/images/dataIcon.svg');
const noteIcon = require('../../../shared/images/noteIcon.svg');
const settingIcon = require('../../../shared/images/settingIcon.svg');

const subActivities = [
  { title: 'Morphology Release', activitiesNumber: 7, status: Status.blocked },
  { title: 'ME-Models', activitiesNumber: 2, status: Status.done },
  { title: 'E-Models', activitiesNumber: 4, status: Status.inProgress },
];

const ActivityCard: React.FC<{
  status: Status;
  name: string;
  codeResourcesTotal?: number;
  dataResourcesTotal?: number;
  description?: string;
}> = ({
  name,
  codeResourcesTotal,
  dataResourcesTotal,
  description,
  status,
}) => {
  return (
    <div className={`activity-card activity-card--${status}`}>
      <div className="activity-card__main">
        <div className="activity-card__title">
          <StatusIcon status={status} mini={true} />
          <h3 className="activity-card__name">{name}</h3>
          <img src={editIcon} />
        </div>
        <div className="activity-card__info">
          {codeResourcesTotal && (
            <div className="activity-card__info-line">
              <img src={codeIcon} className="activity-card__info-icon" />
              <span>{codeResourcesTotal} code resources</span>
            </div>
          )}
          <div className="activity-card__info-line">
            <img src={dataIcon} className="activity-card__info-icon" />
            <span>{dataResourcesTotal || 0} data resources</span>
          </div>
          <div className="activity-card__info-line">
            <img src={noteIcon} className="activity-card__info-icon" />
            <span>{description || '-'}</span>
          </div>
        </div>
      </div>
      {subActivities && (
        <div className="activity-card__subactivities">
          <div className="activity-card__subactivities-total">
            <img src={settingIcon} className="activity-card__info-icon" />
            <span>{subActivities.length} activities</span>
          </div>
          {subActivities.map(subActivity => (
            <SubActivityItem
              status={subActivity.status}
              title={subActivity.title}
              activitiesNumber={subActivity.activitiesNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
