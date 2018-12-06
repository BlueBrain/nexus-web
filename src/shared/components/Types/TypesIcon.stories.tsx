import React = require('react');
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, array, boolean } from '@storybook/addon-knobs';

import TypesIcon, { TypesIconProps } from './TypesIcon';

const exampleTypes = [
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
  'http://www.w3.org/ns/prov#Entity',
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
  'http://www.w3.org/ns/dcat#Dataset',
];

storiesOf('Components/Types/TypeIcon', module)
  .addDecorator(withKnobs)
  .add(
    'TypesIcon',
    withInfo(`
    The TypesIcon will show a resource's type or types
    (there are often more than one) in a unified way
    with some functionality to perform actions on each type
    (such as callbacks for filtering)

    ~~~js
      <TypesIcon />
    ~~~
  `)(() => {
      const type = array(`type`, exampleTypes);
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Simple Example With A List</h2>
            <TypesIcon type={type} />
          </div>

          <div style={{ margin: '50px 40px 0px' }}>
            <h2>With just a string (URL)</h2>
            <TypesIcon type={[exampleTypes[0]]} />
          </div>
        </React.Fragment>
      );
    })
  );
