import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import Login from './index';

const realms: string[] = ['BBP', 'HBP', 'Google'];

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
        <Login realms={[realms[0]]} />
      </div>
      <div style={{ margin: '50px 40px 0px' }}>
        <h2>3 Realms to choose from:</h2>
        <Login realms={realms} />
      </div>
    </React.Fragment>
  ))
);
