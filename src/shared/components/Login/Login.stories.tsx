import React = require('react');
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import Login, { Realm } from './index';

const realms: Realm[] = [
  {
    name: 'BBP',
    authorizationEndpoint: '/#BBP',
  },
  {
    name: 'HBP',
    authorizationEndpoint: '/#HBP',
  },
  {
    name: 'Google',
    authorizationEndpoint: '/#Google',
  },
];

storiesOf('Components/Login', module).add(
  'Login',
  withInfo(`
    The Login component allows to redirect to the Auth Provider page.

    ~~~js
      <Login loginURL="https://keycloak.org?redirect=https://bbp.epfl.ch/nexus/" />
    ~~~
  `)(() => (
    <React.Fragment>
      <div style={{ margin: '50px 40px 0px' }}>
        <h2>1 Realm to choose from:</h2>
        <Login
          clientId="nexus-web"
          hostName="http://nexus"
          realms={[realms[0]]}
        />
      </div>
      <div style={{ margin: '50px 40px 0px' }}>
        <h2>3 Realms to choose from:</h2>
        <Login clientId="nexus-web" hostName="http://nexus" realms={realms} />
      </div>
    </React.Fragment>
  ))
);
