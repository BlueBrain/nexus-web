import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import * as React from 'react';

const PluginInfo: React.FC<{
  plugin: any;
}> = ({ plugin }) => {
  const { name, description, version, author } = plugin;

  const PopoverContent = () => {
    return (
      <div>
        <p>{description || 'No description provided'}</p>
        <p>
          <b>Created by: </b>
          {author || 'Unknown'}
        </p>
        <p>
          <b>Version: </b>
          {version || 'No version specified'}
        </p>
      </div>
    );
  };

  return (
    <Popover
      content={<PopoverContent />}
      trigger="click"
      title={name}
      placement="bottomRight"
    >
      <Button
        onClick={event => event.stopPropagation()}
        size="small"
        icon={<InfoCircleOutlined />}
      />
    </Popover>
  );
};

export default PluginInfo;
