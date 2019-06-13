import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';
import { Identity } from '@bbp/nexus-sdk-legacy/lib/ACL/types';

import IdentityBadge from './IdentityBadge';
import ACLView from './ACLView';
import ACLsForm from './ACLsForm';
import { ACL } from '@bbp/nexus-sdk-legacy';

const anonymous: Identity = {
  '@id': 'http://anonymous',
  '@type': 'Anonymous',
};

const group: Identity = {
  '@id': 'http://anonymous',
  '@type': 'Group',
  group: 'nise',
};

const authenticated: Identity = {
  '@id': 'http://anonymous',
  '@type': 'Authenticated',
  realm: 'BBP',
};

const user: Identity = {
  '@id': 'http://anonymous',
  '@type': 'User',
  realm: 'BBP',
  subject: 'machon',
};

const permissions: string[] = [
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
];

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
      return <ACLView identity={anonymous} permissions={permissions} />;
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
      const acl1 = new ACL({
        '@context': '',
        '@type': 'Authenticated',
        '@id': '',
        _createdAt: '',
        _createdBy: '',
        _path: '/myorg',
        _rev: 2,
        _updatedAt: '',
        _updatedBy: '',
        acl: [
          { permissions, identity: anonymous },
          { permissions, identity: group },
        ],
      });
      const acl2 = new ACL({
        '@context': '',
        '@type': 'Authenticated',
        '@id': '',
        _createdAt: '',
        _createdBy: '',
        _path: '/myorg/myproject',
        _rev: 2,
        _updatedAt: '',
        _updatedBy: '',
        acl: [
          { permissions, identity: authenticated },
          { permissions, identity: user },
        ],
      });
      return <ACLsForm acls={[acl1, acl2]} />;
    })
  );
