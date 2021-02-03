import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip, Dropdown, Button, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import SubStepItem from './SubStepItem';
import { StepResource } from '../../views/WorkflowStepView';
import { Status } from '../StatusIcon';

import './StepCard.less';

const settingIcon = require('../../../../shared/images/settingIcon.svg');

const MAX_TITLE_LENGTH = 57;
const MAX_DESCRIPTION_LENGTH = 100;

const StepCard: React.FC<{
  step: StepResource;
  projectLabel: string;
  orgLabel: string;
  substeps: StepResource[];
}> = ({ step, projectLabel, orgLabel, substeps }) => {
  const { name, description, status } = step;
  const stepId = step['@id'];

  console.log('Status', Object.keys(Status));

  const handleMenuClick = (option: any) => {
    console.log('data', option.key);

    //update status here
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {Object.values(Status).map(status => (
        <Menu.Item key={status}>
          <span className="step-card__status-item">{status}</span>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div
      className={`step-card step-card--${status && status.replace(' ', '-')}`}
    >
      <div
        className={`step-card__status step-card__status--${status &&
          status.replace(' ', '-')}`}
      >
        <Dropdown overlay={menu}>
          <Button type="text">
            <span className="step-card__status-button">{status}</span>
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <div className="step-card__main">
        <div className="step-card__title">
          <Link to={`/workflow/${orgLabel}/${projectLabel}/${stepId}`}>
            {name.length > MAX_TITLE_LENGTH ? (
              <Tooltip placement="topRight" title={name}>
                <h3 className="step-card__name">
                  {`${name.slice(0, MAX_TITLE_LENGTH)}...`}
                </h3>
              </Tooltip>
            ) : (
              <h3 className="step-card__name">{name}</h3>
            )}
          </Link>
        </div>
        <div className="step-card__info">
          {description && description.length > MAX_DESCRIPTION_LENGTH ? (
            <Tooltip placement="topRight" title={description}>
              <span>
                {`${description.slice(0, MAX_DESCRIPTION_LENGTH)}...`}
              </span>
            </Tooltip>
          ) : (
            <span>{description || '-'}</span>
          )}
        </div>
        <div className="step-card__subactivities">
          <div className="step-card__substeps-total">
            <img src={settingIcon} className="step-card__info-icon" />
            <span>
              {(substeps && substeps.length) || 'No'}{' '}
              {substeps && substeps.length === 1 ? 'sub-step' : 'sub-steps'}
            </span>
          </div>
          <div className="step-card__list-container">
            {substeps &&
              substeps.length > 0 &&
              substeps.map(substep => (
                <SubStepItem
                  substep={substep}
                  key={substep['@id']}
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepCard;
