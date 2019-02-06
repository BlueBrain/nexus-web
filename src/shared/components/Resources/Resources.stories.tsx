import React = require('react');
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number, boolean } from '@storybook/addon-knobs';

import ResourceList from './ResourceList';
import ResourceItem, { ResourceItemProps } from './ResourceItem';

const exampleResources = [
  {
    '@id':
      'https://bbp.epfl.ch/nexus/v0/data/bbp/morphology/reconstructedcell/v0.1.0/0033b254-d748-4ef7-bcb1-ca20e418a26b',
    '@type': [
      'http://www.w3.org/ns/dcat#Dataset',
      'http://www.w3.org/ns/prov#Entity',
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
    ],
    'http://www.w3.org/ns/dcat#distribution': {
      '@type': 'http://www.w3.org/ns/dcat#Distribution',
      _byteSize: 1095424,
      _digest: {
        _algorithm: 'SHA-256',
        _value:
          '5e4e214c2772af10bd81d2b538d506bb8b78f4425d2bcf646253cb7682177fc0',
      },
      _downloadURL:
        'https://bbp.epfl.ch/nexus/v1/resources/anorg/testcore/datashapes:reconstructedpatchedcell/https%3A%2F%2Fbbp.epfl.ch%2Fnexus%2Fv0%2Fdata%2Fbbp%2Fmorphology%2Freconstructedcell%2Fv0.1.0%2F0033b254-d748-4ef7-bcb1-ca20e418a26b/attachments/mtC060400A_idA.asc',
      _mediaType: 'text/plain; charset=UTF-8',
      _originalFileName: 'mtC060400A_idA.asc',
    },
    _self:
      'https://bbp.epfl.ch/nexus/v1/resources/anorg/testcore/datashapes:reconstructedpatchedcell/https%3A%2F%2Fbbp.epfl.ch%2Fnexus%2Fv0%2Fdata%2Fbbp%2Fmorphology%2Freconstructedcell%2Fv0.1.0%2F0033b254-d748-4ef7-bcb1-ca20e418a26b',
    _constrainedBy: 'https://neuroshapes.org/dash/reconstructedpatchedcell',
    _project: 'https://bbp.epfl.ch/nexus/v1/projects/anorg/testcore',
    _createdAt: '2018-11-15T08:00:03.640Z',
    _createdBy:
      'https://bbp.epfl.ch/nexus/v1/realms/BBP/users/f:9d46ddd6-134e-44d6-aa74-bdf00f48dfce:sy',
    _updatedAt: '2018-11-27T09:27:24.143Z',
    _updatedBy:
      'https://bbp.epfl.ch/nexus/v1/realms/BBP/users/f:9d46ddd6-134e-44d6-aa74-bdf00f48dfce:sy',
    _rev: 182,
    _deprecated: false,
  },
  {
    '@id':
      'https://bbp.epfl.ch/nexus/v0/data/bbp/morphology/reconstructedcell/v0.1.0/00727f2a-4703-41d4-abae-40e48df77089',
    '@type': [
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
      'http://www.w3.org/ns/prov#Entity',
      'http://www.w3.org/ns/dcat#Dataset',
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
    ],
    'http://www.w3.org/ns/dcat#distribution': {
      '@type': 'http://www.w3.org/ns/dcat#Distribution',
      _byteSize: 513059,
      _digest: {
        _algorithm: 'SHA-256',
        _value:
          '1287c67db3aaac7940cec3f8406d8673063d5035218af6b1e9a2fce73b08cc01',
      },
      _downloadURL:
        'https://bbp.epfl.ch/nexus/v1/resources/anorg/testcore/datashapes:reconstructedpatchedcell/https%3A%2F%2Fbbp.epfl.ch%2Fnexus%2Fv0%2Fdata%2Fbbp%2Fmorphology%2Freconstructedcell%2Fv0.1.0%2F00727f2a-4703-41d4-abae-40e48df77089/attachments/mtC120501B_idC.asc',
      _mediaType: 'text/plain; charset=UTF-8',
      _originalFileName: 'mtC120501B_idC.asc',
    },
    _self:
      'https://bbp.epfl.ch/nexus/v1/resources/anorg/testcore/datashapes:reconstructedpatchedcell/https%3A%2F%2Fbbp.epfl.ch%2Fnexus%2Fv0%2Fdata%2Fbbp%2Fmorphology%2Freconstructedcell%2Fv0.1.0%2F00727f2a-4703-41d4-abae-40e48df77089',
    _constrainedBy: 'https://neuroshapes.org/dash/reconstructedpatchedcell',
    _project: 'https://bbp.epfl.ch/nexus/v1/projects/anorg/testcore',
    _createdAt: '2018-11-15T08:02:42.868Z',
    _createdBy:
      'https://bbp.epfl.ch/nexus/v1/realms/BBP/users/f:9d46ddd6-134e-44d6-aa74-bdf00f48dfce:sy',
    _updatedAt: '2018-11-26T10:59:05.377Z',
    _updatedBy:
      'https://bbp.epfl.ch/nexus/v1/realms/BBP/users/f:9d46ddd6-134e-44d6-aa74-bdf00f48dfce:sy',
    _rev: 43,
    _deprecated: false,
  },
  {
    '@id':
      'https://bbp.epfl.ch/nexus/v0/data/bbp/morphology/reconstructedcell/v0.1.0/0076e75c-bbab-47cc-b84b-51a1a921ba3f',
    '@type': [
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
      'http://www.w3.org/ns/prov#Entity',
      'http://www.w3.org/ns/dcat#Dataset',
    ],
    'http://www.w3.org/ns/dcat#distribution': {
      '@type': 'http://www.w3.org/ns/dcat#Distribution',
      _byteSize: 1851164,
      _digest: {
        _algorithm: 'SHA-256',
        _value:
          'e3c63372d7e584cfd09e550ae1472ee13790f17a666063877b188d37b3d8158c',
      },
      _downloadURL:
        'https://bbp.epfl.ch/nexus/v1/resources/anorg/testcore/datashapes:reconstructedpatchedcell/https%3A%2F%2Fbbp.epfl.ch%2Fnexus%2Fv0%2Fdata%2Fbbp%2Fmorphology%2Freconstructedcell%2Fv0.1.0%2F0076e75c-bbab-47cc-b84b-51a1a921ba3f/attachments/og060523b1-2_idA.asc',
      _mediaType: 'text/plain; charset=UTF-8',
      _originalFileName: 'og060523b1-2_idA.asc',
    },
    _self:
      'https://bbp.epfl.ch/nexus/v1/resources/anorg/testcore/datashapes:reconstructedpatchedcell/https%3A%2F%2Fbbp.epfl.ch%2Fnexus%2Fv0%2Fdata%2Fbbp%2Fmorphology%2Freconstructedcell%2Fv0.1.0%2F0076e75c-bbab-47cc-b84b-51a1a921ba3f',
    _constrainedBy: 'https://neuroshapes.org/dash/reconstructedpatchedcell',
    _project: 'https://bbp.epfl.ch/nexus/v1/projects/anorg/testcore',
    _createdAt: '2018-11-15T08:43:14.331Z',
    _createdBy:
      'https://bbp.epfl.ch/nexus/v1/realms/BBP/users/f:9d46ddd6-134e-44d6-aa74-bdf00f48dfce:sy',
    _updatedAt: '2018-11-26T10:59:13.829Z',
    _updatedBy:
      'https://bbp.epfl.ch/nexus/v1/realms/BBP/users/f:9d46ddd6-134e-44d6-aa74-bdf00f48dfce:sy',
    _rev: 39,
    _deprecated: false,
  },
  {
    '@id':
      'https://bbp.epfl.ch/nexus/v0/data/bbp/morphology/reconstructedcell/v0.1.0/00081ecd-bcc9-4f60-b44c-bd20f9126ce3',
    '@type': [
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
      'http://www.w3.org/ns/dcat#Dataset',
      'http://www.w3.org/ns/prov#Entity',
      'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
    ],
    'http://www.w3.org/ns/dcat#distribution': {
      '@type': 'http://www.w3.org/ns/dcat#Distribution',
      _byteSize: 350546,
      _digest: {
        _algorithm: 'SHA-256',
        _value:
          '2890a9c7c7b1ac782a863e160ea9801f23c6e94be0cb98dd83e3715fdfb4541c',
      },
      _downloadURL:
        'https://bbp.epfl.ch/nexus/v1/resources/anorg/testcore/datashapes:reconstructedpatchedcell/https%3A%2F%2Fbbp.epfl.ch%2Fnexus%2Fv0%2Fdata%2Fbbp%2Fmorphology%2Freconstructedcell%2Fv0.1.0%2F00081ecd-bcc9-4f60-b44c-bd20f9126ce3/attachments/tkb061101a2_ch5_ct_h_zk_60x_1.asc',
      _mediaType: 'text/plain; charset=UTF-8',
      _originalFileName: 'tkb061101a2_ch5_ct_h_zk_60x_1.asc',
    },
    _self:
      'https://bbp.epfl.ch/nexus/v1/resources/anorg/testcore/datashapes:reconstructedpatchedcell/https%3A%2F%2Fbbp.epfl.ch%2Fnexus%2Fv0%2Fdata%2Fbbp%2Fmorphology%2Freconstructedcell%2Fv0.1.0%2F00081ecd-bcc9-4f60-b44c-bd20f9126ce3',
    _constrainedBy: 'https://neuroshapes.org/dash/reconstructedpatchedcell',
    _project: 'https://bbp.epfl.ch/nexus/v1/projects/anorg/testcore',
    _createdAt: '2018-11-15T08:44:19.944Z',
    _createdBy:
      'https://bbp.epfl.ch/nexus/v1/realms/BBP/users/f:9d46ddd6-134e-44d6-aa74-bdf00f48dfce:sy',
    _updatedAt: '2018-11-27T23:58:40.224Z',
    _updatedBy:
      'https://bbp.epfl.ch/nexus/v1/realms/BBP/users/f:9d46ddd6-134e-44d6-aa74-bdf00f48dfce:sy',
    _rev: 195,
    _deprecated: false,
  },
];

