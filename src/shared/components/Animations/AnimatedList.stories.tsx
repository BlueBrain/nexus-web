import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import {
  withKnobs,
  text,
  array,
  object,
  boolean,
} from '@storybook/addon-knobs';
import AnimatedList from './AnimatedList';
import { action } from '@storybook/addon-actions';
import { Card } from 'antd';

const exampleItems = [
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
  'http://www.w3.org/ns/prov#Entity',
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
  'http://www.w3.org/ns/dcat#Dataset',
];

storiesOf('Components/AnimatedList', module)
  .addDecorator(withKnobs)
  .add(
    'AnimatedList',
    withInfo(`
    🗒 Use this tasty component to animate a list of data, with or without pagination!

    ~~~js
    <AnimatedList
            header={<p>{headerText}</p>}
            itemComponent={(item: any, index: number) => <p>{item}</p>}
            itemName="Resource"
            results={items}
            total={items.length}
            onPaginationChange={action('pagination-change')}
            paginationSettings={paginationSettings}
            loading={loading}
          />
  />
    ~~~
  `)(() => {
      const headerText = text('Header Text', 'What a header!');
      const items = array(`Items`, exampleItems);
      const loading = boolean('Loading', false);
      const defaultPaginationSettings = {
        from: 0,
        total: items.length,
        pageSize: 2,
      };
      const paginationSettings = object(
        'Pagination Settings',
        defaultPaginationSettings
      );
      return (
        <div style={{ margin: '50px 40px 0px' }}>
          <Card>
            <h2>Animated List</h2>
            <AnimatedList
              header={<p>{headerText}</p>}
              itemComponent={(item: any, index: number) => <p>{item}</p>}
              itemName="Resource"
              results={items}
              total={items.length}
              onPaginationChange={action('pagination-change')}
              paginationSettings={paginationSettings}
              loading={loading}
            />
          </Card>
        </div>
      );
    })
  );
