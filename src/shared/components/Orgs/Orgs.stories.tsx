import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number } from '@storybook/addon-knobs';

import OrgList from './OrgList';
import OrgItem, { OrgItemProps } from './OrgItem';
import OrgForm from './OrgForm';

const orgs: OrgItemProps[] = [
  { label: 'nexus', numProjects: 1200 },
  { label: 'bbp', numProjects: 300 },
  { label: 'hbp', numProjects: 1 },
  { label: 'nasa', numProjects: 912839 },
  { label: 'tesla' },
  { label: 'rolex', numProjects: 3424 },
];

storiesOf('Components/Orgs', module)
  .addDecorator(withKnobs)
  .add(
    'OrgItem',
    withInfo(`
    The Organization Card component is used across multiple components.
    It displays the the basic Organization informations.

    ~~~js
      <OrgItem />
    ~~~
  `)(() => {
      const label = text('Label', 'nexus');
      const projects = number('Project', 1);
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>No logo</h2>
            <OrgItem numProjects={123} label="bbp" />
          </div>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Logo and edit button</h2>
            <OrgItem
              label={label}
              numProjects={projects}
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
      <OrgItem />
    ~~~
  `)(() => {
    return (
      <React.Fragment>
        <div style={{ margin: '50px 40px 0px' }}>
          <OrgList
            orgs={orgs}
            onOrgClick={action('org-selected')}
            onPaginationChange={action('pagination-change')}
            paginationSettings={{ total: 20, from: 1, pageSize: 20 }}
          />
        </div>
      </React.Fragment>
    );
  })
);

storiesOf('Components/Orgs', module)
  .addDecorator(withKnobs)
  .add(
    'OrgForm',
    withInfo(`

    ~~~js
    ~~~
  `)(() => {
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <OrgForm />
          </div>
        </React.Fragment>
      );
    })
  );
