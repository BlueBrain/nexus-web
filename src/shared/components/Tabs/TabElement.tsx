import { Button } from 'antd';
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
  const [hover, setHover] = React.useState<boolean>(false);
  const show = hover ? 'block' : 'none';
  const buttonStyle = { display: show };
  return (
    <div
      className="tab-element-container"
      onMouseOver={() => {
        setHover(true);
      }}
      onMouseOut={() => {
        setHover(false);
      }}
    >
      <div className="tab-item">
        <span className="title ellipsis">{label}</span>
        <p className="description fade">{description}</p>
      </div>
      <div className={'edit-button-container'}>
        <div style={buttonStyle}>{editButton ? editButton(id) : null}</div>
      </div>
    </div>
  );
};

export default TabElement;
