import * as React from 'react';
import { Card, Dropdown, Menu, Button } from 'antd';
import { LoginOutlined, DownOutlined } from '@ant-design/icons';
import logo from '../../images/logo.svg';

import './Login.scss';


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
        cover={<img src={logo} className="login-logo" alt="Nexus logo" />}
        size="small"
        bodyStyle={{ borderTop: '1px solid rgba(0, 0, 0, 0.10)' }}
      >
        {realms.length === 1 ? (
          <Button
            className="login-button"
            block
            onClick={onLogin}
            type="primary"
          >
            Log in
            <LoginOutlined />
          </Button>
        ) : (
          <div className="actions">
            <Button className="login-button" onClick={onLogin} type="primary">
              Log in
              <LoginOutlined />
            </Button>
            <div className="realm-holder">
              <span> with </span>
              <Dropdown overlay={menu} trigger={['click', 'hover']}>
                <span className="realm">
                  {realm} <DownOutlined />
                </span>
              </Dropdown>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;
