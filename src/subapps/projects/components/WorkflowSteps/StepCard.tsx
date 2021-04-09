import * as React from 'react';
import Draggable from 'react-draggable';
import { Link } from 'react-router-dom';
import { Tooltip, Dropdown, Button, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { StepResource } from '../../views/WorkflowStepView';
import { Status } from '../StatusIcon';
import MarkdownViewerContainer from '../../../../shared/containers/MarkdownViewer';
import SubStepItem from './SubStepItem';

import './StepCard.less';

const settingIcon = require('../../../../shared/images/settingIcon.svg');

const MAX_TITLE_LENGTH = 57;
const MAX_DESCRIPTION_LENGTH = 100;

const StepCard: React.FC<{
  step: StepResource;
  projectLabel: string;
  orgLabel: string;
  substeps: StepResource[];
  onStatusChange: (stepId: string, status: string) => void;
  onPostionChange: (
    stepId: string,
    data: {
      [key: string]: any;
    }
  ) => void;
  onClickAddCard: (previousStepId: string) => void;
}> = ({
  step,
  projectLabel,
  orgLabel,
  substeps,
  onStatusChange,
  onPostionChange,
  onClickAddCard,
}) => {
  const [stepStatus, setStepStatus] = React.useState<string>(step.status);
  const { name, description } = step;
  const stepId = step['@id'];

  React.useEffect(() => {
    console.log('rendering');

    if (step.wasInformedBy) {
      if (Array.isArray(step.wasInformedBy)) {
        step.wasInformedBy.forEach(card => placeLines(card['@id']));
      } else {
        placeLines(step.wasInformedBy['@id']);
      }
    }
  }, [step]);

  const placeLines = (cardId: string) => {
    const line = document.getElementById(`link-${stepId}-to-${cardId}`);
    const div1 = document.getElementById(`card-${stepId}`);
    const div2 = document.getElementById(`card-${cardId}`);

    const transform1 = div1?.style.transform;
    const transform2 = div2?.style.transform;

    const matrix1 = new DOMMatrix(transform1);
    const matrix2 = new DOMMatrix(transform2);

    const translateX1 = matrix1.m41;
    const translateY1 = matrix1.m42;

    const translateX2 = matrix2.m41;
    const translateY2 = matrix2.m42;

    if (div1 && div2) {
      const x1 =
        div1.offsetLeft + translateX1 + div1.getBoundingClientRect().width / 2;
      const y1 =
        div1.offsetTop + translateY1 + div1.getBoundingClientRect().height / 2;
      const x2 =
        div2.offsetLeft + translateX2 + div2.getBoundingClientRect().width / 2;
      const y2 =
        div2.offsetTop + translateY2 + div2.getBoundingClientRect().height / 2;

      if (line) {
        line.setAttribute(
          'points',
          `${x2},${y2} ${(x1 + x2) / 2},${(y1 + y2) / 2} ${x1},${y1}`
        );
      }
    }
  };

  const handleMenuClick = (option: any) => {
    setStepStatus(option.key);
    onStatusChange(stepId, option.key);
  };

  const updateLines = (linkTostepId: string, data: any) => {
    const incomingLine = document.getElementById(
      `link-${stepId}-to-${linkTostepId}`
    );
    const div1 = document.getElementById(`card-${stepId}`);
    const div2 = document.getElementById(`card-${linkTostepId}`);

    const matrix2 = new DOMMatrix(div2?.style.transform);

    if (incomingLine && div1 && div2) {
      const x1 =
        div1.offsetLeft + div1.getBoundingClientRect().width / 2 + data.x;
      const y1 =
        div1.offsetTop + div1.getBoundingClientRect().height / 2 + data.y;

      const x2 =
        div2.offsetLeft + matrix2.m41 + div2.getBoundingClientRect().width / 2;
      const y2 =
        div2.offsetTop + matrix2.m42 + div2.getBoundingClientRect().height / 2;

      incomingLine.setAttribute(
        'points',
        `${x2},${y2} ${(x1 + x2) / 2}, ${(y1 + y2) / 2} ${x1},${y1}`
      );
    }
  };

  const handleDrag = (event: any, data: any) => {
    if (step.wasInformedBy) {
      if (Array.isArray(step.wasInformedBy)) {
        step.wasInformedBy.forEach(card => {
          updateLines(card['@id'], data);
        });
      } else {
        updateLines(step.wasInformedBy['@id'], data);
      }
    }

    const selector = `[id$=-to-${stepId}]`;
    const outgoingLines = document.querySelectorAll(selector);
    const div1 = document.getElementById(`card-${stepId}`);

    if (outgoingLines.length > 0 && div1) {
      outgoingLines.forEach(line => {
        const points = line.getAttribute('points');
        console.log('points', points);

        const [start, middle, end] = points?.split(' ') as string[];
        console.log('end', end);

        const x1 =
          div1.offsetLeft + div1.getBoundingClientRect().width / 2 + data.x;
        const y1 =
          div1.offsetTop + div1.getBoundingClientRect().height / 2 + data.y;
        const [x2, y2] = end.split(',');

        line.setAttribute(
          'points',
          `${x1},${y1} ${(parseInt(x2, 10) + x1) / 2},${(parseInt(y2, 10) +
            y1) /
            2} ${x2},${y2}`
        );
      });
    }
  };

  const handleStop = (event: any, data: any) => {
    const { x, y } = data;

    if (step.positionX === x && step.positionY === y) return;

    onPostionChange(stepId, {
      positionX: x,
      positionY: y,
    });
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
    <>
      <Draggable
        bounds="parent"
        onDrag={handleDrag}
        onStop={handleStop}
        defaultPosition={
          step.positionX && step.positionY
            ? { x: step.positionX, y: step.positionY }
            : undefined
        }
      >
        <div
          id={`card-${stepId}`}
          className={`step-card step-card--${status &&
            status.replace(' ', '-')}`}
        >
          <div
            className={`step-card__status step-card__status--${stepStatus &&
              stepStatus.replace(' ', '-')}`}
          >
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type="text">
                <span className="step-card__status-button">{stepStatus}</span>
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>
          <div className="step-card__main">
            <div className="step-card__main-body">
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
                <Tooltip placement="topRight" title={description}>
                  <MarkdownViewerContainer
                    template={
                      step.description
                        ? step.description.slice(0, MAX_DESCRIPTION_LENGTH)
                        : ''
                    }
                    data={step}
                  />
                </Tooltip>
              </div>
              {substeps && substeps.length > 0 && (
                <div className="step-card__subactivities">
                  <div className="step-card__substeps-total">
                    <img src={settingIcon} className="step-card__info-icon" />
                    <span>
                      {substeps && substeps.length}{' '}
                      {substeps && substeps.length === 1
                        ? 'sub-step'
                        : 'sub-steps'}
                    </span>
                  </div>
                  <div className="step-card__list-container">
                    {substeps.map(substep => (
                      <SubStepItem
                        substep={substep}
                        key={substep['@id']}
                        orgLabel={orgLabel}
                        projectLabel={projectLabel}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="step-card__add-button-container">
              <button
                className="step-card__add-button"
                onClick={() => onClickAddCard(stepId)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Draggable>
      {step.wasInformedBy && Array.isArray(step.wasInformedBy) ? (
        step.wasInformedBy.map(step => (
          <svg id="svg" key={`link-${stepId}-to-${step['@id']}`}>
            <marker
              id="black-arrow"
              viewBox="0 0 10 10"
              refX="0"
              refY="5"
              orient="auto"
              fill="#676c72"
              markerWidth="6"
              markerHeight="6"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <polyline
              markerMid="url(#black-arrow)"
              className="link-line"
              id={`link-${stepId}-to-${step['@id']}`}
            />
          </svg>
        ))
      ) : (
        <svg id="svg">
          <marker
            id="black-arrow"
            viewBox="0 0 10 10"
            refX="0"
            refY="5"
            orient="auto"
            fill="#676c72"
            markerWidth="6"
            markerHeight="6"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
          <polyline
            markerMid="url(#black-arrow)"
            className="link-line"
            id={`link-${stepId}-to-${step.wasInformedBy &&
              step.wasInformedBy['@id']}`}
          />
        </svg>
      )}
    </>
  );
};

export default StepCard;
