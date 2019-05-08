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

const makePreview = () => {
  const images = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Morocco_Africa_Flickr_Rosino_December_2005_84514010.jpg/800px-Morocco_Africa_Flickr_Rosino_December_2005_84514010.jpg',
    'https://i.gifer.com/embedded/download/7U30.gif',
    'https://cdn.jsdelivr.net/emojione/assets/3.1/png/32/1f31e.png',
    'https://upload.wikimedia.org/wikipedia/commons/3/34/Gusev_Crater%2C_Mars.jpg',
  ];
  const image = new Image();
  image.src = images[Math.floor(Math.random() * Math.floor(images.length))];
  return {
    image,
    loading: false,
    hasImage: true,
  };
};

const exampleItems = [
  {
    label: 'nexus',
    projectNumber: 1200,
    preview: makePreview(),
    description:
      "Yeah, but your scientists were so preoccupied with whether or not they could, they didn't stop to think if they should. You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager? They're using our own satellites against us. And the clock is ticking.",
  },
  {
    label: 'bbp',
    projectNumber: 300,
    deprecated: true,
    action: true,
    preview: makePreview(),
  },
  {
    label: 'hbp',
    projectNumber: 1,
    preview: makePreview(),
  },
  {
    label: 'nasa',
    projectNumber: 912839,
    description:
      "God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. Hey, you know how I'm, like, always trying to save the planet? Here's my chance. You really think you can fly that thing? Did he just throw my cat out of the window?",
  },
  { label: 'tesla', projectNumber: 3, deprecated: true },
  {
    label: 'rolex',
    projectNumber: 3424,
    preview: makePreview(),
  },
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
          <ul style={{ margin: 0, padding: 0 }}>
            {exampleItems.map((element, index) => {
              const {
                preview,
                label,
                action: elementAction,
                projectNumber,
                description,
                deprecated,
              } = element;
              return (
                <ListItem
                  id={`element-${index}`}
                  preview={preview}
                  label={label}
                  onClick={action('element-clicked')}
                  details={
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
                        onClick={(
                          e: React.MouseEvent<HTMLButtonElement, MouseEvent>
                        ) => {
                          action('edit-clicked')();
                          e.stopPropagation();
                        }}
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
