import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import SideMenu from './SideMenu';
import { Divider, Button } from 'antd';

storiesOf('Components/SideMenu', module)
  .addDecorator(withKnobs)
  .add(
    'SideMenu',
    withInfo(`
    🌭 Use this tasty component to create a fixed, hovering side-menu that pops over from the right!

    ~~~js
    <SideMenu title={title} visible={open} onClose={action('on-close')}>
            <Button type="primary">Serious Button</Button>
            <Button>Another Button</Button>
            <Divider />
            <p>You had better pay attention to this important text!</p>
          </SideMenu>
  />
    ~~~
  `)(() => {
      const title = text('Title', 'What a header!');
      const open = boolean('Opened?', true);
      return (
        <div style={{ margin: '50px 40px 0px' }}>
          <h2>Side Menu</h2>
          <SideMenu title={title} visible={open} onClose={action('on-close')}>
            <Button type="primary" style={{ width: '100%', margin: '1em 0' }}>
              Serious Button
            </Button>
            <Button style={{ width: '100%', margin: '1em 0' }}>
              Another Button
            </Button>
            <Divider />
            <p>You had better pay attention to this important text!</p>
          </SideMenu>
        </div>
      );
    })
  );
