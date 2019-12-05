import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { text } from '@storybook/addon-knobs';

import DashboardConfigEditorComponent from './DashboardConfigEditor';
import { Card } from 'antd';

storiesOf('Components/StudioWizard/DashboardConfigEditor', module).add(
  'DashboardConfigEditorComponent',
  withInfo(`
    A form to edit Studio Dashboards

    ~~~js
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
            dashboard={{
              label,
              description,
              viewQuery: '',
            }}
          />
        </Card>
      </div>
    );
  })
);
