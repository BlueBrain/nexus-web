import * as React from 'react';
import { Card, Dropdown, Icon, Menu } from 'antd';

import './Login.less';

const logo = require('../../logo.svg');

export type Realm = {
  name: string;
  authorizationEndpoint: string;
};

export interface LoginProps {
  realms: string[];
  onLogin?(e: React.SyntheticEvent): void;
  onRealmSelected?(name: string): void;
}

const Login: React.FunctionComponent<LoginProps> = ({
  realms,
  onLogin = () => {},
  onRealmSelected = () => {},
}) => {
  const [realm, setRealm] = React.useState(realms[0]);

  const menu = (
    <Menu
      onClick={({ key, domEvent }) => {
        domEvent.stopPropagation();
        const realm = realms.find(r => r === key);
        if (realm) {
          setRealm(realm);
          onRealmSelected(realm);
        }
      }}
    >
      {realms.map(realm => (
        <Menu.Item key={realm}>{realm}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className="Login">
      <Card
        cover={<img className="logo" alt="Nexus logo" src={logo} />}
        actions={[
          <a onClick={onLogin} className="link" key="login">
            {realms.length === 1 ? (
              'Log in '
            ) : (
              <React.Fragment>
                Log in with{' '}
                <Dropdown overlay={menu}>
                  <span className="realm">{realm}</span>
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
