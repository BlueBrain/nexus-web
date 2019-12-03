import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip, Icon } from 'antd';

const HomeIcon: React.FunctionComponent<{}> = () => (
  <Link to="/">
    <Tooltip title="Back to all organizations" placement="right">
      <Icon type="home" />
    </Tooltip>
  </Link>
);

export default HomeIcon;