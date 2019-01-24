import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { text } from '@storybook/addon-knobs';
import Copy from './index';
import { Button } from 'antd';

storiesOf('Components/Copy', module).add(
  'Copy',
  withInfo(`
    📋 Use this tasty component to add a copy-to-clipboard functionality wherever you need it!
    It uses a render function to pass state and callback to children, which can be anything you want!

    ~~~js
    <Copy
    textToCopy={textToCopy}
    render={(copySuccess, triggerCopy) => (
      <Button size="small" icon="copy" onClick={() => triggerCopy()}>
        {copySuccess ? 'Copied!' : textToCopy}
      </Button>
    )}
  />
    ~~~
  `)(() => {
    const textToCopy = text('Text to Copy', 'Some great text!');
    return (
      <>
        <div style={{ margin: '50px 40px 0px' }}>
          <h2>Copy {textToCopy}</h2>
          <Copy
            textToCopy={textToCopy}
            render={(copySuccess, triggerCopy) => (
              <Button icon="copy" onClick={() => triggerCopy()}>
                {copySuccess ? 'Copied!' : textToCopy}
              </Button>
            )}
          />
        </div>
      </>
    );
  })
);
