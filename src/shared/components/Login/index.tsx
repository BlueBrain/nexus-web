import * as React from 'react';
import { Card, Icon } from 'antd';

import './Login.less';

const logo = require('../../logo.svg');

export interface LoginProps {
  loginURL: string;
}

const Login: React.SFC<LoginProps> = ({ loginURL }) => (
  <div className="Login">
    <Card
      cover={<img className="logo" alt="Nexus logo" src={logo} />}
      actions={[
        <a key="login" href={loginURL}>
          Login <Icon type="login" />
        </a>,
      ]}
    >
      <p className="message">please login to continue.</p>
    </Card>
  </div>
);

export default Login;
