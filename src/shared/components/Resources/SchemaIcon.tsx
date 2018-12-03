import * as React from 'react';
import { Avatar, Tooltip } from 'antd';

import './Resources.less';

export interface SchemaIconProps {
  // TODO make special ID URL type?
  id: string;
}

const DEFAULT_SCHEMA_NAME = 'schema';

const color = '#f56a00';

const SchemaIcon: React.SFC<SchemaIconProps> = ({ id }) => {
  const firstLetter = (id.split('/').pop() || DEFAULT_SCHEMA_NAME)[0];
  return (
    <Tooltip title={id}>
      <Avatar
        style={{ backgroundColor: color, verticalAlign: 'middle' }}
        size="large"
      >
        {firstLetter}
      </Avatar>
    </Tooltip>
  );
};

export default SchemaIcon;
