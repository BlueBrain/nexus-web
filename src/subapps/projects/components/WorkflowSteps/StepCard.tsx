import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

import StatusIcon from '../StatusIcon';
import SubStepItem from './SubStepItem';
import { StepResource } from '../../views/WorkflowStepView';

import './StepCard.less';

const editIcon = require('../../../../shared/images/pencil.svg');
const codeIcon = require('../../../../shared/images/codeIcon.svg');
const dataIcon = require('../../../../shared/images/dataIcon.svg');
const noteIcon = require('../../../../shared/images/noteIcon.svg');
const settingIcon = require('../../../../shared/images/settingIcon.svg');

const MAX_TITLE_LENGTH = 45;

const StepCard: React.FC<{
  step: StepResource;
  projectLabel: string;
  orgLabel: string;
  substeps: StepResource[];
}> = ({ step, projectLabel, orgLabel, substeps }) => {
  const { name, description, status } = step;
  const stepId = step['@id'];

  React.useEffect(() => {
    if (step.wasInformedBy) {
      console.log('step', step.wasInformedBy && step.wasInformedBy['@id']);

      const line = document.getElementById(`was-informed-link-${stepId}`);
      const div1 = document.getElementById(`card-${stepId}`);
      const div2 = document.getElementById(`card-${step.wasInformedBy['@id']}`);

      if (div1 && div2) {
        const x1 = div1.offsetLeft + div1.getBoundingClientRect().width / 2;
        const y1 = div1.offsetTop + div1.getBoundingClientRect().height / 2;
        const x2 = div2.offsetLeft + div2.getBoundingClientRect().width / 2;
        const y2 = div2.offsetTop + div2.getBoundingClientRect().height / 2;

        console.log(x1, x2, y1, y2);

        if (line) {
          line.setAttribute('x1', x1.toString());
          line.setAttribute('y1', y1.toString());
          line.setAttribute('x2', x2.toString());
          line.setAttribute('y2', y2.toString());
        }
      }
    }
  }, []);

  return (
    <>
      <div
        id={`card-${stepId}`}
        className={`step-card step-card--${status && status.replace(' ', '-')}`}
      >
        <div className="step-card__main">
          <div className="step-card__title">
            {status && <StatusIcon status={status} mini={true} />}
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
            <img src={editIcon} />
          </div>
          <div className="step-card__info">
            <div className="step-card__info-line">
              <img src={codeIcon} className="step-card__info-icon" />
              <span>Code resources: 0</span>
            </div>
            <div className="step-card__info-line">
              <img src={dataIcon} className="step-card__info-icon" />
              <span>Data resources: 0</span>
            </div>
            <div className="step-card__info-line">
              <img src={noteIcon} className="step-card__info-icon" />
              <span>{description || '-'}</span>
            </div>
          </div>
        </div>
        <div className="step-card__subactivities">
          <div className="step-card__substeps-total">
            <img src={settingIcon} className="step-card__info-icon" />
            <span>Workflow steps: {(substeps && substeps.length) || 0}</span>
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
      {step.wasInformedBy && (
        <svg id="svg">
          <line className="link-line" id={`was-informed-link-${stepId}`} />
        </svg>
      )}
    </>
  );
};

export default StepCard;
