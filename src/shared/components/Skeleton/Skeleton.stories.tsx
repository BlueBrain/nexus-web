import React = require('react');
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import Skeleton from './';

storiesOf('Components/Misc', module).add(
  'Skeleton',
  withInfo(`
    The Skeleton component

    ~~~js
      <Skeleton paragraphNumber={3} />
    ~~~
  `)(() => (
    <React.Fragment>
      <div style={{ margin: '50px 40px 0px' }}>
        <h2>Just one Skeleton</h2>
        <Skeleton itemNumber={1} active />
      </div>
      <div style={{ margin: '50px 40px 0px' }}>
        <h2>Lots of Skeletons</h2>
        <Skeleton itemNumber={5} />
      </div>
    </React.Fragment>
  ))
);
