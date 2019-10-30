import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number, boolean } from '@storybook/addon-knobs';
import ResourceForm from './ResourceForm';

storiesOf('Components/Resources', module)
  .addDecorator(withKnobs)
  .add(
    'ResourceForm',
    withInfo('Any resource creation form')(() => {
      return <ResourceForm />;
    })
  );
