import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

import StatusIcon from '../../components/StatusIcon';
import SubActivityItem from './SubActivityItem';
import { ActivityResource } from '../../views/ActivityView';

import './ActivityCard.less';

const editIcon = require('../../../../shared/images/pencil.svg');
const codeIcon = require('../../../../shared/images/codeIcon.svg');
const dataIcon = require('../../../../shared/images/dataIcon.svg');
const noteIcon = require('../../../../shared/images/noteIcon.svg');
const settingIcon = require('../../../../shared/images/settingIcon.svg');

const MAX_TITLE_LENGTH = 45;

const ActivityCard: React.FC<{
  activity: ActivityResource;
  projectLabel: string;
  orgLabel: string;
  subactivities: ActivityResource[];
}> = ({ activity, projectLabel, orgLabel, subactivities }) => {
  const { name, description, status } = activity;
  const activityId = activity['@id'];

  return (
    <div className={`activity-card activity-card--${status.replace(' ', '-')}`}>
      <div className="activity-card__main">
        <div className="activity-card__title">
          <StatusIcon status={status} mini={true} />
          <Link to={`/projects/${orgLabel}/${projectLabel}/${activityId}`}>
            {name.length > MAX_TITLE_LENGTH ? (
              <Tooltip placement="topRight" title={name}>
                <h3 className="activity-card__name">
                  {`${name.slice(0, MAX_TITLE_LENGTH)}...`}
                </h3>
              </Tooltip>
            ) : (
              <h3 className="activity-card__name">{name}</h3>
            )}
          </Link>
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
      <div className="activity-card__subactivities">
        <div className="activity-card__subactivities-total">
          <img src={settingIcon} className="activity-card__info-icon" />
          <span>
            Activities: {(subactivities && subactivities.length) || 0}
          </span>
        </div>
        <div className="activity-card__list-container">
          {subactivities &&
            subactivities.length > 0 &&
            subactivities.map(subactivity => (
              <SubActivityItem
                subactivity={subactivity}
                key={subactivity['@id']}
                orgLabel={orgLabel}
                projectLabel={projectLabel}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
