import * as React from 'react';
import { Tooltip, Avatar } from 'antd';

export interface AvatarProps {
  createdBy: string;
}

const UserAvatar: React.FunctionComponent<AvatarProps> = props => {
  const { createdBy } = props;
  const [name] = createdBy.split('/').slice(-1);
  return (
    <Tooltip title={name}>
      <Avatar size="large">{name[0].toUpperCase()}</Avatar>
    </Tooltip>
  );
};

export default UserAvatar;
