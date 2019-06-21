import * as React from 'react';
import { Project } from '@bbp/nexus-sdk-legacy';
import NavigationMenuComponent from './Component';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';

interface MenuProps {
  render: (
    visible: boolean,
    toggleVisibility: () => void
  ) => React.ReactElement<any>;
}

const NavMenuContainer: React.FunctionComponent<MenuProps> = props => {
  const { render } = props;
  const dispatch = useDispatch();

  const goToProject = (project: Project) =>
    dispatch(push(`/${project.orgLabel}/${project.label}`));

  return (
    <NavigationMenuComponent
      {...{
        render,
        goToProject,
      }}
    />
  );
};

export default NavMenuContainer;
