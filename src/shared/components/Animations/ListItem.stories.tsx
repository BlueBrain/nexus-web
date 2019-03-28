import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import {
  withKnobs,
  text,
  array,
  object,
  boolean,
} from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import ListItem from './ListItem';
import { Tag, Button } from 'antd';

const exampleItems = [
  {
    label: 'nexus',
    projectNumber: 1200,
    description:
      "Yeah, but your scientists were so preoccupied with whether or not they could, they didn't stop to think if they should. You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager? They're using our own satellites against us. And the clock is ticking.",
  },
  { label: 'bbp', projectNumber: 300, deprecated: true, action: true },
  { label: 'hbp', projectNumber: 1 },
  {
    label: 'nasa',
    projectNumber: 912839,
    description:
      "God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. Hey, you know how I'm, like, always trying to save the planet? Here's my chance. You really think you can fly that thing? Did he just throw my cat out of the window?",
  },
  { label: 'tesla', projectNumber: 3, deprecated: true },
  { label: 'rolex', projectNumber: 3424 },
];

storiesOf('Components/ListItem', module)
  .addDecorator(withKnobs)
  .add(
    'ListItem',
    withInfo(`
    🗒 Try this on for size when you want to render consistent list elements

    ~~~js
    <ListItem label={"Hi mom!"} />
    ~~~
  `)(() => {
      return (
        <div style={{ margin: '50px 40px 0px', width: '50%' }}>
          <p>Good for many use cases, eh?</p>
          <ul>
            {exampleItems.map((element, index) => {
              const {
                label,
                action: elementAction,
                projectNumber,
                description,
                deprecated,
              } = element;
              return (
                <ListItem
                  key={`element-${index}`}
                  label={label}
                  onClick={action('element-clicked')}
                  detail={
                    <div style={{ display: 'flex' }}>
                      {deprecated && <Tag color="red">deprecated</Tag>}
                      {projectNumber && (
                        <div>
                          <span className="number">{projectNumber}</span>{' '}
                          project{projectNumber > 1 && 's'}
                        </div>
                      )}
                    </div>
                  }
                  description={description}
                  action={
                    elementAction ? (
                      <Button
                        icon="edit"
                        className="edit-button"
                        size="small"
                        type="primary"
                        tabIndex={1}
                        onClick={() => action('edit-clicked')}
                      />
                    ) : (
                      undefined
                    )
                  }
                />
              );
            })}
          </ul>
        </div>
      );
    })
  );
