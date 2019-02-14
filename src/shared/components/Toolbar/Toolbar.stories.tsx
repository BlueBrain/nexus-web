import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';
import Toolbar from './Toolbar';
import { action } from '@storybook/addon-actions';

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
        />
      );
    })
  );
