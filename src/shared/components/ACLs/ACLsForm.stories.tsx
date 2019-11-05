import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';
import { Identity } from '@bbp/nexus-sdk-legacy/lib/ACL/types';

import IdentityBadge from './IdentityBadge';
import ACLCard from './ACLCard';
import ACLsForm from './ACLsForm';
import { ACL } from '@bbp/nexus-sdk';

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
    'ACLCard',
    withInfo(`
    ~~~js
      <ACLCard
       />
    ~~~
  `)(() => {
      const i: Identity = {
        '@id': 'asdas',
        '@type': 'Anonymous',
      };
      return <ACLCard identity={anonymous} permissions={permissions} />;
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
      const acl1: ACL = {
        '@context': '',
        '@type': 'AccessControlList',
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
      };
      const acl2: ACL = {
        '@context': '',
        '@type': 'AccessControlList',
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
      };
      return <ACLsForm acls={[acl1, acl2]} path="/myorg/myproject" />;
    })
  );
