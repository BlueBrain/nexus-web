import React = require('react');
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import Login from './index';

storiesOf('Components/Login', module).add(
  'Login',
  withInfo(`
    The Login component allows to redirect to the Auth Provider page.

    ~~~js
      <Login loginURL="https://keycloak.org?redirect=https://bbp.epfl.ch/nexus/" />
    ~~~
  `)(() => (
    <div style={{ margin: '50px 40px 0px' }}>
      <Login loginURL="" />
    </div>
  ))
);
