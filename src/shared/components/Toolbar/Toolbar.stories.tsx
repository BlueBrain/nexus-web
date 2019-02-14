import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';
import Toolbar from './Toolbar';
import { action } from '@storybook/addon-actions';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';

const identities: Identity[] = [
  {
    '@id': 'http://anonymous.com',
    '@type': 'Anonymous',
  },
  {
    '@id': 'http://',
    '@type': 'Authenticated',
    realm: 'bbp',
  },
  {
    '@id': 'http://',
    '@type': 'Group',
    realm: 'bbp',
    group: 'mygroup',
  },
  {
    '@id': 'http://',
    '@type': 'User',
    realm: 'bbp',
    subject: 'julien',
  },
  {
    '@id': 'http://',
    '@type': 'User',
    realm: 'bbp',
    subject: 'kenny',
  },
];
storiesOf('Components/Toolbar', module)
  .addDecorator(withKnobs)
  .add(
    'Toolbar',
    withInfo(`
    ~~~js
      <Toolbar />
    ~~~
  `)(() => {
      const projectName = text("Project's name", 'BBP Nexus');
      return (
        <Toolbar
          projectName={projectName}
          onProjectNameChange={action('onProjectNameChange')}
          identities={identities}
          onNewPermissionSelected={action('onNewPermissionSelected')}
        />
      );
    })
  );
