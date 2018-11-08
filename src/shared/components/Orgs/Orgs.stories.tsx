import React = require('react');
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number } from '@storybook/addon-knobs';

import OrgList from './OrgList';
import OrgCard, { OrgCardProps } from './OrgCard';
const logo = require('../../logo.svg');

const orgs: OrgCardProps[] = [
  { name: 'Nexus', projectNumber: 1200 },
  { name: 'BBP', projectNumber: 300 },
  { name: 'HBP', projectNumber: 1 },
];

storiesOf('Components/Orgs', module)
  .addDecorator(withKnobs)
  .add(
    'OrgCard',
    withInfo(`
    The Organization Card component is used across multiple components.
    It displays the the basic Organization informations.

    ~~~js
      <OrgCard />
    ~~~
  `)(() => {
      const org = text('Organization', 'Nexus');
      const projects = number('Project', 1);
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>No logo</h2>
            <OrgCard name="BBP" projectNumber={123} />
          </div>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Logo and edit button</h2>
            <OrgCard
              name={org}
              projectNumber={projects}
              logo={logo}
              onEdit={action('edit-button-click')}
            />
          </div>
        </React.Fragment>
      );
    })
  );

storiesOf('Components/Orgs', module).add(
  'OrgList',
  withInfo(`
    The Organization List component is a collection of Organization Card Components.
    It allows to filter Organizations by name.

    ~~~js
      <OrgCard />
    ~~~
  `)(() => {
    return (
      <React.Fragment>
        <div style={{ margin: '50px 40px 0px' }}>
          <OrgList orgs={orgs} />
        </div>
      </React.Fragment>
    );
  })
);
