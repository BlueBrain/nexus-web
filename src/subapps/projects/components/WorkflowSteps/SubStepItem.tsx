import './SubStepItem.scss';

import { Tooltip } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { StepResource } from '../../types';
import StatusIcon from '../StatusIcon';

const MAX_TITLE_LENGTH = 45;

const SubActivityItem: React.FC<{
  orgLabel: string;
  projectLabel: string;
  substep: StepResource;
}> = ({ substep, orgLabel, projectLabel }) => {
  const { name, status } = substep;

  return (
    <div className="substep-item">
      <StatusIcon status={status} mini={true} />
      <div className="substep-item__content">
        <Link to={`/workflow/${orgLabel}/${projectLabel}/${encodeURIComponent(substep['@id'])}`}>
          {name.length > MAX_TITLE_LENGTH ? (
            <Tooltip placement="topRight" title={name}>
              <h3 className="substep-item__title">{`${name.slice(0, MAX_TITLE_LENGTH)}...`}</h3>
            </Tooltip>
          ) : (
            <h3 className="substep-item__title">{name}</h3>
          )}
        </Link>
      </div>
    </div>
  );
};

export default SubActivityItem;
