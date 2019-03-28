import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import {
  withKnobs,
  text,
  array,
  object,
  boolean,
  number,
} from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import InfiniteScroll from './InfiniteScroll';

const exampleItems = [
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
  'http://www.w3.org/ns/prov#Entity',
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
  'http://www.w3.org/ns/dcat#Dataset',
];

storiesOf('Components/InfiniteScroll', module)
  .addDecorator(withKnobs)
  .add(
    'InfiniteScroll',
    withInfo(`
    Scroll all the way down and ask for more!

    ~~~js
    <InfiniteScroll
            makeKey={item => item}
            itemComponent={(item: any, index: number) => <p>{item}</p>}
            items={items}
            total={items.length}
            next={action('pagination-change')}
            loading={loading}
          />
  />
    ~~~
  `)(() => {
      const items = array(`Items`, exampleItems);
      const loading = boolean('Loading', false);
      return (
        <div style={{ margin: '50px 40px 0px' }}>
          <h2>InfiniteScroll</h2>
          <InfiniteScroll
            type="onClick"
            makeKey={item => item}
            itemComponent={(item: any, index: number) => <p>{item}</p>}
            items={items}
            total={items.length}
            next={action('pagination-change')}
            loading={loading}
          />
        </div>
      );
    })
  );
