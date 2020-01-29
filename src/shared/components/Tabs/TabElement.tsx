import { Button } from 'antd';
import * as React from 'react';
import { resourcesWritePermissionsWrapper } from '../../utils/permission';

type TabElementProps = {
  id: string;
  label: string;
  description: string;
  onEditClick: (elementId: string) => void;
  studioPermissionsPath?: string;
};

const TabElement: React.FunctionComponent<TabElementProps> = ({
  id,
  label,
  description,
  onEditClick,
  studioPermissionsPath,
}) => {
  const [hover, setHover] = React.useState<boolean>(false);
  const show = hover ? 'block' : 'none';
  const buttonStyle = { display: show };
  const editButton = (
    <Button
      type="primary"
      icon="edit"
      size="small"
      onClick={e => {
        onEditClick(id);
        e.stopPropagation();
      }}
      style={buttonStyle}
    />
  );
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
        {studioPermissionsPath
          ? resourcesWritePermissionsWrapper(editButton, studioPermissionsPath)
          : editButton}
      </div>
    </div>
  );
};

export default TabElement;
