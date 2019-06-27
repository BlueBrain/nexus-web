import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import {
  withKnobs,
  text,
  number,
  knob,
  boolean,
  select,
} from '@storybook/addon-knobs';

import OrgList from './OrgList';
import OrgCard, { OrgCardProps } from './OrgCard';
import OrgForm from './OrgForm';
import Header from '../Header';
import { type } from 'os';

const logo = require('../../logo.svg');
const orgs: OrgCardProps[] = [
  { label: 'nexus', projectNumber: 1200 },
  { label: 'bbp', projectNumber: 300 },
  { label: 'hbp', projectNumber: 1 },
  { label: 'nasa', projectNumber: 912839 },
  { label: 'tesla', projectNumber: 3 },
  { label: 'rolex', projectNumber: 3424 },
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
      const label = text('Label', 'nexus');
      const projects = number('Project', 1);
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>No logo</h2>
            <OrgCard projectNumber={123} label="bbp" />
          </div>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Logo and edit button</h2>
            <OrgCard
              label={label}
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
