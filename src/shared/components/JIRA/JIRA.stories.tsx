import { withInfo } from '@storybook/addon-info';
import { withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import JIRAPluginUI from '../JIRA/JIRA';

storiesOf('Components/JIRA', module)
  .addDecorator(withKnobs)
  .add(
    'JIRA',
    withInfo(`

    ~~~js
    ~~~
  `)(() => {
      return (
        <JIRAPluginUI
          issues={[]}
          projects={[]}
          onCreateIssue={(
            project: string,
            summary: string,
            description: string
          ) => {}}
          onLinkIssue={(issueKey: string) => {}}
          onUnlinkIssue={(issueKey: string) => {}}
          isLoading={true}
          searchJiraLink=""
          displayType="resource"
        />
      );
    })
  );
