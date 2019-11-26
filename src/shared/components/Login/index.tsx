import * as React from 'react';
import { Card, Dropdown, Icon, Menu } from 'antd';

import './Login.less';

const logo = require('../../logo.svg');

export interface LoginProps {
  realms: string[];
  selectedRealm?: string;
  onLogin?(e: React.SyntheticEvent): void;
  onRealmSelected?(name: string): void;
}

const Login: React.FunctionComponent<LoginProps> = ({
  realms,
  selectedRealm,
  onLogin = () => {},
  onRealmSelected = () => {},
}) => {
  const [realm, setRealm] = React.useState(selectedRealm || realms[0]);

  const menu = (
    <Menu
      onClick={({ key, domEvent }) => {
        domEvent.preventDefault();
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
          <div>
            {realms.length === 1 ? (
              <span>Log in </span>
            ) : (
              <React.Fragment>
                <span>Log in with{' '}</span>
                <Dropdown overlay={menu} trigger={['click', 'hover']}>
                  <span className="realm">{realm}</span>
                </Dropdown>{' '}
              </React.Fragment>
            )}
            <a onClick={onLogin} className="link" key="login">
              <Icon type="login" />
            </a>
          </div>,
        ]}
      >
        <p className="message">Please log in to continue.</p>
      </Card>
    </div>
  );
};

export default Login;
