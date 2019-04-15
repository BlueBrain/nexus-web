import * as React from 'react';
import { Button, Popover } from 'antd';
import { WorkspaceSelectorContainerProps } from './workspaceSelectorContainer';
import { Organization, Project } from '@bbp/nexus-sdk';
import RoutedComponent from '../../Menu/RoutedComponent';
import InfiniteScroll from '../../Animations/InfiniteScroll';
import ListItem from '../../Animations/ListItem';

export interface WorkspaceSelectorMenuProps
  extends WorkspaceSelectorContainerProps {}

const WorkspaceSelectorMenu: React.FunctionComponent<
  WorkspaceSelectorMenuProps
> = props => {
  const {
    activeOrg,
    activeProject,
    orgs,
    fetchOrgs,
    displayPerPage,
    selectOrg,
  } = props;
  const next = () => {
    fetchOrgs({
      size: displayPerPage,
      from: (orgs.data && orgs.data.index + 1) || 0,
    });
  };
  return (
    <div style={{ width: '300px', height: '50vh' }}>
      <RoutedComponent
        routes={[
          {
            path: '/',
            component: (path, goTo) => {
              const handleClick = (orgLabel: string) => {
                selectOrg(orgLabel);
                goTo('/projects');
              };
              return (
                <div>
                  <h3>Select an Org</h3>
                  <InfiniteScroll
                    loadNextPage={next}
                    fetchablePaginatedList={orgs}
                    makeKey={({ label, description }, index) => label}
                    itemComponent={(
                      { label, description }: any,
                      index: number
                    ) => {
                      return (
                        <ListItem
                          onClick={handleClick}
                          label={label}
                          description={description}
                          id={label}
                        />
                      );
                    }}
                  />
                </div>
              );
            },
          },
          {
            path: '/projects',
            component: (path, goTo) => {
              // const handleClick = (characterCass: string) => () => {
              //   setCharacterClass(characterCass);
              //   goTo('/done');
              // };
              const goBack = () => {
                goTo('/');
              };
              return (
                <div>
                  <h3>Select Project</h3>
                  <a onClick={goBack}>Restart</a>
                </div>
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default WorkspaceSelectorMenu;
