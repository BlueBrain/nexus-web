import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number } from '@storybook/addon-knobs';

import {
  ViewStatisticsProgress,
  ViewStatisticsProgressBar,
  ViewStatisticsProgressMini,
} from './ViewStatisticsProgress';

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
      <ViewStatisticsProgress />
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
  )
  .add(
    'ViewStatisticsProgressBar',
    withInfo(`
    Displays the event processed status of a view:
    - is my view up to date
    - when was is updated last
    - if updating, how far in are we?

    ~~~js
      <ViewStatisticsProgressBar />
    ~~~
  `)(() => {
      const processedEvents = number('processedEvents', 100);
      const totalEvents = number('totalEvents', 100);
      const lastIndexed = text('lastIndexed', '2019-06-27T13:37:18.197Z');
      return (
        <React.Fragment>
          <ViewStatisticsProgressBar
            processedEvents={processedEvents}
            totalEvents={totalEvents}
            lastIndexed={lastIndexed}
          />
        </React.Fragment>
      );
    })
  )
  .add(
    'ViewStatisticsProgressMini',
    withInfo(`
    Displays the event processed status of a view:
    - is my view up to date
    - when was is updated last
    - if updating, how far in are we?

    ~~~js
      <ViewStatisticsProgressMini />
    ~~~
  `)(() => {
      const processedEvents = number('processedEvents', 100);
      const totalEvents = number('totalEvents', 100);
      const lastIndexed = text('lastIndexed', '2019-06-27T13:37:18.197Z');
      return (
        <React.Fragment>
          <ViewStatisticsProgressMini
            processedEvents={processedEvents}
            totalEvents={totalEvents}
            lastIndexed={lastIndexed}
          />
        </React.Fragment>
      );
    })
  );
