import { withInfo } from '@storybook/addon-info';
import { withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import JIRAPluginUI from '../JIRA/JIRA';

/**
 * Bunch of errors with Storybook currently. Errors with these stories:
 *
 * Copies.stories.tsx
 * Header.stories.tsx
 * ResourceForm.stories.tsx
 * Views.stories.tsx
 * Studio.stories.tsx
 *
 * Also, issue with the font being bundles in src/shared/lib.less
 *
 */

storiesOf('Components/JIRA', module)
  .addDecorator(withKnobs)
  .add(
    'JIRA',
    withInfo(`

    ~~~js
    ~~~
  `)(() => {
      return <JIRAPluginUI issues={[]} />;
    })
  );
