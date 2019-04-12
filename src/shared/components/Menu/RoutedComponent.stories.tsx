import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { withKnobs } from '@storybook/addon-knobs';
import RoutedComponent from './RoutedComponent';
import { Card, Menu } from 'antd';
import MenuItem from 'antd/lib/menu/MenuItem';

storiesOf('Components/Menus/RoutedComponent', module)
  .addDecorator(withKnobs)
  .add(
    'RoutedComponent',
    withInfo(`
    🛤 Use this to make multi-staged menus, for example!

    ~~~js
    <RoutedComponent
            routes={[
              {
                path: '/',
                component: (path, goTo) => <div>Home <a onClick={() => goTo('/about')}About</a></div>
              },
              {
                path: '/',
                component: (path, goTo) => <div>About <a onClick={() => goTo('/')}Home</a></div>
              }
            ]}
          />
  />
    ~~~
  `)(() => {
      return React.createElement(() => {
        const [race, setRace] = React.useState('');
        const [characterClass, setCharacterClass] = React.useState('');
        return (
          <div style={{ margin: '50px 40px 0px', width: 300 }}>
            <Card>
              <div>
                <h2>Adventure Quest!</h2>
                <RoutedComponent
                  routes={[
                    {
                      path: '/',
                      component: (path, goTo) => {
                        const handleClick = (race: string) => () => {
                          setRace(race);
                          goTo('/class');
                        };
                        return (
                          <div>
                            <h3>Choose Your Race</h3>
                            <Menu>
                              <MenuItem onClick={handleClick('Human')}>
                                Human
                              </MenuItem>
                              <MenuItem onClick={handleClick('Elf')}>
                                Elf
                              </MenuItem>
                              <MenuItem onClick={handleClick('Half-Elf')}>
                                Half-Elf
                              </MenuItem>
                              <MenuItem onClick={handleClick('Dwarf')}>
                                Dwarf
                              </MenuItem>
                              <MenuItem onClick={handleClick('Gnome')}>
                                Gnome
                              </MenuItem>
                              <MenuItem onClick={handleClick('Half-Orc')}>
                                Half-Orc
                              </MenuItem>
                            </Menu>
                          </div>
                        );
                      },
                    },
                    {
                      path: '/class',
                      component: (path, goTo) => {
                        const handleClick = (characterCass: string) => () => {
                          setCharacterClass(characterCass);
                          goTo('/done');
                        };
                        const goBack = () => {
                          setRace('');
                          goTo('/');
                        };
                        return (
                          <div>
                            <h3>Choose Your Class</h3>
                            <a onClick={goBack}>Restart</a>
                            <Menu>
                              <MenuItem onClick={handleClick('Rogue')}>
                                Rogue
                              </MenuItem>
                              <MenuItem onClick={handleClick('Fighter')}>
                                Fighter
                              </MenuItem>
                              <MenuItem onClick={handleClick('Wizard')}>
                                Wizard
                              </MenuItem>
                              <MenuItem onClick={handleClick('Druid')}>
                                Druid
                              </MenuItem>
                              <MenuItem onClick={handleClick('Bard')}>
                                Bard
                              </MenuItem>
                              <MenuItem onClick={handleClick('Barbarian')}>
                                Barbarian
                              </MenuItem>
                            </Menu>
                          </div>
                        );
                      },
                    },
                    {
                      path: '/done',
                      component: (path, goTo) => {
                        const handleClick = () => {
                          setCharacterClass('');
                          setRace('');
                          goTo('/');
                        };
                        return (
                          <div>
                            <h1>
                              Prepare to adventure as a {race} {characterClass}!
                            </h1>
                            <a onClick={handleClick}>Restart</a>
                          </div>
                        );
                      },
                    },
                  ]}
                />
              </div>
            </Card>
          </div>
        );
      });
    })
  );
