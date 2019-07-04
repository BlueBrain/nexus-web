import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number } from '@storybook/addon-knobs';

import ProjectItem, { ProjectItemProps } from './ProjectItem';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';

const projects: ProjectItemProps[] = [
  { label: 'thalamus', orgLabel: 'bbp' },
  { label: 'another-project', orgLabel: 'another-org' },
];

storiesOf('Components/Projects', module)
  .addDecorator(withKnobs)
  .add(
    'ProjectCard',
    withInfo(`
      ~~~js
      <ProjectCard name="Thalamus" resourceNumber={1500} />
      ~~~
  `)(() => {
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <ProjectItem label="thalamus" orgLabel="bbp" />
          </div>
        </React.Fragment>
      );
    })
  );

storiesOf('Components/Projects', module)
  .addDecorator(withKnobs)
  .add(
    'ProjectForm',
    withInfo(`
      ~~~js
      ~~~
  `)(() => {
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <ProjectForm />
          </div>
          <div style={{ margin: '50px 40px 0px' }}>
            {/* <ProjectForm
              project={{
                label: 'MyProject',
                rev: 1,
                apiMappings: [
                  { prefix: 'es', namespace: 'http://asdasd' },
                  { prefix: 'ex', namespace: 'http://example.com' },
                ],
              }}

            /> */}
          </div>
        </React.Fragment>
      );
    })
  );
