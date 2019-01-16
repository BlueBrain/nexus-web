import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number } from '@storybook/addon-knobs';

import ProjectCard, { ProjectCardProps } from './ProjectCard';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';

const projects: ProjectCardProps[] = [
  { name: 'Thalamus', label: 'thalamus', resourceNumber: 1236 },
  { name: 'Another Project', label: 'another-project', resourceNumber: 1 },
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
            <ProjectCard
              name="Thalamus"
              label="thalamus"
              resourceNumber={1500}
            />
          </div>
        </React.Fragment>
      );
    })
  );

storiesOf('Components/Projects', module)
  .addDecorator(withKnobs)
  .add(
    'ProjectList',
    withInfo(`
      ~~~js
      <ProjectList
        projects={projects}
        onProjectClick={action('project-click')}
      />
      ~~~
  `)(() => {
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <ProjectList
              projects={projects}
              onProjectClick={action('project-click')}
            />
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
            <ProjectForm
              project={{
                name: 'My project',
                label: 'Label',
                prefixMappings: [
                  { prefix: 'es', namespace: 'http://asdasd' },
                  { prefix: 'ex', namespace: 'http://example.com' },
                ],
              }}
            />
          </div>
        </React.Fragment>
      );
    })
  );
