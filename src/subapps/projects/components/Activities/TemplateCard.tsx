import * as React from 'react';
import { Button } from 'antd';
import * as moment from 'moment';

import './TemplateCard.less';

const activityIcon = require('../../../../shared/images/settingIcon.svg');

export type Template = {
  name: string;
  description: string;
  version: number;
  updatedOn: string;
  totalContributors: number;
  author: string;
};

const TemplateCard: React.FC<{
  template: Template;
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
    <div className="template-card">
      <div className="template-card__header">
        <div className="template-card__title">
          <img src={activityIcon} className="template-card__icon" />
          <span>{name}</span>
        </div>

        <div className="template-card__title-info">
          <span>
            Updated {parsedTime} by {author}
          </span>
          <span>v{version}</span>
        </div>
      </div>
      <div className="template-card__content">
        <p className="template-card__description">{description}</p>
        <p className="template-card__contributors">
          {totalContributors} contributors
        </p>
        <div className="template-card__details-button">
          <Button type="link">Details</Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
