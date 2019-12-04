import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { text } from '@storybook/addon-knobs';

import DashboardConfigEditorComponent from './DashboardConfigEditor';
import { Card } from 'antd';

const viewList = {
  '@context': [
    'https://bluebrain.github.io/nexus/contexts/search.json',
    'https://bluebrain.github.io/nexus/contexts/resource.json',
  ],
  _total: 2,
  _results: [
    {
      '@id': 'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
      '@type': [
        'https://bluebrain.github.io/nexus/vocabulary/View',
        'https://bluebrain.github.io/nexus/vocabulary/SparqlView',
      ],
      _self: 'https://nexusinstance.io/v1/views/bbp/nmc/graph',
      _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/view.json',
      _project: 'https://nexusinstance.io/v1/projects/bbp/nmc',
      _rev: 1,
      _deprecated: false,
      _createdAt: '2019-12-04T09:18:40.953214Z',
      _createdBy: 'https://nexusinstance.io/v1/realms/bbp/users/kenny',
      _updatedAt: '2019-12-04T09:18:40.953214Z',
      _updatedBy: 'https://nexusinstance.io/v1/realms/bbp/users/kenny',
      _incoming: 'https://nexusinstance.io/v1/views/bbp/nmc/graph/incoming',
      _outgoing: 'https://nexusinstance.io/v1/views/bbp/nmc/graph/outgoing',
    },
    {
      '@id': 'https://mynamespace.com/myViewId',
      '@type': [
        'https://bluebrain.github.io/nexus/vocabulary/View',
        'https://bluebrain.github.io/nexus/vocabulary/SparqlView',
      ],
      _self: 'https://nexusinstance.io/v1/views/bbp/nmc/myViewId',
      _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/view.json',
      _project: 'https://nexusinstance.io/v1/projects/bbp/nmc',
      _rev: 1,
      _deprecated: false,
      _createdAt: '2019-12-04T09:18:40.953214Z',
      _createdBy: 'https://nexusinstance.io/v1/realms/bbp/users/kenny',
      _updatedAt: '2019-12-04T09:18:40.953214Z',
      _updatedBy: 'https://nexusinstance.io/v1/realms/bbp/users/kenny',
      _incoming: 'https://nexusinstance.io/v1/views/bbp/nmc/graph/incoming',
      _outgoing: 'https://nexusinstance.io/v1/views/bbp/nmc/graph/outgoing',
    },
  ],
  _next:
    'https://nexusinstance.io/v1/views/bbp/nmc?after=%5B1575451120953,%22https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex%22%5D',
};

storiesOf('Components/StudioWizard/DashboardQueryEditor', module).add(
  'DashboardQueryEditor',
  withInfo(`
    A form to edit Studio Dashboards

    ~~~js
    <DashboardQueryEditorComponent />
    ~~~
  `)(() => {
    const label = text('label', 'A good, honest label!');
    const description = text('Description', 'Some great text!');
    return (
      <div
        style={{
          display: 'flex',
        }}
      >
        <Card
          title="Creating a Dashboard"
          bordered={false}
          style={{ width: 600, margin: '1em' }}
        >
          <DashboardConfigEditorComponent />
        </Card>
        <Card
          title="Editing a Dashboard"
          bordered={false}
          style={{ width: 600, margin: '1em' }}
        >
          <DashboardConfigEditorComponent
            viewList={viewList}
            dashboardViewParing={{
              dashboard: {
                label,
                description,
              },
              view: {
                '@id': 'nxv:defaultSparqlView',
              },
            }}
          />
        </Card>
      </div>
    );
  })
);
