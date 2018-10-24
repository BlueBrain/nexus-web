import React = require('react');
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import Header from './index';

storiesOf('Components/Header', module)
  .add('Header', withInfo(`
    The header component is used throughout the application.

    It is used to display navigation links

    ~~~js
    <Header links={[
      <a href="#">Home</a>,
      <a href="#">Settings</a>,
    ]} />
    ~~~
  `)(() => <Header links={[
    <a href="#">Home</a>,
    <a href="#">Settings</a>,
  ]} />,
));
