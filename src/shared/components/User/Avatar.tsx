import * as React from 'react';
import { Tooltip, Avatar } from 'antd';

export interface AvatarProps {
  createdBy: string;
}

const UserAvatar: React.FunctionComponent<AvatarProps> = props => {
  const { createdBy } = props;
  const [name] = createdBy.split('/').slice(-1);
  const color = `#${+Math.floor(Math.random() * 16777215).toString(16)}`;
  return (
    <Tooltip title={name}>
      <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
        {name[0].toUpperCase()}
      </Avatar>
    </Tooltip>
  );
};

export default UserAvatar;
