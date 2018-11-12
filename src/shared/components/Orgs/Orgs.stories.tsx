import React = require('react');
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number } from '@storybook/addon-knobs';

import OrgList from './OrgList';
import OrgCard, { OrgCardProps } from './OrgCard';
import OrgDropdown from './OrgDropdown';
import Header from '../Header';

const logo = require('../../logo.svg');
const orgs: OrgCardProps[] = [
  { name: 'Nexus', projectNumber: 1200 },
  { name: 'BBP', projectNumber: 300 },
  { name: 'HBP', projectNumber: 1 },
  { name: 'NASA', projectNumber: 912839 },
  { name: 'Tesla', projectNumber: 3 },
  { name: 'Rolex', projectNumber: 3424 },
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
              onClick={action('org-click')}
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
          <OrgList orgs={orgs} onOrgClick={action('org-selected')} />
        </div>
      </React.Fragment>
    );
  })
);

storiesOf('Components/Orgs', module)
  .addDecorator(withKnobs)
  .add(
    'OrgDropdown',
    withInfo(`
    The Organization Dropdown is used mainly in the header component.
    It allows to display the selected organization as well as
    navigating and filtering all available organizations.

    ~~~js
      <OrgDropdown />
    ~~~
  `)(() => {
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Organization Dopdown in header</h2>
            <Header name="Mark Hamil" links={[]}>
              <OrgDropdown orgs={orgs} />
            </Header>
          </div>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Organization Dopdown in header</h2>
            <Header name="Mark Hamil" links={[]}>
              <OrgDropdown orgs={orgs} />
            </Header>
          </div>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Organization Dropdown</h2>
            <OrgDropdown orgs={orgs} />
          </div>
        </React.Fragment>
      );
    })
  );
