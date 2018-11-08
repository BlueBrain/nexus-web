import React = require('react');
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import OrgCard from './OrgCard';

storiesOf('Components/Orgs/OrgCard', module).add(
  'OrgCard',
  withInfo(`
    The Organization Card component is used across multiple components.
    It displays the the basic Organization informations.

    ~~~js
      <OrgCard />
    ~~~
  `)(() => (
    <React.Fragment>
      <div style={{ margin: '50px 40px 0px' }}>
        <OrgCard name="Bob" projectNumber={123} />
      </div>
      <div style={{ margin: '50px 40px 0px' }}>
        <OrgCard
          name="Bob"
          projectNumber={1}
          logo="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
        />
      </div>
    </React.Fragment>
  ))
);
