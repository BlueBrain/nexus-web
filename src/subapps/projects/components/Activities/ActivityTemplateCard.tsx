import * as React from 'react';
import { Button } from 'antd';
import * as moment from 'moment';

import './ActivityTemplateCard.less';

const activityIcon = require('../../../../shared/images/settingIcon.svg');

export type ActivityTemplate = {
  name: string;
  description: string;
  version: number;
  updatedOn: string;
  totalContributors: number;
  author: string;
};

const ActivityTemplateCard: React.FC<{
  template: ActivityTemplate;
}> = ({ template }) => {
  const {
    name,
    description,
    version,
    updatedOn,
    totalContributors,
    author,
  } = template;

  const parsedTime = moment(updatedOn)
    .startOf('hour')
    .fromNow();

  return (
    <div className="activity-template-card">
      <div className="activity-template-card__header">
        <div className="activity-template-card__title">
          <img src={activityIcon} className="activity-template-card__icon" />
          <span>{name}</span>
        </div>

        <div className="activity-template-card__title-info">
          <span>
            Updated {parsedTime} by {author}
          </span>
          <span>v{version}</span>
        </div>
      </div>
      <div className="activity-template-card__content">
        <p className="activity-template-card__description">{description}</p>
        <p className="activity-template-card__contributors">
          {totalContributors} contributors
        </p>
        <div className="activity-template-card__details-button">
          <Button type="link">Details</Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityTemplateCard;
