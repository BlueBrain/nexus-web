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
  { title: 'ME-Models', activitiesNumber: 2, status: Status.blocked },
  { title: 'E-Models', activitiesNumber: 4, status: Status.blocked },
];

const ActivityCard: React.FC<{
  name: string;
  codeResourcesTotal?: number;
  dataResourcesTotal?: number;
  description?: string;
}> = ({ name, codeResourcesTotal, dataResourcesTotal, description }) => {
  return (
    <div className="activity-card">
      <div className="activity-card__main">
        <div className="activity-card__title">
          <StatusIcon status={Status.blocked} mini={true} />
          <h3 className="activity-card__name">{name}</h3>
          <img src={editIcon} />
        </div>
        <div className="activity-card__info">
          {codeResourcesTotal && (
            <p>
              <img src={codeIcon} />
              <span className="activity-card__info-line">
                {codeResourcesTotal} code resources
              </span>
            </p>
          )}
          <p>
            <img src={dataIcon} />
            <span className="activity-card__info-line">
              {dataResourcesTotal || 0} data resources
            </span>
          </p>
          <p>
            <img src={noteIcon} />
            <span className="activity-card__info-line">
              {description || '-'}
            </span>
          </p>
        </div>
      </div>
      {subActivities && (
        <div className="activity-card__subactivities">
          <p className="activity-card__subactivities-total">
            <img src={settingIcon} />
            <span className="activity-card__info-line">
              {subActivities.length} activities
            </span>
          </p>
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
