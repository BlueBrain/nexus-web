import * as React from 'react';
import { Button } from 'antd';

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

  return (
    <div className="activity-template-card">
      <div className="activity-template-card__header">
        <img src={activityIcon} className="activity-template-card__icon" />
        <span className="activity-template-card__title">{name}</span>
        <p>
          Updated on {updatedOn} by {author}
        </p>
        <p>v{version}</p>
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
