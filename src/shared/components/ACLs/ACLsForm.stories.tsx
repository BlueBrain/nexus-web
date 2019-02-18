import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';

import IdentityBadge from './IdentityBadge';
import ACLView from './ACLView';
import ACLsForm from './ACLsForm';

const anonymous: Identity = {
  '@id': 'asdas',
  '@type': 'Anonymous',
};
storiesOf('Components/ACLs', module)
  .addDecorator(withKnobs)
  .add(
    'Identity',
    withInfo(`
    ~~~js
      <IdentityBadge
       />
    ~~~
  `)(() => {
      const i: Identity = {
        '@id': 'asdas',
        '@type': 'Anonymous',
      };
      return <IdentityBadge {...i} />;
    })
  )
  .add(
    'ACLView',
    withInfo(`
    ~~~js
      <ACLView
       />
    ~~~
  `)(() => {
      const i: Identity = {
        '@id': 'asdas',
        '@type': 'Anonymous',
      };
      return (
        <ACLView
          identity={anonymous}
          permissions={[
            'schemas/write',
            'views/write',
            'files/write',
            'permissions/write',
            'acls/write',
            'realms/write',
            'projects/read',
            'acls/read',
            'organizations/create',
            'organizations/write',
            'resources/write',
            'realms/read',
            'projects/create',
            'permissions/read',
            'resources/read',
            'organizations/read',
            'resolvers/write',
            'events/read',
            'views/query',
            'projects/write',
          ]}
        />
      );
    })
  )
  .add(
    'ACLs',
    withInfo(`
    ~~~js
      <ACLs
       />
    ~~~
  `)(() => {
      return <ACLsForm acls={[]} />;
    })
  );
