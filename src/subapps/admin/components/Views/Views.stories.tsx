import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number } from '@storybook/addon-knobs';

import { ViewStatisticsProgress } from './ViewStatisticsProgress';

storiesOf('Components/Views', module)
  .addDecorator(withKnobs)
  .add(
    'ViewStatisticsProgress',
    withInfo(`
    Displays the event processed status of a view:
    - is my view up to date
    - when was is updated last
    - if updating, how far in are we?

    ~~~js
      <ViewStatisticsProgress processEvents={23} totalEvents={100} lastIndexed="2019-06-27T13:37:18.197Z" />
    ~~~
  `)(() => {
      const processedEvents = number('processedEvents', 100);
      const totalEvents = number('totalEvents', 100);
      const lastIndexed = text('lastIndexed', '2019-06-27T13:37:18.197Z');
      return (
        <React.Fragment>
          <ViewStatisticsProgress
            processedEvents={processedEvents}
            totalEvents={totalEvents}
            lastIndexed={lastIndexed}
          />
        </React.Fragment>
      );
    })
  );
