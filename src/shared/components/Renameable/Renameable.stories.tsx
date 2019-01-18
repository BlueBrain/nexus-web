import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import Renameable from './index';

storiesOf('Components/Renameable', module).add(
  'Renameable Input',
  withInfo(`
    This lets you click to edit some static text

    ~~~js
      <Renameable defaultValue="hello world!" onChange={() => {}} />
    ~~~
  `)(() => (
    <React.Fragment>
      <div style={{ margin: '50px 40px 0px' }}>
        <h2>
          <Renameable
            defaultValue={'This text can be directly editable!'}
            onChange={() => {}}
          />
        </h2>
      </div>
    </React.Fragment>
  ))
);
