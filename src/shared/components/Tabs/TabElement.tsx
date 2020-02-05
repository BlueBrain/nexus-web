import { Tooltip } from 'antd';
import * as React from 'react';

type TabElementProps = {
  id: string;
  label: string;
  description: string;
  editButton?: (id: string) => React.ReactNode;
};

const TabElement: React.FunctionComponent<TabElementProps> = ({
  id,
  label,
  description,
  editButton,
}) => {
  return (
    <div className="tab-element-container">
      <Tooltip title={description}>
        <div className="tab-item">
          <span className="title ellipsis">{label}</span>
          <div className={'edit-button-container'}>
            <div>{editButton ? editButton(id) : null}</div>
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

export default TabElement;
