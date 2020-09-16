import * as React from 'react';
import { Button } from 'antd';
import * as moment from 'moment';

import { getUsername } from '../../../../shared/utils';

import './TemplateCard.less';

const activityIcon = require('../../../../shared/images/settingIcon.svg');

export type Template = {
  name: string;
  description: string;
  _rev: number;
  _updatedAt: string;
  _updatedBy: string;
  [key: string]: any;
};

const TemplateCard: React.FC<{
  template: Template;
}> = ({ template }) => {
  const { name, description, _rev, _updatedAt, _updatedBy } = template;

  const parsedTime = moment(_updatedAt)
    .startOf('hour')
    .fromNow();

  const onClickDetails = () => {
    console.log('clicked Details');
  };

  return (
    <div className="template-card">
      <div className="template-card__header">
        <div className="template-card__title">
          <img src={activityIcon} className="template-card__icon" />
          <span>{name}</span>
        </div>
        <div className="template-card__title-info">
          <span>
            Updated {parsedTime} by {getUsername(_updatedBy)}
          </span>
          <span>v{_rev}</span>
        </div>
      </div>
      <div className="template-card__content">
        <p className="template-card__description">{description}</p>
        <div className="template-card__details-button">
          <Button type="link" onClick={onClickDetails}>
            Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
