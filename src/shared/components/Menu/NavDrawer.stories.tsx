import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import NavDrawer from './NavDrawer';
import { Button } from 'antd';

storiesOf('Components/Menus/NavDrawer', module)
  .addDecorator(withKnobs)
  .add('NavDrawer', () => {
    return React.createElement(() => {
      return (
        <NavDrawer
          routes={[
            {
              path: '/',
              component: (path, goTo) => {
                return (
                  <div className="page -home">
                    <h1>Hello World</h1>
                  </div>
                );
              },
            },
          ]}
          defaultVisibility={false}
          render={(visible, toggleVisibility) => {
            return (
              <Button
                icon="project"
                size="small"
                onClick={() => toggleVisibility()}
              >
                NavDrawer
              </Button>
            );
          }}
        ></NavDrawer>
      );
    });
  });
