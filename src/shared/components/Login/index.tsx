import * as React from 'react';
import { Card, Dropdown, Icon, Menu } from 'antd';

import './Login.less';

const logo = require('../../logo.svg');

export type Realm = {
  name: string;
  authorizationEndpoint: string;
};

export interface LoginProps {
  realms: Realm[];
  busy?: boolean;
}

const Login: React.SFC<LoginProps> = ({ realms }) => {
  const [realm, setRealm] = React.useState(realms[0]);

  const menu = (
    <Menu
      onClick={({ key }) => setRealm(realms.filter(r => r.name === key)[0])}
    >
      {realms.map(realm => (
        <Menu.Item key={realm.name}>{realm.name}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className="Login">
      <Card
        cover={<img className="logo" alt="Nexus logo" src={logo} />}
        actions={[
          <a className="link" key="login" href={realm.authorizationEndpoint}>
            {realms.length === 1 ? (
              'Log in '
            ) : (
              <React.Fragment>
                Log in with{' '}
                <Dropdown overlay={menu}>
                  <span className="realm">{realm.name}</span>
                </Dropdown>{' '}
              </React.Fragment>
            )}
            <Icon type="login" />
          </a>,
        ]}
      >
        <p className="message">Please log in to continue.</p>
      </Card>
    </div>
  );
};

export default Login;
