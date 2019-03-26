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
import AnimatedInfiniteScrollList from './AnimatedInfiniteScrollList';
import { action } from '@storybook/addon-actions';
import { Card } from 'antd';

const exampleItems = [
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
  'http://www.w3.org/ns/prov#Entity',
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
  'http://www.w3.org/ns/dcat#Dataset',
];

storiesOf('Components/AnimatedInfiniteScrollList', module)
  .addDecorator(withKnobs)
  .add(
    'AnimatedInfiniteScrollList',
    withInfo(`
    🗒 Use this tasty component to animate a list of data, with or without pagination!
    The list will use infinite scrolling and append results to the bottom.

    ~~~js
    <AnimatedInfiniteScrollList
            itemComponent={(item: any, index: number) => <p>{item}</p>}
            results={items}
            total={items.length}
            onPaginationChange={action('pagination-change')}
            paginationSettings={paginationSettings}
            loading={loading}
          />
  />
    ~~~
  `)(() => {
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
            <AnimatedInfiniteScrollList
              itemComponent={(item: any, index: number) => <p>{item}</p>}
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
