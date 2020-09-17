import * as React from 'react';
import StatusIcon, { Status } from '../../components/StatusIcon';
import SubActivityItem from './SubActivityItem';

import './ActivityCard.less';

const editIcon = require('../../../../shared/images/pencil.svg');
const codeIcon = require('../../../../shared/images/codeIcon.svg');
const dataIcon = require('../../../../shared/images/dataIcon.svg');
const noteIcon = require('../../../../shared/images/noteIcon.svg');
const settingIcon = require('../../../../shared/images/settingIcon.svg');

export type Activity = {
  '@id': string;
  status: Status;
  name: string;
  description?: string;
  parent?: {
    '@id': string;
  };
  subactivities: Activity[];
};

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const { name, description, status, subactivities } = activity;

  return (
    <div className={`activity-card activity-card--${status.replace(' ', '-')}`}>
      <div className="activity-card__main">
        <div className="activity-card__title">
          <StatusIcon status={status} mini={true} />
          <h3 className="activity-card__name">{name}</h3>
          <img src={editIcon} />
        </div>
        <div className="activity-card__info">
          <div className="activity-card__info-line">
            <img src={codeIcon} className="activity-card__info-icon" />
            <span>Code resources: 0</span>
          </div>
          <div className="activity-card__info-line">
            <img src={dataIcon} className="activity-card__info-icon" />
            <span>Data resources: 0</span>
          </div>
          <div className="activity-card__info-line">
            <img src={noteIcon} className="activity-card__info-icon" />
            <span>{description || '-'}</span>
          </div>
        </div>
      </div>
      {subactivities && subactivities.length > 0 && (
        <div className="activity-card__subactivities">
          <div className="activity-card__subactivities-total">
            <img src={settingIcon} className="activity-card__info-icon" />
            <span>Activities: {subactivities.length}</span>
          </div>
          {subactivities.map(subactivitiy => (
            <SubActivityItem
              status={subactivitiy.status}
              title={subactivitiy.name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
