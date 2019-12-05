import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';

import StudioList from './StudioList';

const studios = [
  {
    id: 'thalamus',
    name: 'Thalamus',
  },
  {
    id: 'sscx',
    name: 'SSCx',
    description: 'Somatosensory Cortex project',
  },
];

storiesOf('Components/Studio', module)
  .addDecorator(withKnobs)
  .add(
    'StudioList',
    withInfo(`
  `)(() => {
      const busy = boolean('busy', false);
      return (
        <div style={{ width: 400 }}>
          <h3>List of studios</h3>
          <StudioList
            studios={studios}
            busy={busy}
            goToStudio={action('studio click')}
          />
          <br />
          <h3>Empty list</h3>
          <StudioList studios={[]} busy={busy} />
          <br />
          <h3>Error</h3>
          <StudioList
            studios={[]}
            busy={busy}
            error={new Error('Not authorized')}
          />
        </div>
      );
    })
  );