const resources: ResourceItemProps[] = exampleResources.map(
  (item, index: number) => ({
    index,
    id: item['@id'],
    constrainedBy: item._constrainedBy,
    type: Array.isArray(item['@type']) ? item['@type'] : [item['@type']],
    createdAt: item._createdAt,
    updatedAt: item._updatedAt,
  })
);

storiesOf('Components/Resources', module)
  .addDecorator(withKnobs)
  .add(
    'ResourceListItem',
    withInfo(`
    The ResourceListItem displays minimal resource metadata so it
    can be used in collections

    ~~~js
      <ResourceListItem />
    ~~~
  `)(() => {
      const id = text(`id`, resources[0].id);
      const name = text('Name', null);
      const constrainedBy = text('constrainedBy', resources[0].constrainedBy);
      const type = resources[0].type;
      const createdAt = resources[0].createdAt;
      const updatedAt = resources[0].updatedAt;
      const index = resources[0].index;
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Simple Example</h2>
            <ResourceItem
              id={id}
              name={name}
              type={type}
              constrainedBy={constrainedBy}
              updatedAt={updatedAt}
              createdAt={createdAt}
              index={index}
              onClick={action('resource-click')}
            />
          </div>
        </React.Fragment>
      );
    })
  );

storiesOf('Components/Resources', module)
  .addDecorator(withKnobs)
  .add(
    'ResourceList',
    withInfo(`
    The ResourceList component is a collection of ResourceListItem components.

    ~~~js
      <ResourceList />
    ~~~
  `)(() => {
      const loading = boolean('Loading', false);
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            {/* <ResourceList resources={resources} loading={loading} /> */}
          </div>
        </React.Fragment>
      );
    })
  );
